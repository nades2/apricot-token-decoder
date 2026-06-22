import { useState } from "react";
import { verifyJwt, type VerifyResult } from "../lib/verify";
import { useLang } from "../lib/i18n";

interface Props {
  token: string;
  alg: string;
  kid?: string;
}

export function SignaturePanel({ token, alg, kid }: Props) {
  const { lang, t } = useLang();
  const [key, setKey] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const isHmac = alg.startsWith("HS");

  async function run() {
    setBusy(true);
    setResult(await verifyJwt(token, alg, key, kid, lang));
    setBusy(false);
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t("sig.title")}</h3>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{alg}</span>
      </div>
      <label className="field-label">{isHmac ? t("sig.secretLabel") : t("sig.keyLabel")}</label>
      <textarea
        value={key}
        spellCheck={false}
        onChange={(e) => { setKey(e.target.value); setResult(null); }}
        placeholder={isHmac ? t("sig.secretPlaceholder") : t("sig.keyPlaceholder")}
        style={{ minHeight: 84 }}
      />
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn primary" onClick={run} disabled={!key || busy}>
          {busy ? t("sig.verifying") : t("sig.verify")}
        </button>
        {result?.status === "valid" && <span className="sig-result ok">✓ {t("sig.valid")} · {result.alg}</span>}
        {result?.status === "invalid" && <span className="sig-result err">✗ {t("sig.invalid")}</span>}
        {result?.status === "error" && <span className="sig-result err">⚠ {result.message}</span>}
      </div>
    </div>
  );
}
