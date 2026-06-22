import { describe, it, expect } from "vitest";
import { normalizeToken } from "../normalize";

const JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTQyIiwic2NvcGUiOiJvcGVuaWQifQ.x";
const SAML = `<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_1">
  <saml:Issuer>https://idp.acme.com</saml:Issuer>
  <saml:Subject><saml:NameID>jane@acme.com</saml:NameID></saml:Subject>
  <saml:AttributeStatement>
    <saml:Attribute Name="role"><saml:AttributeValue>admin</saml:AttributeValue></saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`;

describe("normalizeToken", () => {
  it("détecte un JWT et expose ses claims", () => {
    const r = normalizeToken(JWT);
    expect(r.value?.kind).toBe("jwt");
    expect(r.value?.data.sub).toBe("user-42");
  });
  it("détecte un SAML et extrait les champs", () => {
    const r = normalizeToken(SAML);
    expect(r.value?.kind).toBe("saml");
    expect(r.value?.data["Issuer"]).toBe("https://idp.acme.com");
    expect(r.value?.data["NameID"]).toBe("jane@acme.com");
    expect(r.value?.data["Attribute.role"]).toBe("admin");
  });
  it("renvoie une erreur pour un format inconnu", () => {
    const r = normalizeToken("pas-un-jeton");
    expect(r.value).toBeNull();
    expect(r.error).toBeTruthy();
  });
});
