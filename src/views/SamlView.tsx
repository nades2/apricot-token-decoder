import { useMemo, useState } from "react";
import { decodeSamlString, parseSaml, type DecodedSaml } from "../lib/saml";
import { verifySamlSignature, type SamlVerifyResult } from "../lib/samlVerify";
import { highlightXml } from "../lib/xmlHighlight";
import { useLang } from "../lib/i18n";

interface Props {
  input: string;
  onInput: (v: string) => void;
}

const SAMPLE = `<?xml version="1.0"?>
<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_a1b2c3" IssueInstant="2024-01-01T14:00:00Z" Version="2.0">
  <saml:Issuer>https://idp.acme.com</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">jane@acme.com</saml:NameID>
  </saml:Subject>
  <saml:Conditions NotBefore="2024-01-01T14:00:00Z" NotOnOrAfter="2024-01-01T15:00:00Z">
    <saml:AudienceRestriction><saml:Audience>web-app</saml:Audience></saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AttributeStatement>
    <saml:Attribute Name="role"><saml:AttributeValue>admin</saml:AttributeValue></saml:Attribute>
    <saml:Attribute Name="department"><saml:AttributeValue>Engineering</saml:AttributeValue></saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`;

export function SamlView({ input, onInput }: Props) {
  const { lang, t } = useLang();
  const [cert, setCert] = useState("");
  const [sig, setSig] = useState<SamlVerifyResult | null>(null);
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const xml = decodeSamlString(input);
      return { value: parseSaml(xml) as DecodedSaml, xml, errorKey: null as string | null };
    } catch (e) {
      return { value: null, xml: "", errorKey: (e as Error).message };
    }
  }, [input]);

  const conditionStatus = useMemo(() => {
    if (!parsed?.value) return null;
    const now = Date.now();
    const nb = parsed.value.notBefore ? Date.parse(parsed.value.notBefore) : null;
    const noa = parsed.value.notOnOrAfter ? Date.parse(parsed.value.notOnOrAfter) : null;
    if (nb !== null && now < nb) return { ok: false, msg: t("saml.condNotYet") };
    if (noa !== null && now >= noa) return { ok: false, msg: t("saml.condExpired") };
    if (nb !== null || noa !== null) return { ok: true, msg: t("saml.condOk") };
    return null;
  }, [parsed, t]);

  async function verify() {
    if (!parsed?.xml) return;
    setBusy(true);
    setSig(await verifySamlSignature(parsed.xml, cert || undefined, lang));
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <label className="field-label" style={{ margin: 0 }}>{t("saml.inputLabel")}</label>
        <button className="btn ghost" onClick={() => onInput(SAMPLE)}>{t("common.loadExample")}</button>
      </div>
      <textarea className="token" value={input} spellCheck={false} rows={5}
        placeholder={t("saml.placeholder")} onChange={(e) => onInput(e.target.value)} style={{ minHeight: 110 }} />

      {parsed?.errorKey && <div className="error-box" style={{ marginTop: 14 }}>{t(parsed.errorKey)}</div>}

      {parsed?.value && (
        <>
          <div className="badges" style={{ marginTop: 14 }}>
            <span className="badge info">{parsed.value.type}</span>
            {parsed.value.hasSignature && <span className="badge info">{t("saml.signed")}</span>}
            {conditionStatus && (
              <span className={`badge ${conditionStatus.ok ? "ok" : "err"}`}>
                {conditionStatus.ok ? "✓" : "✗"} {conditionStatus.msg}
              </span>
            )}
            {sig?.status === "valid" && <span className="badge ok">✓ {t("saml.sigValid")} · {sig.method}</span>}
            {sig?.status === "invalid" && <span className="badge err">✗ {t("saml.sigInvalid")}</span>}
          </div>

          <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)" }}>
            <div className="card">
              <div className="card-head"><h3>{t("saml.xmlDecoded")}</h3></div>
              {highlightXml(parsed.value.pretty)}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div className="card-head"><h3>{t("saml.summary")}</h3></div>
                <table className="kv">
                  <tbody>
                    {parsed.value.issuer && <tr><td className="k">Issuer</td><td className="v">{parsed.value.issuer}</td></tr>}
                    {parsed.value.nameId && <tr><td className="k">NameID</td><td className="v">{parsed.value.nameId}</td></tr>}
                    {parsed.value.notBefore && <tr><td className="k">NotBefore</td><td className="v">{parsed.value.notBefore}</td></tr>}
                    {parsed.value.notOnOrAfter && <tr><td className="k">NotOnOrAfter</td><td className="v">{parsed.value.notOnOrAfter}</td></tr>}
                    {parsed.value.attributes.map((a) => (
                      <tr key={a.name}><td className="k">{a.name}</td><td className="v">{a.values.join(", ")}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="card-head"><h3>{t("saml.verifyTitle")}</h3></div>
                <label className="field-label">{t("saml.certLabel")}</label>
                <textarea value={cert} spellCheck={false} onChange={(e) => { setCert(e.target.value); setSig(null); }}
                  placeholder={t("saml.certPlaceholder")} style={{ minHeight: 70 }} />
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <button className="btn primary" onClick={verify} disabled={busy || !parsed.value.hasSignature}>
                    {busy ? t("sig.verifying") : t("saml.verifyBtn")}
                  </button>
                  {!parsed.value.hasSignature && <span className="sig-result idle">{t("saml.noSignature")}</span>}
                  {sig?.status === "valid" && <span className="sig-result ok">✓ {t("saml.validShort")}</span>}
                  {sig?.status === "invalid" && <span className="sig-result err">✗ {sig.reason}</span>}
                  {sig?.status === "error" && <span className="sig-result err">⚠ {sig.message}</span>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
