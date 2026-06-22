// Utilitaires base64 / base64url — 100% navigateur, aucune dépendance réseau.

export function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function base64ToBytes(input: string): Uint8Array {
  const bin = atob(input.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes);
}

export function base64UrlToText(input: string): string {
  return bytesToText(base64UrlToBytes(input));
}

export function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
