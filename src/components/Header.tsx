import { useLang, type Lang } from "../lib/i18n";

interface Props {
  theme: string;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: Props) {
  const { lang, setLang, t } = useLang();
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <h1>Apricot Token Decoder</h1>
          <p>{t("brand.subtitle")}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="lang-switch" role="group" aria-label={t("lang.label")}>
          {(["fr", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              className={`lang-opt ${lang === l ? "active" : ""}`}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
          title={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
