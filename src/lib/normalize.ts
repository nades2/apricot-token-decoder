import { decodeJwt, looksLikeJwt } from "./jwt";
import { decodeSamlString, parseSaml, looksLikeSaml } from "./saml";

export type TokenKind = "jwt" | "saml";

export interface Normalized {
  kind: TokenKind;
  // Champs aplatis et comparables (claims JWT ou champs SAML extraits).
  data: Record<string, unknown>;
}

export interface NormalizeResult {
  value: Normalized | null;
  error: string | null;
}

// Détecte le type d'un jeton et en extrait une représentation comparable.
export function normalizeToken(input: string): NormalizeResult {
  const t = input.trim();
  if (!t) return { value: null, error: null };

  // JWT prioritaire : trois sections base64url séparées par des points.
  if (looksLikeJwt(t)) {
    try {
      const { payload } = decodeJwt(t);
      return { value: { kind: "jwt", data: payload }, error: null };
    } catch (e) {
      return { value: null, error: (e as Error).message };
    }
  }

  // Sinon, on tente le SAML (XML brut, base64, ou base64 + deflate).
  if (looksLikeSaml(t)) {
    try {
      const xml = decodeSamlString(t);
      const s = parseSaml(xml);
      const data: Record<string, unknown> = {};
      if (s.issuer) data["Issuer"] = s.issuer;
      if (s.nameId) data["NameID"] = s.nameId;
      if (s.notBefore) data["Conditions.NotBefore"] = s.notBefore;
      if (s.notOnOrAfter) data["Conditions.NotOnOrAfter"] = s.notOnOrAfter;
      data["Type"] = s.type;
      for (const a of s.attributes) {
        data[`Attribute.${a.name}`] =
          a.values.length === 1 ? a.values[0] : a.values;
      }
      return { value: { kind: "saml", data }, error: null };
    } catch (e) {
      return { value: null, error: (e as Error).message };
    }
  }

  return {
    value: null,
    error: "Format non reconnu : collez un JWT (eyJ…) ou une assertion SAML (XML ou base64).",
  };
}
