import { useMemo } from "react";
import { SignaturePanel } from "../components/SignaturePanel";
import { decodeJwt, validateClaims, JwtError } from "../lib/jwt";
import { renderJson } from "../lib/highlight";
import { useLang } from "../lib/i18n";

interface Props {
  token: string;
  onToken: (v: string) => void;
}

const SAMPLE =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYzEyMyJ9.eyJpc3MiOiJodHRwczovL2lkcC5hY21lLmNvbSIsInN1YiI6InVzZXItNDIiLCJhdWQiOiJ3ZWItYXBwIiwibmFtZSI6IkphbmUgRG9lIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSIsImlhdCI6MTcxODk5MjAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.signature-placeholder";

export function JwtView({ token, onToken }: Props) {
  const { lang, t } = useLang();

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { value: decodeJwt(token), errorKey: null as string | null };
    } catch (e) {
      return { value: null, errorKey: e instanceof JwtError ? e.message : "err.jwt.format" };
    }
  }, [token]);

  const validations = useMemo(
    () => (decoded?.value ? validateClaims(decoded.value.payload, Date.now(), lang) : []),
    [decoded, lang]
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <label className="field-label" style={{ margin: 0 }}>{t("jwt.inputLabel")}</label>
        <button className="btn ghost" onClick={() => onToken(SAMPLE)}>{t("common.loadExample")}</button>
      </div>
      <textarea className="token" value={token} spellCheck={false} rows={6}
        placeholder={t("jwt.placeholder")} onChange={(e) => onToken(e.target.value)} style={{ minHeight: 130 }} />

      {decoded?.errorKey && <div className="error-box" style={{ marginTop: 14 }}>{t(decoded.errorKey)}</div>}

      {decoded?.value && (
        <div className="grid2" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-head"><h3>{t("jwt.header")}</h3></div>
              {renderJson(decoded.value.header, lang)}
            </div>
            <SignaturePanel
              token={token}
              alg={String(decoded.value.header.alg || "")}
              kid={decoded.value.header.kid ? String(decoded.value.header.kid) : undefined}
            />
          </div>

          <div className="card">
            <div className="card-head"><h3>{t("jwt.payload")}</h3></div>
            {renderJson(decoded.value.payload, lang)}
            {validations.length > 0 && (
              <div className="badges">
                {validations.map((v) => (
                  <span key={v.claim} className={`badge ${v.status === "ok" ? "ok" : v.status === "warning" ? "warn" : "err"}`}>
                    {v.status === "ok" ? "✓" : "⚠"} {v.claim} · {v.message}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
