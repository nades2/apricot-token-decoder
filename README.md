# Apricot Token Decoder 🍑

Decode **JWT (OAuth2 / OIDC)** and **SAML** tokens — entirely **in your browser**.

> **No data is ever sent, stored or logged.** All decoding and signature verification happen client-side. No backend, no telemetry, no cookies. The app even works offline (PWA).

Live: **https://nades2.github.io/apricot-token-decoder/**

## Features

- **JWT / OIDC** — decodes the header and payload, annotates standard claims, converts `exp` / `iat` / `nbf` to local time, and flags validity (expired, not-yet-valid…).
- **JWT signature verification** — via the native Web Crypto API: `RS256/384/512`, `PS256/384/512`, `ES256/384/512`, `HS256/384/512`. Key as **PEM**, **JWK** or **JWKS** (selected by `kid`), shared secret for HMAC.
- **SAML** — decodes `base64` and `base64 + DEFLATE` (Redirect binding), reformats and highlights the XML, extracts the `Issuer`, `NameID`, time-based `Conditions` and attributes.
- **SAML XML-DSig verification** — C14N canonicalization, reference-digest check and signature verification (RSA-SHA256/384/512, ECDSA-SHA256), with the X.509 certificate embedded in the XML or pasted manually.
- **Compare** — two tokens side by side with automatic type detection (**JWT or SAML**), claim/field diff highlighting (changed / added / removed) and an option to hide identical fields.
- **Light / dark theme** and **bilingual UI (English / French)** — both persisted locally (the only data kept: your theme and language preference).

## Why "zero retention"

The source code contains **no** network calls (`fetch`, `XHR`, WebSocket, analytics). You can confirm it in your browser's *Network* tab: once the page has loaded, nothing leaves your machine. The project is open source so this is auditable.

## Development

```bash
npm install      # install dependencies
npm run dev      # development server
npm test         # unit tests (Vitest)
npm run build    # production build into dist/
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which tests, builds and publishes to **GitHub Pages**. Enable *Settings → Pages → Source: GitHub Actions* on the repository.

The Vite `base` is `/apricot-token-decoder/` to match the repository name.

## Stack

React + TypeScript + Vite · Web Crypto API · pako (DEFLATE) · Vitest. No third-party cryptography library.

## License

MIT
