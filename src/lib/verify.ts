import { base64UrlToBytes, base64ToBytes, textToBytes } from "./base64";

// Vérification de signature JWT via l'API Web Crypto native (aucune lib externe).

export type VerifyResult =
  | { status: "valid"; alg: string }
  | { status: "invalid"; alg: string }
  | { status: "error"; message: string };

interface AlgParams {
  name: string;
  hash?: string;
  namedCurve?: string;
}

const RSA_ALGS: Record<string, AlgParams> = {
  RS256: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  RS384: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-384" },
  RS512: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
  PS256: { name: "RSA-PSS", hash: "SHA-256" },
  PS384: { name: "RSA-PSS", hash: "SHA-384" },
  PS512: { name: "RSA-PSS", hash: "SHA-512" },
};
const EC_ALGS: Record<string, AlgParams> = {
  ES256: { name: "ECDSA", hash: "SHA-256", namedCurve: "P-256" },
  ES384: { name: "ECDSA", hash: "SHA-384", namedCurve: "P-384" },
  ES512: { name: "ECDSA", hash: "SHA-512", namedCurve: "P-521" },
};
const HMAC_ALGS: Record<string, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  return base64ToBytes(b64).buffer as ArrayBuffer;
}

function signingInput(token: string): Uint8Array {
  const idx = token.lastIndexOf(".");
  return textToBytes(token.slice(0, idx));
}

async function importKeyForAlg(
  alg: string,
  keyMaterial: string
): Promise<CryptoKey> {
  const trimmed = keyMaterial.trim();
  // JWK ?
  if (trimmed.startsWith("{")) {
    const jwk = JSON.parse(trimmed);
    return importJwk(alg, jwk);
  }
  // PEM
  if (RSA_ALGS[alg]) {
    const p = RSA_ALGS[alg];
    return crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(trimmed),
      { name: p.name, hash: p.hash! },
      false,
      ["verify"]
    );
  }
  if (EC_ALGS[alg]) {
    const p = EC_ALGS[alg];
    return crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(trimmed),
      { name: p.name, namedCurve: p.namedCurve! },
      false,
      ["verify"]
    );
  }
  if (HMAC_ALGS[alg]) {
    return crypto.subtle.importKey(
      "raw",
      textToBytes(trimmed) as BufferSource,
      { name: "HMAC", hash: HMAC_ALGS[alg] },
      false,
      ["sign"]
    );
  }
  throw new Error(`Algorithme non pris en charge : ${alg}`);
}

async function importJwk(alg: string, jwk: JsonWebKey): Promise<CryptoKey> {
  if (RSA_ALGS[alg]) {
    const p = RSA_ALGS[alg];
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: p.name, hash: p.hash! },
      false,
      ["verify"]
    );
  }
  if (EC_ALGS[alg]) {
    const p = EC_ALGS[alg];
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: p.name, namedCurve: p.namedCurve! },
      false,
      ["verify"]
    );
  }
  if (HMAC_ALGS[alg]) {
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "HMAC", hash: HMAC_ALGS[alg] },
      false,
      ["sign"]
    );
  }
  throw new Error(`Algorithme non pris en charge : ${alg}`);
}

// JWKS: { keys: [ ... ] } — on choisit la clé par kid sinon la première compatible.
export function selectJwk(
  jwksOrJwk: string,
  kid?: string
): string {
  const parsed = JSON.parse(jwksOrJwk);
  if (Array.isArray(parsed.keys)) {
    const keys: JsonWebKey[] = parsed.keys;
    const match =
      (kid && keys.find((k) => (k as { kid?: string }).kid === kid)) ||
      keys[0];
    if (!match) throw new Error("Aucune clé trouvée dans le JWKS.");
    return JSON.stringify(match);
  }
  return jwksOrJwk;
}

export async function verifyJwt(
  token: string,
  alg: string,
  keyMaterial: string,
  kid?: string
): Promise<VerifyResult> {
  try {
    if (alg === "none") {
      return { status: "error", message: "Algorithme « none » : aucune signature à vérifier." };
    }
    let material = keyMaterial.trim();
    if (material.startsWith("{") && material.includes('"keys"')) {
      material = selectJwk(material, kid);
    }
    const key = await importKeyForAlg(alg, material);
    const data = signingInput(token);
    const sig = base64UrlToBytes(token.slice(token.lastIndexOf(".") + 1));

    if (HMAC_ALGS[alg]) {
      const computed = await crypto.subtle.sign("HMAC", key, data as BufferSource);
      const ok = bytesEqual(new Uint8Array(computed), sig);
      return ok ? { status: "valid", alg } : { status: "invalid", alg };
    }

    let verifyAlg: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
    if (RSA_ALGS[alg]?.name === "RSA-PSS") {
      verifyAlg = { name: "RSA-PSS", saltLength: hashLen(RSA_ALGS[alg].hash!) };
    } else if (EC_ALGS[alg]) {
      verifyAlg = { name: "ECDSA", hash: EC_ALGS[alg].hash! };
    } else {
      verifyAlg = { name: "RSASSA-PKCS1-v1_5" };
    }
    const ok = await crypto.subtle.verify(
      verifyAlg,
      key,
      sig as BufferSource,
      data as BufferSource
    );
    return ok ? { status: "valid", alg } : { status: "invalid", alg };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}

function hashLen(hash: string): number {
  return hash === "SHA-256" ? 32 : hash === "SHA-384" ? 48 : 64;
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
