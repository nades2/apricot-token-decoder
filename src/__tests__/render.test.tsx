import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { JwtView } from "../views/JwtView";
import { SamlView } from "../views/SamlView";
import { CompareView } from "../views/CompareView";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwibmFtZSI6IkphbmUiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.x";
const SAML = `<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_1"><saml:Issuer>idp</saml:Issuer><saml:Subject><saml:NameID>jane@x.com</saml:NameID></saml:Subject></saml:Assertion>`;

describe("rendu des vues (smoke)", () => {
  it("JwtView décode et affiche un claim", () => {
    const html = renderToString(<JwtView token={JWT} onToken={() => {}} />);
    expect(html).toContain("user-42");
    expect(html).toContain("Payload");
  });
  it("SamlView affiche l'issuer", () => {
    const html = renderToString(<SamlView input={SAML} onInput={() => {}} />);
    expect(html).toContain("jane@x.com");
  });
  it("CompareView compare deux JWT", () => {
    const a = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBIn0.x";
    const b = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJCIn0.x";
    const html = renderToString(<CompareView tokenA={a} tokenB={b} onA={() => {}} onB={() => {}} />);
    expect(html).toContain("différence");
    expect(html).toContain("JWT / OIDC");
  });
  it("CompareView accepte le SAML", () => {
    const samlB = SAML.replace("jane@x.com", "bob@x.com");
    const html = renderToString(<CompareView tokenA={SAML} tokenB={samlB} onA={() => {}} onB={() => {}} />);
    expect(html).toContain("SAML");
    expect(html).toContain("NameID");
  });
});
