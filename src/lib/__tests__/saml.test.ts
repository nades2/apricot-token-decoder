import { describe, it, expect } from "vitest";
import { parseSaml, decodeSamlString, looksLikeSaml } from "../saml";

const XML = `<?xml version="1.0"?>
<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_a1">
  <saml:Issuer>https://idp.acme.com</saml:Issuer>
  <saml:Subject><saml:NameID>jane@acme.com</saml:NameID></saml:Subject>
  <saml:Conditions NotBefore="2024-01-01T14:00:00Z" NotOnOrAfter="2024-01-01T15:00:00Z"/>
  <saml:AttributeStatement>
    <saml:Attribute Name="role"><saml:AttributeValue>admin</saml:AttributeValue></saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`;

describe("parseSaml", () => {
  const r = parseSaml(XML);
  it("extrait issuer / nameId", () => {
    expect(r.issuer).toBe("https://idp.acme.com");
    expect(r.nameId).toBe("jane@acme.com");
  });
  it("extrait les conditions temporelles", () => {
    expect(r.notBefore).toContain("2024-01-01T14:00");
    expect(r.notOnOrAfter).toContain("2024-01-01T15:00");
  });
  it("extrait les attributs", () => {
    expect(r.attributes[0].name).toBe("role");
    expect(r.attributes[0].values).toEqual(["admin"]);
  });
});

describe("decodeSamlString", () => {
  it("passe le XML brut tel quel", () => {
    expect(decodeSamlString(XML).startsWith("<?xml")).toBe(true);
  });
  it("looksLikeSaml détecte le XML", () => {
    expect(looksLikeSaml(XML)).toBe(true);
  });
});
