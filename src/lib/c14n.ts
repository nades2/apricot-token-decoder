// Canonicalisation XML (Canonical XML 1.0, inclusive — http://www.w3.org/TR/2001/REC-xml-c14n-20010315)
// Implémentation suffisante pour la vérification XML-DSig de la plupart des assertions SAML.

function attrCompare(a: Attr, b: Attr): number {
  // Les déclarations de namespace d'abord (triées par nom local), puis les attributs
  // triés par (namespaceURI, localName).
  const ans = a.namespaceURI === "http://www.w3.org/2000/xmlns/";
  const bns = b.namespaceURI === "http://www.w3.org/2000/xmlns/";
  if (ans && !bns) return -1;
  if (!ans && bns) return 1;
  if (ans && bns) {
    const al = a.localName === "xmlns" ? "" : a.localName || "";
    const bl = b.localName === "xmlns" ? "" : b.localName || "";
    return al < bl ? -1 : al > bl ? 1 : 0;
  }
  const au = a.namespaceURI || "";
  const bu = b.namespaceURI || "";
  if (au !== bu) return au < bu ? -1 : 1;
  const al = a.localName || a.nodeName;
  const bl = b.localName || b.nodeName;
  return al < bl ? -1 : al > bl ? 1 : 0;
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&#x9;")
    .replace(/\n/g, "&#xA;")
    .replace(/\r/g, "&#xD;");
}

function renderNode(node: Node, nsRendered: Record<string, string>): string {
  switch (node.nodeType) {
    case 1: {
      const el = node as Element;
      const newNs = { ...nsRendered };
      let out = "<" + el.nodeName;

      const attrs = Array.from(el.attributes).slice().sort(attrCompare);
      const nsDecls: string[] = [];
      const otherAttrs: string[] = [];

      // Déclarations de namespace nécessaires (différence avec le contexte parent)
      for (const a of attrs) {
        if (a.namespaceURI === "http://www.w3.org/2000/xmlns/") {
          const prefix = a.localName === "xmlns" ? "" : a.localName || "";
          if (newNs[prefix] !== a.value) {
            newNs[prefix] = a.value;
            nsDecls.push(" " + a.nodeName + '="' + escapeAttr(a.value) + '"');
          }
        }
      }
      // Namespace de l'élément lui-même
      const elPrefix = el.prefix || "";
      if (el.namespaceURI && newNs[elPrefix] !== el.namespaceURI) {
        const decl = elPrefix ? "xmlns:" + elPrefix : "xmlns";
        if (!nsDecls.some((d) => d.includes(decl + "="))) {
          newNs[elPrefix] = el.namespaceURI;
          nsDecls.push(" " + decl + '="' + escapeAttr(el.namespaceURI) + '"');
        }
      }
      for (const a of attrs) {
        if (a.namespaceURI !== "http://www.w3.org/2000/xmlns/") {
          otherAttrs.push(" " + a.nodeName + '="' + escapeAttr(a.value) + '"');
        }
      }

      out += nsDecls.sort().join("") + otherAttrs.join("") + ">";
      for (const child of Array.from(el.childNodes)) out += renderNode(child, newNs);
      out += "</" + el.nodeName + ">";
      return out;
    }
    case 3:
      return escapeText((node as Text).data);
    case 4:
      return escapeText((node as CharacterData).data);
    case 8:
      return "";
    default:
      return "";
  }
}

export function canonicalize(node: Node): string {
  return renderNode(node, {});
}
