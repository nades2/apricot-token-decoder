import { describe, it, expect } from "vitest";
import { t, getInitialLang } from "../i18n";

describe("i18n", () => {
  it("traduit en fr et en", () => {
    expect(t("fr", "tab.compare")).toBe("Comparer");
    expect(t("en", "tab.compare")).toBe("Compare");
  });
  it("substitue les paramètres", () => {
    expect(t("en", "cmp.mixed", { a: "JWT", b: "SAML" })).toContain("JWT");
    expect(t("fr", "rel.in", { label: "3 min" })).toBe("dans 3 min");
  });
  it("retombe sur la clé si absente", () => {
    expect(t("fr", "cle.inexistante")).toBe("cle.inexistante");
  });
  it("getInitialLang renvoie une langue valide", () => {
    expect(["fr", "en"]).toContain(getInitialLang());
  });
});
