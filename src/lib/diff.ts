// Diff de deux payloads JSON (claims) — aplatissement par chemin pour comparer
// même quand l'ordre des clés diffère.

export type DiffStatus = "same" | "changed" | "added" | "removed";

export interface DiffRow {
  path: string;
  status: DiffStatus;
  left?: string;
  right?: string;
}

function flatten(obj: unknown, prefix = "", out: Record<string, string> = {}) {
  if (obj === null || typeof obj !== "object") {
    out[prefix || "(racine)"] = JSON.stringify(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    out[prefix] = JSON.stringify(obj);
    return out;
  }
  const rec = obj as Record<string, unknown>;
  const keys = Object.keys(rec);
  if (keys.length === 0) out[prefix] = "{}";
  for (const k of keys) {
    const path = prefix ? `${prefix}.${k}` : k;
    const v = rec[k];
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      flatten(v, path, out);
    } else {
      out[path] = JSON.stringify(v);
    }
  }
  return out;
}

export function diffPayloads(
  left: Record<string, unknown>,
  right: Record<string, unknown>
): DiffRow[] {
  const fl = flatten(left);
  const fr = flatten(right);
  const keys = Array.from(new Set([...Object.keys(fl), ...Object.keys(fr)])).sort();
  const rows: DiffRow[] = [];
  for (const key of keys) {
    const l = fl[key];
    const r = fr[key];
    if (l === undefined) rows.push({ path: key, status: "added", right: r });
    else if (r === undefined) rows.push({ path: key, status: "removed", left: l });
    else if (l !== r) rows.push({ path: key, status: "changed", left: l, right: r });
    else rows.push({ path: key, status: "same", left: l, right: r });
  }
  return rows;
}

export function countDifferences(rows: DiffRow[]): number {
  return rows.filter((r) => r.status !== "same").length;
}
