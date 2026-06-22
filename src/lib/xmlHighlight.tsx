import type { JSX } from "react";

// Coloration syntaxique légère du XML (sans dépendance).
export function highlightXml(xml: string): JSX.Element {
  const parts: JSX.Element[] = [];
  const regex = /(<\/?)([\w:.-]+)([^>]*?)(\/?>)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(xml)) !== null) {
    if (m.index > last) {
      parts.push(<span key={i++}>{xml.slice(last, m.index)}</span>);
    }
    const [, open, name, attrs, close] = m;
    parts.push(
      <span key={i++}>
        <span className="x-punct">{open}</span>
        <span className="x-tag">{name}</span>
        {highlightAttrs(attrs, i)}
        <span className="x-punct">{close}</span>
      </span>
    );
    i += 50;
    last = m.index + m[0].length;
  }
  if (last < xml.length) parts.push(<span key={i++}>{xml.slice(last)}</span>);
  return <pre className="xml">{parts}</pre>;
}

function highlightAttrs(attrs: string, baseKey: number): JSX.Element {
  const out: JSX.Element[] = [];
  const re = /([\w:.-]+)(=)("[^"]*"|'[^']*')/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = baseKey;
  while ((m = re.exec(attrs)) !== null) {
    if (m.index > last) out.push(<span key={k++}>{attrs.slice(last, m.index)}</span>);
    out.push(
      <span key={k++}>
        <span className="x-attr">{m[1]}</span>
        <span className="x-punct">=</span>
        <span className="x-val">{m[3]}</span>
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < attrs.length) out.push(<span key={k++}>{attrs.slice(last)}</span>);
  return <>{out}</>;
}
