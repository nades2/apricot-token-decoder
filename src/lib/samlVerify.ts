import { canonicalize } from "./c14n";
import { base64ToBytes } from "./base64";

// Vérification de signature XML-DSig (RSA-SHA256 / ECDSA, enveloppée) pour SAML.
// Best-effort : canonicalisation inclusive C14N 1.0. Couvre la majorité des assertions.

export type SamlVerifyResult =
  | { status: "valid"; method: string }
  | { status: "invalid"; method: string; reason: string }
  | { status: "error"; message: string };

const DIGEST_ALGS: Record<string, string> = {
  "http://www.w3.org/2001/04/xmlenc#sha256": "SHA-256",
  "http://www.w3.org/2001/04/xmldsig-more#sha384": "SHA-384",
  "http://www.w3.org/2001/04/xmlenc#sha512": "SHA-512",
  "http://www.w3.org/2000/09/xmldsig#sha1": "SHA-1",
};

const SIG_ALGS: Record<string, { name: string; hash: string }> = {
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256": { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384": { name: "RSASSA-PKCS1-v1_5", hash: "SHA-384" },
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512": { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
  "http://www.w3.org/2000/09/xmldsig#rsa-sha1": { name: "RSASSA-PKCS1-v1_5", hash: "SHA-1" },
  "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256": { name: "ECDSA", hash: "SHA-256" },
};

const DSIG = "http://www.w3.org/2000/09/xmldsig#";

function el(parent: Element | Document, local: string): Element | null {
  return parent.getElementsByTagNameNS(DSIG, local)[0] || null;
}

function pemFromCert(b64: string): ArrayBuffer {
  return base64ToBytes(b64.replace(/\s/g, "")).buffer as ArrayBuffer;
}

export async function verifySamlSignature(
  xml: string,
  certBase64?: string
): Promise<SamlVerifyResult> {
  try {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    if (doc.querySelector("parsererror")) {
      return { status: "error", message: "XML invalide." };
    }
    const sig = doc.getElementsByTagNameNS(DSIG, "Signature")[0];
    if (!sig) return { status: "error", message: "Aucune signature XML-DSig trouvée." };

    const signedInfo = el(sig, "SignedInfo");
    if (!signedInfo) return { status: "error", message: "SignedInfo introuvable." };

    const sigMethod =
      el(signedInfo, "SignatureMethod")?.getAttribute("Algorithm") || "";
    const sigParams = SIG_ALGS[sigMethod];
    if (!sigParams)
      return { status: "error", message: `Algorithme de signature non géré : ${sigMethod}` };

    // 1) Vérifier le digest de la référence
    const ref = el(signedInfo, "Reference");
    const digestMethod =
      el(ref!, "DigestMethod")?.getAttribute("Algorithm") || "";
    const digestHash = DIGEST_ALGS[digestMethod];
    const expectedDigest = el(ref!, "DigestValue")?.textContent?.trim() || "";
    const refUri = ref?.getAttribute("URI") || "";

    let referenced: Element = doc.documentElement;
    if (refUri.startsWith("#")) {
      const id = refUri.slice(1);
      referenced =
        findById(doc, id) || doc.documentElement;
    }

    // Transformation enveloppée : retirer l'élément Signature avant canonicalisation
    const clone = referenced.cloneNode(true) as Element;
    const sigInClone = clone.getElementsByTagNameNS(DSIG, "Signature")[0];
    if (sigInClone && sigInClone.parentNode) sigInClone.parentNode.removeChild(sigInClone);

    const canonRef = canonicalize(clone);
    const computedDigest = await sha(digestHash, canonRef);
    if (computedDigest !== expectedDigest) {
      return {
        status: "invalid",
        method: sigParams.hash,
        reason: "Le digest de la référence ne correspond pas (contenu altéré ou C14N différente).",
      };
    }

    // 2) Vérifier la signature sur SignedInfo canonicalisé
    const canonSignedInfo = canonicalize(signedInfo);
    const signatureValue = el(sig, "SignatureValue")?.textContent?.replace(/\s/g, "") || "";
    const sigBytes = base64ToBytes(signatureValue);

    const cert =
      certBase64 ||
      sig.getElementsByTagNameNS(DSIG, "X509Certificate")[0]?.textContent?.trim();
    if (!cert) return { status: "error", message: "Aucun certificat / clé publique fourni." };

    const key = await crypto.subtle.importKey(
      "spki",
      await spkiFromCert(cert),
      sigParams.name === "ECDSA"
        ? { name: "ECDSA", namedCurve: "P-256" }
        : { name: sigParams.name, hash: sigParams.hash },
      false,
      ["verify"]
    );

    const verifyAlg =
      sigParams.name === "ECDSA"
        ? { name: "ECDSA", hash: sigParams.hash }
        : { name: sigParams.name };
    const ok = await crypto.subtle.verify(
      verifyAlg,
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(canonSignedInfo) as BufferSource
    );
    return ok
      ? { status: "valid", method: sigParams.hash }
      : { status: "invalid", method: sigParams.hash, reason: "Signature cryptographique invalide." };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}

function findById(doc: Document, id: string): Element | null {
  const all = doc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const e = all[i];
    if (
      e.getAttribute("ID") === id ||
      e.getAttribute("Id") === id ||
      e.getAttribute("id") === id
    )
      return e;
  }
  return null;
}

async function sha(hash: string, text: string): Promise<string> {
  const buf = await crypto.subtle.digest(hash, new TextEncoder().encode(text) as BufferSource);
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// La clé publique pour Web Crypto doit être au format SPKI. Un X509Certificate
// fournit une clé ; pour rester sans dépendance on tente d'abord un import direct
// (certaines clés sont déjà des SPKI), sinon on extrait la SPKI du certificat DER.
async function spkiFromCert(certB64: string): Promise<ArrayBuffer> {
  const der = new Uint8Array(pemFromCert(certB64));
  // Recherche de la SubjectPublicKeyInfo dans le certificat DER (heuristique :
  // séquence d'OID RSA/EC). Si l'entrée est déjà une clé SPKI, on la renvoie telle quelle.
  const spki = extractSpki(der);
  return (spki ?? der).buffer as ArrayBuffer;
}

// Extraction minimale de la SPKI depuis un certificat X.509 DER.
function extractSpki(der: Uint8Array): Uint8Array | null {
  // OID rsaEncryption 1.2.840.113549.1.1.1 -> 06 09 2A 86 48 86 F7 0D 01 01 01
  const rsaOid = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01];
  const idx = indexOfSeq(der, rsaOid);
  if (idx < 0) return null;
  // Remonter au SEQUENCE (0x30) qui englobe AlgorithmIdentifier + BIT STRING.
  let start = idx - 1;
  while (start > 0 && der[start] !== 0x30) start--;
  // Décoder la longueur pour délimiter la SPKI.
  const { length, headerLen } = readLen(der, start + 1);
  const end = start + 1 + headerLen + length;
  return der.slice(start, end);
}

function indexOfSeq(hay: Uint8Array, needle: number[]): number {
  outer: for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

function readLen(der: Uint8Array, pos: number): { length: number; headerLen: number } {
  const first = der[pos];
  if (first < 0x80) return { length: first, headerLen: 1 };
  const n = first & 0x7f;
  let length = 0;
  for (let i = 0; i < n; i++) length = (length << 8) | der[pos + 1 + i];
  return { length, headerLen: 1 + n };
}
