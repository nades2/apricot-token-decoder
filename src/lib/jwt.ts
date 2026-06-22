import { base64UrlToText } from "./base64";
import { t, type Lang } from "./i18n";

// Claims standards JWT / OIDC (RFC 7519 + OpenID Connect Core).
// Les libellés sont fournis par i18n (clé "claim.<nom>").
export const KNOWN_CLAIMS: string[] = [
  "iss", "sub", "aud", "exp", "nbf", "iat", "jti", "azp", "scope", "nonce",
  "auth_time", "acr", "amr", "at_hash", "c_hash", "email", "email_verified",
  "name", "preferred_username", "given_name", "family_name", "roles", "groups",
  "client_id", "typ", "alg", "kid",
];

export function claimDescription(key: string, lang: Lang): string | null {
  return KNOWN_CLAIMS.includes(key) ? t(lang, `claim.${key}`) : null;
}

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

// Le message d'une JwtError est une clé i18n (ex. "err.jwt.format").
export class JwtError extends Error {}

export function looksLikeJwt(token: string): boolean {
  const t = token.trim();
  const parts = t.split(".");
  return parts.length === 3 && /^[A-Za-z0-9_-]+$/.test(parts[0]);
}

export function decodeJwt(token: string): DecodedJwt {
  const raw = token.trim();
  const parts = raw.split(".");
  if (parts.length !== 3) throw new JwtError("err.jwt.format");
  const [h, p, s] = parts;
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = JSON.parse(base64UrlToText(h));
  } catch {
    throw new JwtError("err.jwt.header");
  }
  try {
    payload = JSON.parse(base64UrlToText(p));
  } catch {
    throw new JwtError("err.jwt.payload");
  }
  return { raw, header, payload, signature: s, headerRaw: h, payloadRaw: p, signatureRaw: s };
}

export interface ClaimValidation {
  claim: string;
  status: "ok" | "warning" | "error";
  message: string;
}

export function isTimeClaim(claim: string): boolean {
  return TIME_CLAIMS.includes(claim);
}

const LOCALES: Record<Lang, string> = { fr: "fr-FR", en: "en-US" };

export function formatEpoch(value: number, lang: Lang = "en"): string {
  const d = new Date(value * 1000);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString(LOCALES[lang]);
}

export function relativeTime(value: number, now = Date.now(), lang: Lang = "en"): string {
  const deltaMs = value * 1000 - now;
  const abs = Math.abs(deltaMs);
  const units: [number, string][] = [
    [86400000, "d"], [3600000, "h"], [60000, "min"], [1000, "s"],
  ];
  let label = "";
  for (const [ms, name] of units) {
    if (abs >= ms) {
      label = `${Math.round(abs / ms)} ${t(lang, `unit.${name}`)}`;
      break;
    }
  }
  if (!label) label = t(lang, "rel.lessThan");
  return t(lang, deltaMs >= 0 ? "rel.in" : "rel.ago", { label });
}

export function validateClaims(
  payload: Record<string, unknown>,
  now = Date.now(),
  lang: Lang = "en"
): ClaimValidation[] {
  const out: ClaimValidation[] = [];
  const nowSec = now / 1000;
  if (typeof payload.exp === "number") {
    if (nowSec >= payload.exp) {
      out.push({ claim: "exp", status: "error", message: t(lang, "val.expired", { rel: relativeTime(payload.exp, now, lang) }) });
    } else {
      out.push({ claim: "exp", status: "ok", message: t(lang, "val.expiresIn", { rel: relativeTime(payload.exp, now, lang) }) });
    }
  }
  if (typeof payload.nbf === "number") {
    if (nowSec < payload.nbf) {
      out.push({ claim: "nbf", status: "error", message: t(lang, "val.notYet", { rel: relativeTime(payload.nbf, now, lang) }) });
    } else {
      out.push({ claim: "nbf", status: "ok", message: t(lang, "val.validNow") });
    }
  }
  if (typeof payload.iat === "number") {
    if (payload.iat > nowSec + 60) {
      out.push({ claim: "iat", status: "warning", message: t(lang, "val.futureIat") });
    } else {
      out.push({ claim: "iat", status: "ok", message: t(lang, "val.issuedAt", { rel: relativeTime(payload.iat, now, lang) }) });
    }
  }
  return out;
}
