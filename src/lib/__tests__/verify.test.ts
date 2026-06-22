import { describe, it, expect } from "vitest";
import { verifyJwt } from "../verify";

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlStr(s: string): string {
  return b64url(new TextEncoder().encode(s));
}

async function makeRsaJwt() {
  const kp = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
  const header = b64urlStr(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64urlStr(JSON.stringify({ sub: "abc", exp: 9999999999 }));
  const input = new TextEncoder().encode(`${header}.${payload}`);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", kp.privateKey, input);
  const token = `${header}.${payload}.${b64url(new Uint8Array(sig))}`;
  const jwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
  return { token, jwk };
}

describe("verifyJwt RS256", () => {
  it("valide une signature correcte (JWK)", async () => {
    const { token, jwk } = await makeRsaJwt();
    const r = await verifyJwt(token, "RS256", JSON.stringify(jwk));
    expect(r.status).toBe("valid");
  });
  it("rejette un payload altéré", async () => {
    const { token, jwk } = await makeRsaJwt();
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1].slice(0, -2)}XY.${parts[2]}`;
    const r = await verifyJwt(tampered, "RS256", JSON.stringify(jwk));
    expect(r.status).toBe("invalid");
  });
});

describe("verifyJwt HS256", () => {
  it("valide un HMAC correct", async () => {
    const header = b64urlStr(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = b64urlStr(JSON.stringify({ sub: "x" }));
    const secret = "ma-cle-secrete";
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`));
    const token = `${header}.${payload}.${b64url(new Uint8Array(sig))}`;
    const r = await verifyJwt(token, "HS256", secret);
    expect(r.status).toBe("valid");
  });
});
