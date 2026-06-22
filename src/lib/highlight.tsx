import type { JSX } from "react";
import { KNOWN_CLAIMS, isTimeClaim, formatEpoch } from "./jwt";

// Rendu JSON coloré + annotation des claims connus et des dates epoch.
export function renderJson(
  obj: Record<string, unknown>,
  annotate = true
): JSX.Element {
  return <pre className="json">{renderValue(obj, 0, annotate, null)}</pre>;
}

function indent(n: number) {
  return "  ".repeat(n);
}

function renderValue(
  value: unknown,
  depth: number,
  annotate: boolean,
  key: string | null
): React.ReactNode {
  if (value === null) return <span className="j-null">null</span>;
  if (typeof value === "string") return <span className="j-str">"{value}"</span>;
  if (typeof value === "boolean")
    return <span className="j-bool">{String(value)}</span>;
  if (typeof value === "number") {
    const annot =
      annotate && key && isTimeClaim(key) ? (
        <span className="j-annot">  {"// "}{formatEpoch(value)}</span>
      ) : null;
    return (
      <>
        <span className="j-num">{value}</span>
        {annot}
      </>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>;
    return (
      <>
        {"[\n"}
        {value.map((v, i) => (
          <span key={i}>
            {indent(depth + 1)}
            {renderValue(v, depth + 1, annotate, null)}
            {i < value.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {indent(depth)}
        {"]"}
      </>
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return <span>{"{}"}</span>;
  return (
    <>
      {"{\n"}
      {entries.map(([k, v], i) => (
        <span key={k}>
          {indent(depth + 1)}
          <span className="j-key">"{k}"</span>: {renderValue(v, depth + 1, annotate, k)}
          {i < entries.length - 1 ? "," : ""}
          {annotate && KNOWN_CLAIMS[k] && !isTimeClaim(k) ? (
            <span className="j-annot">  {"// "}{KNOWN_CLAIMS[k]}</span>
          ) : null}
          {"\n"}
        </span>
      ))}
      {indent(depth)}
      {"}"}
    </>
  );
}
