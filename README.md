# WhereMap

A cross-platform (Android + iOS) app for real-time location sharing in lobbies with speed leaderboards. Built with assistance from artificial intelligence (Claude).

## Architecture

- **Server**: Node.js + Express + Socket.IO (manages lobbies and relays location data)
- **Mobile**: React Native + Expo (cross-platform client)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only)
- Android: Android Studio + Android SDK

### Server

```bash
cd server
npm install
npm start
```

The server runs on port 3000 by default. Set `PORT` env var to change.

### Mobile

1. Edit `mobile/App.js` — set `serverUrl` to your server's LAN IP:

```js
const serverUrl = __DEV__
  ? 'http://192.168.1.X:3000'   // ← your server IP
  : 'http://YOUR_PRODUCTION_SERVER:3000';
```

2. For Google Maps on Android, add your API key in `mobile/app.json` under `android.config.googleMaps.apiKey` (not needed on iOS — Apple Maps is used by default).

3. Install and run:

```bash
cd mobile
npm install
npx expo start
```

- Scan QR code with Expo Go (Android/iOS)
- Or press `a` for Android emulator / `i` for iOS simulator

## How It Works

1. **Home** — set nickname, pick color, then create or join a lobby via 6-digit PIN
2. **Lobby** — see who joined; share the PIN so others can join
3. **Map** — real-time map showing all participants; tap a marker to see their speed. Your speed is shown at the bottom
4. **Leaderboard** — top speeds in the lobby, updated every 5 seconds

## Features

- Real-time location streaming via WebSocket relay
- 6-digit PIN-protected lobbies
- Per-user color selection
- Clickable map markers with speed callouts
- Live speedometer
- Top-speed leaderboard (ranked)
- Works in background (app state handled)
- Dark/light theme (follows device or manual toggle)

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

You are free to view, fork, study, and modify the code for **non-commercial purposes only**. Commercial use, distribution, or integration into commercial products is prohibited.