import { describe, it, expect } from "vitest";
import { decodeJwt, validateClaims, looksLikeJwt, JwtError } from "../jwt";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("decodeJwt", () => {
  it("décode header et payload", () => {
    const d = decodeJwt(TOKEN);
    expect(d.header.alg).toBe("HS256");
    expect(d.payload.name).toBe("Jane Doe");
    expect(d.payload.sub).toBe("1234567890");
  });
  it("rejette un format invalide", () => {
    expect(() => decodeJwt("abc.def")).toThrow(JwtError);
  });
  it("looksLikeJwt", () => {
    expect(looksLikeJwt(TOKEN)).toBe(true);
    expect(looksLikeJwt("<saml>")).toBe(false);
  });
});

describe("validateClaims", () => {
  it("détecte un jeton expiré", () => {
    const r = validateClaims({ exp: 1000 }, 2000 * 1000);
    expect(r[0].status).toBe("error");
  });
  it("valide un exp futur", () => {
    const r = validateClaims({ exp: 9999999999 }, Date.now());
    expect(r[0].status).toBe("ok");
  });
  it("nbf futur => error", () => {
    const r = validateClaims({ nbf: 9999999999 }, Date.now());
    expect(r[0].status).toBe("error");
  });
});
