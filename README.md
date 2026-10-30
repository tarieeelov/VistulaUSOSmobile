# Vistula University USOS Mobile App

Modern, production-ready React Native (Expo) mobile application for students of Vistula University using the official USOS API.

## Features
- **OAuth 1.0a HMAC-SHA1 Authentication**: Pure JavaScript signature generation via `oauth-1.0a` and `crypto-js` (no native crypto polyfill crashes).
- **Offline-First Architecture**: Transparent local caching with `@react-native-async-storage/async-storage` ensuring timetable and grades remain accessible in offline classrooms.
- **Timetable & Schedule**: Day selector, ongoing class highlight with progress bars, and upcoming class alerts.
- **Grades & ECTS Dashboard**: Term switcher, GPA calculation, color-coded grade badges.
- **Student ID & Profile**: Digital student ID card with photo, album number, and direct links to university portals.
- **Demo Mode**: One-tap demo mode with realistic mock data for instant testing without requiring USOS credentials.
- **Light & Dark Mode**: Seamless theme switching with high-contrast accessibility.

## Run the project

The application has two processes:

1. The Expo mobile client.
2. The OAuth proxy in `server/`. It is the only place where the USOS Consumer Secret exists and where OAuth 1.0a requests are signed.

Do not put a USOS Consumer Secret in the Expo `.env` file, `app.json`, or any mobile source file.

### Prerequisites

- Node.js 18 or newer (`node --version`)
- npm
- A new USOS Consumer Key and Consumer Secret. The former secret was present in client code; revoke/rotate it before using this version.
- A deployed HTTPS address for the proxy when testing a real mobile device. `localhost` on a phone means the phone itself, not your computer.

### 1. Configure and run the OAuth proxy

```bash
cd server
npm ci
cp .env.example .env
```

Set these values in `server/.env`:

```dotenv
USOS_CONSUMER_KEY=your-new-key
USOS_CONSUMER_SECRET=your-new-secret
SESSION_ENCRYPTION_KEY=base64-encoded-32-byte-random-key
USOS_CALLBACK_URL=vistulausos://oauth-callback
```

Generate the encryption key without saving it to shell history:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Start the proxy (it reads `server/.env`; your process manager or hosting platform must inject the same variables in production):

```bash
npm start
```

Verify it locally:

```bash
curl http://localhost:3000/health
```

Expected result: `{"ok":true}`.

The proxy deliberately permits only the four USOS endpoints used by the app. Its opaque session token is AES-256-GCM encrypted and expires after 30 days. Keep `SESSION_ENCRYPTION_KEY` stable across deployments; changing it invalidates active sessions.

### 2. Configure and run Expo

From the project root:

```bash
cp .env.example .env
```

Set the public proxy address:

```dotenv
EXPO_PUBLIC_USOS_PROXY_URL=https://your-usos-proxy.example.com
```

For an iOS simulator, `http://127.0.0.1:3000` works when the proxy runs on the same computer. For Android emulators use `http://10.0.2.2:3000`. For a physical device, deploy or tunnel the proxy using HTTPS and use that public URL.

Install and start the mobile client:

```bash
npm ci
npm start
```

Then choose one of these commands in a second terminal:

```bash
npm run ios
npm run android
npm run web
```

`Try Demo Mode` works in Expo Go. Real USOS login uses the configured `vistulausos://oauth-callback` deep link, so test it in an iOS/Android development build or a standalone build that has this app's scheme; do not use Expo Go for that flow.

### 3. Production checklist

- Deploy the proxy behind HTTPS.
- Store `USOS_CONSUMER_SECRET` and `SESSION_ENCRYPTION_KEY` in the host's secret manager, never in Git.
- Configure the exact callback URI in the USOS Consumer registration: `vistulausos://oauth-callback`.
- Rotate the previously exposed Consumer Secret before deployment.
- Build the native app only after setting `EXPO_PUBLIC_USOS_PROXY_URL` to the production proxy URL.

### Checks

```bash
npm run typecheck
npm run lint
```

`typecheck` is available now. `lint` requires ESLint to be added to the project first; it is not part of the current dependencies.

## Project Structure
```
vistula-usos-app/
├── app/                  # Expo Router file-based screens & layouts
│   ├── (tabs)/           # Main bottom-tab screens (Schedule, Grades, Profile)
│   ├── _layout.tsx       # Root navigation layout & providers
│   ├── index.tsx         # Splash / Auth gate redirector
│   └── login.tsx         # Login screen with USOS OAuth & Demo Mode
├── src/
│   ├── components/       # UI components (StudentCard, ClassCard, GradeRow, etc.)
│   ├── constants/        # Theme definitions (colors, typography, spacing)
│   ├── contexts/         # AuthContext & ThemeContext
│   ├── services/         # USOS API client, OAuth signer, cache, mock data
│   └── types/            # TypeScript interfaces for USOS models
└── assets/               # App icons and splash screens
```
