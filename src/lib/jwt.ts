import { base64UrlToText } from "./base64";

export interface JwtClaimInfo {
  key: string;
  description: string;
}

// Claims standards JWT / OIDC (RFC 7519 + OpenID Connect Core).
export const KNOWN_CLAIMS: Record<string, string> = {
  iss: "Émetteur du jeton (issuer)",
  sub: "Sujet — identifiant de l'utilisateur",
  aud: "Audience — destinataire(s) prévu(s)",
  exp: "Expiration",
  nbf: "Valide à partir de (not before)",
  iat: "Émis le (issued at)",
  jti: "Identifiant unique du jeton",
  azp: "Partie autorisée (authorized party)",
  scope: "Portées (scopes) accordées",
  nonce: "Valeur anti-rejeu (OIDC)",
  auth_time: "Heure d'authentification",
  acr: "Niveau d'assurance d'authentification",
  amr: "Méthodes d'authentification utilisées",
  at_hash: "Hash du access token",
  c_hash: "Hash du code d'autorisation",
  email: "Adresse e-mail",
  email_verified: "E-mail vérifié",
  name: "Nom complet",
  preferred_username: "Nom d'utilisateur préféré",
  given_name: "Prénom",
  family_name: "Nom de famille",
  roles: "Rôles",
  groups: "Groupes",
  client_id: "Identifiant client OAuth2",
  typ: "Type de jeton",
  alg: "Algorithme de signature",
  kid: "Identifiant de clé (key id)",
};

const TIME_CLAIMS = ["exp", "nbf", "iat", "auth_time"];

export interface DecodedJwt {
  raw: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
}

export class JwtError extends Error {}

export function looksLikeJwt(token: string): boolean {
  const t = token.trim();
  const parts = t.split(".");
  return parts.length === 3 && /^[A-Za-z0-9_-]+$/.test(parts[0]);
}

export function decodeJwt(token: string): DecodedJwt {
  const raw = token.trim();
  const parts = raw.split(".");
  if (parts.length !== 3) {
    throw new JwtError(
      "Un JWT doit comporter trois sections séparées par des points."
    );
  }
  const [h, p, s] = parts;
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = JSON.parse(base64UrlToText(h));
  } catch {
    throw new JwtError("Le header n'est pas un JSON base64url valide.");
  }
  try {
    payload = JSON.parse(base64UrlToText(p));
  } catch {
    throw new JwtError("Le payload n'est pas un JSON base64url valide.");
  }
  return {
    raw,
    header,
    payload,
    signature: s,
    headerRaw: h,
    payloadRaw: p,
    signatureRaw: s,
  };
}

export interface ClaimValidation {
  claim: string;
  status: "ok" | "warning" | "error";
  message: string;
}

export function isTimeClaim(claim: string): boolean {
  return TIME_CLAIMS.includes(claim);
}

export function formatEpoch(value: number): string {
  const d = new Date(value * 1000);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function relativeTime(value: number, now = Date.now()): string {
  const deltaMs = value * 1000 - now;
  const abs = Math.abs(deltaMs);
  const units: [number, string][] = [
    [86400000, "j"],
    [3600000, "h"],
    [60000, "min"],
    [1000, "s"],
  ];
  let label = "";
  for (const [ms, name] of units) {
    if (abs >= ms) {
      label = `${Math.round(abs / ms)} ${name}`;
      break;
    }
  }
  if (!label) label = "moins d'1 s";
  return deltaMs >= 0 ? `dans ${label}` : `il y a ${label}`;
}

export function validateClaims(
  payload: Record<string, unknown>,
  now = Date.now()
): ClaimValidation[] {
  const out: ClaimValidation[] = [];
  const nowSec = now / 1000;
  if (typeof payload.exp === "number") {
    if (nowSec >= payload.exp) {
      out.push({
        claim: "exp",
        status: "error",
        message: `Jeton expiré (${relativeTime(payload.exp, now)}).`,
      });
    } else {
      out.push({
        claim: "exp",
        status: "ok",
        message: `Expire ${relativeTime(payload.exp, now)}.`,
      });
    }
  }
  if (typeof payload.nbf === "number") {
    if (nowSec < payload.nbf) {
      out.push({
        claim: "nbf",
        status: "error",
        message: `Pas encore valide (${relativeTime(payload.nbf, now)}).`,
      });
    } else {
      out.push({ claim: "nbf", status: "ok", message: "Période de validité atteinte." });
    }
  }
  if (typeof payload.iat === "number") {
    if (payload.iat > nowSec + 60) {
      out.push({
        claim: "iat",
        status: "warning",
        message: "Émis dans le futur — horloges désynchronisées ?",
      });
    } else {
      out.push({
        claim: "iat",
        status: "ok",
        message: `Émis ${relativeTime(payload.iat, now)}.`,
      });
    }
  }
  return out;
}
