import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { JwtView } from "./views/JwtView";
import { SamlView } from "./views/SamlView";
import { CompareView } from "./views/CompareView";
import { getInitialTheme, applyTheme } from "./lib/theme";
import { LangContext, getInitialLang, persistLang, useLang, type Lang } from "./lib/i18n";
import "./styles.css";

type Tab = "jwt" | "saml" | "compare";

function Shell() {
  const { t } = useLang();
  const [theme, setTheme] = useState(getInitialTheme);
  const [tab, setTab] = useState<Tab>("jwt");
  const [jwt, setJwt] = useState("");
  const [saml, setSaml] = useState("");
  const [cmpA, setCmpA] = useState("");
  const [cmpB, setCmpB] = useState("");

  useEffect(() => { applyTheme(theme); }, [theme]);

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />

      <div className="trust" role="note">
        <span aria-hidden="true">🔒</span>
        {t("trust")}
      </div>

      <nav className="tabs" role="tablist">
        <button className={`tab ${tab === "jwt" ? "active" : ""}`} onClick={() => setTab("jwt")} role="tab" aria-selected={tab === "jwt"}>{t("tab.jwt")}</button>
        <button className={`tab ${tab === "saml" ? "active" : ""}`} onClick={() => setTab("saml")} role="tab" aria-selected={tab === "saml"}>{t("tab.saml")}</button>
        <button className={`tab ${tab === "compare" ? "active" : ""}`} onClick={() => setTab("compare")} role="tab" aria-selected={tab === "compare"}>{t("tab.compare")}</button>
      </nav>

      {tab === "jwt" && <JwtView token={jwt} onToken={setJwt} />}
      {tab === "saml" && <SamlView input={saml} onInput={setSaml} />}
      {tab === "compare" && <CompareView tokenA={cmpA} tokenB={cmpB} onA={setCmpA} onB={setCmpB} />}

      <footer className="footer">{t("footer")}</footer>
    </div>
  );
}

export default function App() {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const setLang = (l: Lang) => { setLangState(l); persistLang(l); };
  useEffect(() => { document.documentElement.setAttribute("lang", lang); }, [lang]);
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Shell />
    </LangContext.Provider>
  );
}
