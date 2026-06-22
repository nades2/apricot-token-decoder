import { useMemo } from "react";
import { TokenInput } from "../components/TokenInput";
import { SignaturePanel } from "../components/SignaturePanel";
import { decodeJwt, validateClaims, JwtError } from "../lib/jwt";
import { renderJson } from "../lib/highlight";

interface Props {
  token: string;
  onToken: (v: string) => void;
}

const SAMPLE =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYzEyMyJ9.eyJpc3MiOiJodHRwczovL2lkcC5hY21lLmNvbSIsInN1YiI6InVzZXItNDIiLCJhdWQiOiJ3ZWItYXBwIiwibmFtZSI6IkphbmUgRG9lIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSIsImlhdCI6MTcxODk5MjAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.signature-placeholder";

export function JwtView({ token, onToken }: Props) {
  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { value: decodeJwt(token), error: null as string | null };
    } catch (e) {
      return { value: null, error: e instanceof JwtError ? e.message : "Erreur de décodage." };
    }
  }, [token]);

  const validations = useMemo(
    () => (decoded?.value ? validateClaims(decoded.value.payload) : []),
    [decoded]
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <label className="field-label" style={{ margin: 0 }}>Jeton JWT encodé</label>
        <button className="btn ghost" onClick={() => onToken(SAMPLE)}>Charger un exemple</button>
      </div>
      <TokenInput label="" value={token} onChange={onToken} rows={4}
        placeholder="Collez votre JWT (eyJ...)" />

      {decoded?.error && <div className="error-box" style={{ marginTop: 14 }}>{decoded.error}</div>}

      {decoded?.value && (
        <div className="grid2" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-head"><h3>Header</h3></div>
              {renderJson(decoded.value.header)}
            </div>
            <SignaturePanel
              token={token}
              alg={String(decoded.value.header.alg || "")}
              kid={decoded.value.header.kid ? String(decoded.value.header.kid) : undefined}
            />
          </div>

          <div className="card">
            <div className="card-head"><h3>Payload</h3></div>
            {renderJson(decoded.value.payload)}
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
