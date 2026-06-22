import { useState } from "react";
import { verifyJwt, type VerifyResult } from "../lib/verify";

interface Props {
  token: string;
  alg: string;
  kid?: string;
}

export function SignaturePanel({ token, alg, kid }: Props) {
  const [key, setKey] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const isHmac = alg.startsWith("HS");

  async function run() {
    setBusy(true);
    const r = await verifyJwt(token, alg, key, kid);
    setResult(r);
    setBusy(false);
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3>Vérification de signature</h3>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{alg}</span>
      </div>
      <label className="field-label">
        {isHmac ? "Secret partagé (HMAC)" : "Clé publique PEM · JWK · JWKS"}
      </label>
      <textarea
        value={key}
        spellCheck={false}
        onChange={(e) => {
          setKey(e.target.value);
          setResult(null);
        }}
        placeholder={
          isHmac
            ? "votre-secret"
            : "-----BEGIN PUBLIC KEY-----\n...  ou  { \"kty\": \"RSA\", ... }"
        }
        style={{ minHeight: 84 }}
      />
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn primary" onClick={run} disabled={!key || busy}>
          {busy ? "Vérification…" : "Vérifier"}
        </button>
        {result?.status === "valid" && (
          <span className="sig-result ok">✓ Signature valide · {result.alg}</span>
        )}
        {result?.status === "invalid" && (
          <span className="sig-result err">✗ Signature invalide</span>
        )}
        {result?.status === "error" && (
          <span className="sig-result err">⚠ {result.message}</span>
        )}
      </div>
    </div>
  );
}
