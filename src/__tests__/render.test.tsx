import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { JwtView } from "../views/JwtView";
import { SamlView } from "../views/SamlView";
import { CompareView } from "../views/CompareView";
import { LangContext, type Lang } from "../lib/i18n";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwibmFtZSI6IkphbmUiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.x";
const SAML = `<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_1"><saml:Issuer>idp</saml:Issuer><saml:Subject><saml:NameID>jane@x.com</saml:NameID></saml:Subject></saml:Assertion>`;

function withLang(lang: Lang, node: React.ReactNode) {
  return renderToString(
    <LangContext.Provider value={{ lang, setLang: () => {} }}>{node}</LangContext.Provider>
  );
}

describe("rendu des vues (smoke)", () => {
  it("JwtView décode et affiche un claim", () => {
    const html = withLang("fr", <JwtView token={JWT} onToken={() => {}} />);
    expect(html).toContain("user-42");
    expect(html).toContain("Payload");
  });
  it("SamlView affiche l'issuer", () => {
    const html = withLang("fr", <SamlView input={SAML} onInput={() => {}} />);
    expect(html).toContain("jane@x.com");
  });
  it("CompareView compare deux JWT (FR)", () => {
    const a = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBIn0.x";
    const b = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJCIn0.x";
    const html = withLang("fr", <CompareView tokenA={a} tokenB={b} onA={() => {}} onB={() => {}} />);
    expect(html).toContain("différence");
    expect(html).toContain("JWT / OIDC");
  });
  it("CompareView en anglais", () => {
    const a = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBIn0.x";
    const b = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJCIn0.x";
    const html = withLang("en", <CompareView tokenA={a} tokenB={b} onA={() => {}} onB={() => {}} />);
    expect(html).toContain("difference");
  });
  it("CompareView accepte le SAML", () => {
    const samlB = SAML.replace("jane@x.com", "bob@x.com");
    const html = withLang("fr", <CompareView tokenA={SAML} tokenB={samlB} onA={() => {}} onB={() => {}} />);
    expect(html).toContain("SAML");
    expect(html).toContain("NameID");
  });
});
