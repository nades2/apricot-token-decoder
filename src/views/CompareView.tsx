import { useMemo, useState } from "react";
import { normalizeToken } from "../lib/normalize";
import { diffPayloads, countDifferences, type DiffRow } from "../lib/diff";
import { useLang } from "../lib/i18n";

interface Props {
  tokenA: string;
  tokenB: string;
  onA: (v: string) => void;
  onB: (v: string) => void;
}

export function CompareView({ tokenA, tokenB, onA, onB }: Props) {
  const { t } = useLang();
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
  const kindLabel = (k: string) => (k === "jwt" ? t("cmp.kindJwt") : t("cmp.kindSaml"));

  function typeBadge(res: typeof a) {
    if (!res.value) return null;
    return <span className="badge info" style={{ marginTop: 8 }}>{kindLabel(res.value.kind)}</span>;
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 0, marginBottom: 14 }}>{t("cmp.intro")}</p>

      <div className="grid2">
        <div>
          <label className="field-label">{t("cmp.tokenA")}</label>
          <textarea className="token" value={tokenA} spellCheck={false} rows={3}
            placeholder={t("cmp.placeholder")} onChange={(e) => onA(e.target.value)} style={{ minHeight: 80 }} />
          <div className="badges">{typeBadge(a)}</div>
          {a.error && <div className="error-box" style={{ marginTop: 8 }}>{t(a.error)}</div>}
        </div>
        <div>
          <label className="field-label">{t("cmp.tokenB")}</label>
          <textarea className="token" value={tokenB} spellCheck={false} rows={3}
            placeholder={t("cmp.placeholder")} onChange={(e) => onB(e.target.value)} style={{ minHeight: 80 }} />
          <div className="badges">{typeBadge(b)}</div>
          {b.error && <div className="error-box" style={{ marginTop: 8 }}>{t(b.error)}</div>}
        </div>
      </div>

      {mixedTypes && (
        <div className="error-box" style={{ marginTop: 16, background: "var(--warn-bg)", color: "var(--warn)" }}>
          ⚠ {t("cmp.mixed", { a: kindLabel(a.value!.kind), b: kindLabel(b.value!.kind) })}
        </div>
      )}

      {ready && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>
              <strong style={{ color: "var(--text)" }}>{diffCount}</strong> {t("cmp.diffs")}
            </div>
            <div className="legend">
              <span><i style={{ background: "var(--chg-bg)", border: "1px solid var(--chg-border)" }} />{t("cmp.legendChanged")}</span>
              <span><i style={{ background: "var(--add-bg)", border: "1px solid var(--add-border)" }} />{t("cmp.legendAdded")}</span>
              <span><i style={{ background: "var(--del-bg)", border: "1px solid var(--del-border)" }} />{t("cmp.legendRemoved")}</span>
            </div>
          </div>

          <label className="toggle-row" style={{ marginTop: 0 }}>
            <input type="checkbox" checked={hideSame} onChange={(e) => setHideSame(e.target.checked)} />
            {t("cmp.hideSame")}
          </label>

          <table className="difftable">
            <thead>
              <tr><th style={{ width: "30%" }}>{t("cmp.colField")}</th><th>{t("cmp.tokenA")}</th><th>{t("cmp.tokenB")}</th></tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr><td colSpan={3} style={{ color: "var(--text-3)", textAlign: "center", padding: 20 }}>{t("cmp.noDiff")}</td></tr>
              )}
              {visibleRows.map((r) => (
                <tr key={r.path} className={`diff-line ${r.status}`}>
                  <td className="path">{r.path}</td>
                  <td className={r.status === "removed" ? "v-del" : r.status === "added" ? "v-abs" : ""}>
                    {r.status === "added" ? t("common.absent") : r.left}
                  </td>
                  <td className={r.status === "added" ? "v-add" : r.status === "removed" ? "v-abs" : r.status === "changed" ? "v-chg" : ""}>
                    {r.status === "removed" ? t("common.absent") : r.right}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {!ready && <div className="empty" style={{ marginTop: 20 }}>{t("cmp.empty")}</div>}
    </div>
  );
}
