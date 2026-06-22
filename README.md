# Apricot Token Decoder 🍑

Décodeur de jetons **JWT (OAuth2 / OIDC)** et **SAML**, qui fonctionne **entièrement dans votre navigateur**.

> **Aucune donnée n'est envoyée, stockée ou journalisée.** Tout le décodage et la vérification de signature se font côté client. Aucun backend, aucune télémétrie, aucun cookie. L'application fonctionne même hors-ligne (PWA).

## Fonctionnalités

- **JWT / OIDC** — décodage du header et du payload, claims standards annotés, dates `exp` / `iat` / `nbf` converties en heure locale, badges de validité (expiré, pas encore valide…).
- **Vérification de signature JWT** — via l'API native Web Crypto : `RS256/384/512`, `PS256/384/512`, `ES256/384/512`, `HS256/384/512`. Clé au format **PEM**, **JWK** ou **JWKS** (sélection par `kid`), secret partagé pour HMAC.
- **SAML** — décodage `base64` et `base64 + DEFLATE` (Redirect binding), XML reformaté et coloré, extraction de l'`Issuer`, du `NameID`, des `Conditions` temporelles et des attributs.
- **Vérification XML-DSig SAML** — canonicalisation C14N, contrôle du digest de référence et de la signature (RSA-SHA256/384/512, ECDSA-SHA256), certificat X.509 inclus dans le XML ou fourni à la main.
- **Comparaison** — deux jetons côte à côte, diff des claims avec mise en évidence (modifié / ajouté / retiré) et masquage des claims identiques.
- **Thème clair / sombre** — bascule persistée localement (seule donnée conservée : votre préférence de thème).

## Pourquoi « zéro rétention »

Le code source ne contient **aucun** appel réseau (`fetch`, `XHR`, WebSocket, analytics). Vous pouvez le vérifier dans l'onglet *Réseau* de votre navigateur : une fois la page chargée, plus rien ne sort. Le projet est open source pour que ce soit auditable.

## Développement

```bash
npm install      # installer les dépendances
npm run dev      # serveur de développement
npm test         # tests unitaires (Vitest)
npm run build    # build de production dans dist/
```

## Déploiement

Le push sur `main` déclenche le workflow GitHub Actions (`.github/workflows/deploy.yml`) qui teste, build et publie sur **GitHub Pages**. Pensez à activer *Settings → Pages → Source : GitHub Actions* sur le dépôt.

La `base` Vite est `/apricot-token-decoder/` pour correspondre au nom du dépôt.

## Stack

React + TypeScript + Vite · Web Crypto API · pako (DEFLATE) · Vitest. Aucune dépendance de cryptographie tierce.

## Licence

MIT
