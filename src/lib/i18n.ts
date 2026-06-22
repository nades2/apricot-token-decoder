import { createContext, useContext } from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, string>;

export const translations: Record<Lang, Dict> = {
  fr: {
    "brand.subtitle": "JWT · OAuth2 · OIDC · SAML",
    "theme.toLight": "Passer en thème clair",
    "theme.toDark": "Passer en thème sombre",
    "lang.label": "Langue",
    "trust": "Tout se passe dans votre navigateur. Aucun jeton n'est envoyé, stocké ou journalisé.",
    "tab.jwt": "JWT",
    "tab.saml": "SAML",
    "tab.compare": "Comparer",
    "footer": "Apricot Token Decoder · outil 100 % local, open source · aucune donnée conservée",
    "common.loadExample": "Charger un exemple",
    "common.absent": "— absent",

    "jwt.inputLabel": "Jeton JWT encodé",
    "jwt.placeholder": "Collez votre JWT (eyJ...)",
    "jwt.header": "Header",
    "jwt.payload": "Payload",

    "sig.title": "Vérification de signature",
    "sig.secretLabel": "Secret partagé (HMAC)",
    "sig.keyLabel": "Clé publique PEM · JWK · JWKS",
    "sig.secretPlaceholder": "votre-secret",
    "sig.keyPlaceholder": "-----BEGIN PUBLIC KEY-----\n...  ou  { \"kty\": \"RSA\", ... }",
    "sig.verify": "Vérifier",
    "sig.verifying": "Vérification…",
    "sig.valid": "Signature valide",
    "sig.invalid": "Signature invalide",

    "saml.inputLabel": "Réponse / assertion SAML (XML, base64 ou base64+deflate)",
    "saml.placeholder": "Collez le SAML (XML brut, ou encodé base64 / redirect)…",
    "saml.signed": "Signé (XML-DSig)",
    "saml.condOk": "Conditions de validité OK",
    "saml.condNotYet": "Pas encore valide",
    "saml.condExpired": "Expiré",
    "saml.xmlDecoded": "XML décodé",
    "saml.summary": "Résumé",
    "saml.verifyTitle": "Vérifier la signature",
    "saml.certLabel": "Certificat X.509 (base64, optionnel si inclus dans le XML)",
    "saml.certPlaceholder": "MIIC... (contenu de <X509Certificate>)",
    "saml.verifyBtn": "Vérifier XML-DSig",
    "saml.noSignature": "Aucune signature",
    "saml.validShort": "Valide",
    "saml.sigValid": "Signature valide",
    "saml.sigInvalid": "Signature invalide",

    "cmp.intro": "Collez deux jetons — JWT (OAuth2/OIDC) ou SAML. Le type est détecté automatiquement et les champs comparables sont mis en regard.",
    "cmp.tokenA": "Jeton A",
    "cmp.tokenB": "Jeton B",
    "cmp.placeholder": "eyJ… (JWT) ou <saml:Assertion…> / base64",
    "cmp.kindJwt": "JWT / OIDC",
    "cmp.kindSaml": "SAML",
    "cmp.mixed": "Vous comparez un jeton {a} avec un {b}. La comparaison reste possible mais les champs n'ont pas la même sémantique.",
    "cmp.diffs": "différence(s) détectée(s)",
    "cmp.legendChanged": "modifié",
    "cmp.legendAdded": "ajouté",
    "cmp.legendRemoved": "retiré",
    "cmp.hideSame": "Masquer les champs identiques",
    "cmp.colField": "Champ",
    "cmp.noDiff": "Aucune différence — les deux jetons sont identiques.",
    "cmp.empty": "Collez deux jetons (JWT ou SAML) pour comparer leurs champs.",

    "err.jwt.format": "Un JWT doit comporter trois sections séparées par des points.",
    "err.jwt.header": "Le header n'est pas un JSON base64url valide.",
    "err.jwt.payload": "Le payload n'est pas un JSON base64url valide.",
    "err.saml.invalid_xml": "XML invalide : impossible de parser le document.",
    "err.saml.no_signature": "Aucune signature XML-DSig trouvée.",
    "err.saml.no_signedinfo": "SignedInfo introuvable.",
    "err.saml.no_cert": "Aucun certificat / clé publique fourni.",
    "err.saml.digest": "Le digest de la référence ne correspond pas (contenu altéré ou C14N différente).",
    "err.saml.crypto": "Signature cryptographique invalide.",
    "err.saml.unsupported_sig": "Algorithme de signature non géré : {alg}",
    "err.format.unknown": "Format non reconnu : collez un JWT (eyJ…) ou une assertion SAML (XML ou base64).",
    "err.alg.none": "Algorithme « none » : aucune signature à vérifier.",
    "err.alg.unsupported": "Algorithme non pris en charge : {alg}",

    "claim.iss": "Émetteur du jeton (issuer)",
    "claim.sub": "Sujet — identifiant de l'utilisateur",
    "claim.aud": "Audience — destinataire(s) prévu(s)",
    "claim.exp": "Expiration",
    "claim.nbf": "Valide à partir de (not before)",
    "claim.iat": "Émis le (issued at)",
    "claim.jti": "Identifiant unique du jeton",
    "claim.azp": "Partie autorisée (authorized party)",
    "claim.scope": "Portées (scopes) accordées",
    "claim.nonce": "Valeur anti-rejeu (OIDC)",
    "claim.auth_time": "Heure d'authentification",
    "claim.acr": "Niveau d'assurance d'authentification",
    "claim.amr": "Méthodes d'authentification utilisées",
    "claim.at_hash": "Hash du access token",
    "claim.c_hash": "Hash du code d'autorisation",
    "claim.email": "Adresse e-mail",
    "claim.email_verified": "E-mail vérifié",
    "claim.name": "Nom complet",
    "claim.preferred_username": "Nom d'utilisateur préféré",
    "claim.given_name": "Prénom",
    "claim.family_name": "Nom de famille",
    "claim.roles": "Rôles",
    "claim.groups": "Groupes",
    "claim.client_id": "Identifiant client OAuth2",
    "claim.typ": "Type de jeton",
    "claim.alg": "Algorithme de signature",
    "claim.kid": "Identifiant de clé (key id)",

    "val.expired": "Jeton expiré ({rel}).",
    "val.expiresIn": "Expire {rel}.",
    "val.notYet": "Pas encore valide ({rel}).",
    "val.validNow": "Période de validité atteinte.",
    "val.futureIat": "Émis dans le futur — horloges désynchronisées ?",
    "val.issuedAt": "Émis {rel}.",
    "rel.in": "dans {label}",
    "rel.ago": "il y a {label}",
    "rel.lessThan": "moins d'1 s",
    "unit.d": "j", "unit.h": "h", "unit.min": "min", "unit.s": "s",
  },
  en: {
    "brand.subtitle": "JWT · OAuth2 · OIDC · SAML",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "lang.label": "Language",
    "trust": "Everything runs in your browser. No token is ever sent, stored or logged.",
    "tab.jwt": "JWT",
    "tab.saml": "SAML",
    "tab.compare": "Compare",
    "footer": "Apricot Token Decoder · 100% local, open source · nothing is stored",
    "common.loadExample": "Load an example",
    "common.absent": "— absent",

    "jwt.inputLabel": "Encoded JWT",
    "jwt.placeholder": "Paste your JWT (eyJ...)",
    "jwt.header": "Header",
    "jwt.payload": "Payload",

    "sig.title": "Signature verification",
    "sig.secretLabel": "Shared secret (HMAC)",
    "sig.keyLabel": "Public key PEM · JWK · JWKS",
    "sig.secretPlaceholder": "your-secret",
    "sig.keyPlaceholder": "-----BEGIN PUBLIC KEY-----\n...  or  { \"kty\": \"RSA\", ... }",
    "sig.verify": "Verify",
    "sig.verifying": "Verifying…",
    "sig.valid": "Valid signature",
    "sig.invalid": "Invalid signature",

    "saml.inputLabel": "SAML response / assertion (XML, base64 or base64+deflate)",
    "saml.placeholder": "Paste the SAML (raw XML, or base64 / redirect encoded)…",
    "saml.signed": "Signed (XML-DSig)",
    "saml.condOk": "Validity conditions OK",
    "saml.condNotYet": "Not yet valid",
    "saml.condExpired": "Expired",
    "saml.xmlDecoded": "Decoded XML",
    "saml.summary": "Summary",
    "saml.verifyTitle": "Verify the signature",
    "saml.certLabel": "X.509 certificate (base64, optional if included in the XML)",
    "saml.certPlaceholder": "MIIC... (content of <X509Certificate>)",
    "saml.verifyBtn": "Verify XML-DSig",
    "saml.noSignature": "No signature",
    "saml.validShort": "Valid",
    "saml.sigValid": "Valid signature",
    "saml.sigInvalid": "Invalid signature",

    "cmp.intro": "Paste two tokens — JWT (OAuth2/OIDC) or SAML. The type is detected automatically and comparable fields are shown side by side.",
    "cmp.tokenA": "Token A",
    "cmp.tokenB": "Token B",
    "cmp.placeholder": "eyJ… (JWT) or <saml:Assertion…> / base64",
    "cmp.kindJwt": "JWT / OIDC",
    "cmp.kindSaml": "SAML",
    "cmp.mixed": "You are comparing a {a} token with a {b} token. Comparison still works but the fields don't share the same semantics.",
    "cmp.diffs": "difference(s) found",
    "cmp.legendChanged": "changed",
    "cmp.legendAdded": "added",
    "cmp.legendRemoved": "removed",
    "cmp.hideSame": "Hide identical fields",
    "cmp.colField": "Field",
    "cmp.noDiff": "No difference — both tokens are identical.",
    "cmp.empty": "Paste two tokens (JWT or SAML) to compare their fields.",

    "err.jwt.format": "A JWT must have three sections separated by dots.",
    "err.jwt.header": "The header is not valid base64url JSON.",
    "err.jwt.payload": "The payload is not valid base64url JSON.",
    "err.saml.invalid_xml": "Invalid XML: could not parse the document.",
    "err.saml.no_signature": "No XML-DSig signature found.",
    "err.saml.no_signedinfo": "SignedInfo not found.",
    "err.saml.no_cert": "No certificate / public key provided.",
    "err.saml.digest": "The reference digest does not match (tampered content or different C14N).",
    "err.saml.crypto": "Invalid cryptographic signature.",
    "err.saml.unsupported_sig": "Unsupported signature algorithm: {alg}",
    "err.format.unknown": "Unrecognized format: paste a JWT (eyJ…) or a SAML assertion (XML or base64).",
    "err.alg.none": "Algorithm \"none\": no signature to verify.",
    "err.alg.unsupported": "Unsupported algorithm: {alg}",

    "claim.iss": "Token issuer",
    "claim.sub": "Subject — user identifier",
    "claim.aud": "Audience — intended recipient(s)",
    "claim.exp": "Expiration",
    "claim.nbf": "Valid from (not before)",
    "claim.iat": "Issued at",
    "claim.jti": "Unique token identifier",
    "claim.azp": "Authorized party",
    "claim.scope": "Granted scopes",
    "claim.nonce": "Replay-protection value (OIDC)",
    "claim.auth_time": "Authentication time",
    "claim.acr": "Authentication context class",
    "claim.amr": "Authentication methods used",
    "claim.at_hash": "Access token hash",
    "claim.c_hash": "Authorization code hash",
    "claim.email": "Email address",
    "claim.email_verified": "Email verified",
    "claim.name": "Full name",
    "claim.preferred_username": "Preferred username",
    "claim.given_name": "Given name",
    "claim.family_name": "Family name",
    "claim.roles": "Roles",
    "claim.groups": "Groups",
    "claim.client_id": "OAuth2 client identifier",
    "claim.typ": "Token type",
    "claim.alg": "Signature algorithm",
    "claim.kid": "Key identifier (key id)",

    "val.expired": "Token expired ({rel}).",
    "val.expiresIn": "Expires {rel}.",
    "val.notYet": "Not yet valid ({rel}).",
    "val.validNow": "Validity period reached.",
    "val.futureIat": "Issued in the future — clocks out of sync?",
    "val.issuedAt": "Issued {rel}.",
    "rel.in": "in {label}",
    "rel.ago": "{label} ago",
    "rel.lessThan": "less than 1s",
    "unit.d": "d", "unit.h": "h", "unit.min": "min", "unit.s": "s",
  },
};

export function t(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let s = translations[lang][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
  }
  return s;
}

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  return { lang, setLang, t: (key: string, params?: Record<string, string | number>) => t(lang, key, params) };
}

const KEY = "apricot-lang";
export function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "fr" || saved === "en") return saved;
  } catch { /* ignore */ }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) return "fr";
  return "en";
}
export function persistLang(lang: Lang) {
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
}
