interface Props {
  theme: string;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: Props) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <h1>Apricot Token Decoder</h1>
          <p>JWT · OAuth2 · OIDC · SAML</p>
        </div>
      </div>
      <button
        className="icon-btn"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
        title={theme === "dark" ? "Thème clair" : "Thème sombre"}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
    </header>
  );
}
