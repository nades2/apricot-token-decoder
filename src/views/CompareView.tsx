import { useMemo, useState } from "react";
import { normalizeToken } from "../lib/normalize";
import { diffPayloads, countDifferences, type DiffRow } from "../lib/diff";

interface Props {
  tokenA: string;
  tokenB: string;
  onA: (v: string) => void;
  onB: (v: string) => void;
}

const KIND_LABEL: Record<string, string> = { jwt: "JWT / OIDC", saml: "SAML" };

export function CompareView({ tokenA, tokenB, onA, onB }: Props) {
  const [hideSame, setHideSame] = useState(true);
  const a = useMemo(() => normalizeToken(tokenA), [tokenA]);
  const b = useMemo(() => normalizeToken(tokenB), [tokenB]);

  const rows: DiffRow[] = useMemo(() => {
    if (!a.value || !b.value) return [];
    return diffPayloads(a.value.data, b.value.data);
  }, [a, b]);

  const diffCount = countDifferences(rows);
  const visibleRows = hideSame ? rows.filter((r) => r.status !== "same") : rows;
  const ready = a.value && b.value;
  const mixedTypes = a.value && b.value && a.value.kind !== b.value.kind;

  function typeBadge(res: typeof a) {
    if (!res.value) return null;
    return <span className="badge info" style={{ marginTop: 8 }}>{KIND_LABEL[res.value.kind]}</span>;
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 0, marginBottom: 14 }}>
        Collez deux jetons — <strong>JWT (OAuth2/OIDC) ou SAML</strong>. Le type est détecté
        automatiquement et les champs comparables sont mis en regard.
      </p>

      <div className="grid2">
        <div>
          <label className="field-label">Jeton A</label>
          <textarea className="token" value={tokenA} spellCheck={false} rows={3}
            placeholder="eyJ… (JWT) ou &lt;saml:Assertion…&gt; / base64" onChange={(e) => onA(e.target.value)} style={{ minHeight: 80 }} />
          <div className="badges">{typeBadge(a)}</div>
          {a.error && <div className="error-box" style={{ marginTop: 8 }}>{a.error}</div>}
        </div>
        <div>
          <label className="field-label">Jeton B</label>
          <textarea className="token" value={tokenB} spellCheck={false} rows={3}
            placeholder="eyJ… (JWT) ou &lt;saml:Assertion…&gt; / base64" onChange={(e) => onB(e.target.value)} style={{ minHeight: 80 }} />
          <div className="badges">{typeBadge(b)}</div>
          {b.error && <div className="error-box" style={{ marginTop: 8 }}>{b.error}</div>}
        </div>
      </div>

      {mixedTypes && (
        <div className="error-box" style={{ marginTop: 16, background: "var(--warn-bg)", color: "var(--warn)" }}>
          ⚠ Vous comparez un jeton {KIND_LABEL[a.value!.kind]} avec un {KIND_LABEL[b.value!.kind]}.
          La comparaison reste possible mais les champs n'ont pas la même sémantique.
        </div>
      )}

      {ready && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>
              <strong style={{ color: "var(--text)" }}>{diffCount}</strong> différence{diffCount > 1 ? "s" : ""} détectée{diffCount > 1 ? "s" : ""}
            </div>
            <div className="legend">
              <span><i style={{ background: "var(--chg-bg)", border: "1px solid var(--chg-border)" }} />modifié</span>
              <span><i style={{ background: "var(--add-bg)", border: "1px solid var(--add-border)" }} />ajouté</span>
              <span><i style={{ background: "var(--del-bg)", border: "1px solid var(--del-border)" }} />retiré</span>
            </div>
          </div>

          <label className="toggle-row" style={{ marginTop: 0 }}>
            <input type="checkbox" checked={hideSame} onChange={(e) => setHideSame(e.target.checked)} />
            Masquer les champs identiques
          </label>

          <table className="difftable">
            <thead>
              <tr><th style={{ width: "30%" }}>Champ</th><th>Jeton A</th><th>Jeton B</th></tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr><td colSpan={3} style={{ color: "var(--text-3)", textAlign: "center", padding: 20 }}>
                  Aucune différence — les deux jetons sont identiques.
                </td></tr>
              )}
              {visibleRows.map((r) => (
                <tr key={r.path} className={`diff-line ${r.status}`}>
                  <td className="path">{r.path}</td>
                  <td className={r.status === "removed" ? "v-del" : r.status === "added" ? "v-abs" : ""}>
                    {r.status === "added" ? "— absent" : r.left}
                  </td>
                  <td className={r.status === "added" ? "v-add" : r.status === "removed" ? "v-abs" : r.status === "changed" ? "v-chg" : ""}>
                    {r.status === "removed" ? "— absent" : r.right}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {!ready && (
        <div className="empty" style={{ marginTop: 20 }}>Collez deux jetons (JWT ou SAML) pour comparer leurs champs.</div>
      )}
    </div>
  );
}
