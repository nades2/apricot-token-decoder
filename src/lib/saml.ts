import { inflateRaw, inflate } from "pako";
import { base64ToBytes, bytesToText } from "./base64";

// Décodage SAML : base64, et inflate (DEFLATE) pour le Redirect binding.

export interface DecodedSaml {
  xml: string;
  pretty: string;
  type: string;
  issuer?: string;
  nameId?: string;
  notBefore?: string;
  notOnOrAfter?: string;
  attributes: { name: string; values: string[] }[];
  hasSignature: boolean;
}

export class SamlError extends Error {
  constructor(m: string) {
    super(m);
    this.name = "SamlError";
  }
}

export function decodeSamlString(input: string): string {
  const trimmed = input.trim();
  // Déjà du XML ?
  if (trimmed.startsWith("<")) return trimmed;
  // URL-encodé ?
  let raw = trimmed;
  if (/%[0-9A-Fa-f]{2}/.test(raw)) {
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* ignore */
    }
  }
  const bytes = base64ToBytes(raw);
  // Tente inflate brut (Redirect binding), puis inflate zlib, sinon texte direct.
  try {
    return bytesToText(inflateRaw(bytes));
  } catch {
    /* not raw-deflated */
  }
  try {
    return bytesToText(inflate(bytes));
  } catch {
    /* not zlib */
  }
  return bytesToText(bytes);
}

export function looksLikeSaml(input: string): boolean {
  const t = input.trim();
  if (t.startsWith("<") && /saml|Assertion|Response|<\?xml/i.test(t)) return true;
  // base64 d'un blob XML SAML
  return /^[A-Za-z0-9+/=%]+$/.test(t) && t.length > 40 && !t.includes(".");
}

function localName(tag: string): string {
  return tag.includes(":") ? tag.split(":").pop()! : tag;
}

export function parseSaml(xml: string): DecodedSaml {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const perr = doc.querySelector("parsererror");
  if (perr) throw new SamlError("err.saml.invalid_xml");

  const root = doc.documentElement;
  const type = localName(root.nodeName);

  const find = (name: string): Element | null => {
    const all = doc.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (localName(all[i].nodeName) === name) return all[i];
    }
    return null;
  };

  const issuer = find("Issuer")?.textContent?.trim() || undefined;
  const nameId = find("NameID")?.textContent?.trim() || undefined;
  const conditions = find("Conditions");
  const notBefore = conditions?.getAttribute("NotBefore") || undefined;
  const notOnOrAfter = conditions?.getAttribute("NotOnOrAfter") || undefined;

  const attributes: { name: string; values: string[] }[] = [];
  const all = doc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    if (localName(all[i].nodeName) === "Attribute") {
      const name =
        all[i].getAttribute("Name") || all[i].getAttribute("FriendlyName") || "(sans nom)";
      const values: string[] = [];
      const kids = all[i].getElementsByTagName("*");
      for (let j = 0; j < kids.length; j++) {
        if (localName(kids[j].nodeName) === "AttributeValue") {
          values.push(kids[j].textContent?.trim() || "");
        }
      }
      attributes.push({ name, values });
    }
  }

  const hasSignature = !!find("Signature");

  return {
    xml,
    pretty: prettyXml(xml),
    type,
    issuer,
    nameId,
    notBefore,
    notOnOrAfter,
    attributes,
    hasSignature,
  };
}

export function prettyXml(xml: string): string {
  let formatted = "";
  let indent = 0;
  const tokens = xml.replace(/>\s*</g, "><").replace(/></g, ">\n<").split("\n");
  for (const node of tokens) {
    if (/^<\/\w/.test(node)) indent = Math.max(0, indent - 1);
    formatted += "  ".repeat(indent) + node + "\n";
    if (/^<\w[^>]*[^/]>$/.test(node) && !/<\/.*>$/.test(node) && !/<\?/.test(node))
      indent += 1;
  }
  return formatted.trim();
}
