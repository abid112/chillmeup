# 🎵 Chill Me Up!

> **Find the perfect Spotify playlist for your mood — powered by live weather, time of day, and your browsing energy.**

Chill Me Up! is a single-page web app that silently reads real-world signals (your location's live weather, the current hour, and browser activity patterns) and recommends a matching Spotify playlist — no login, no sign-up, no API keys required from the user.

🔗 **Live App:** [chillmeup.replit.app](https://chillmeup.replit.app) *(replace with your deployed URL)*

---

## ✨ Features

- **Live weather analysis** — fetches real-time conditions (rain, snow, sunshine, clouds) via [Open-Meteo](https://open-meteo.com/) (no API key needed)
- **Reverse geocoding** — converts browser coordinates to a city name via [Nominatim](https://nominatim.org/) (no API key needed)
- **Time-of-day awareness** — detects morning, afternoon, evening, or late-night energy
- **Browser activity signals** — estimates engagement level from scroll depth, time on page, and tab focus state
- **Animated scanning experience** — 8-step progress flow with smooth Framer Motion animations
- **23 verified Spotify playlists** — every playlist ID live-tested against Spotify's oEmbed API; no dead links
- **Real playlist artwork** — fetches official Spotify cover art via a server-side proxy (no Spotify auth needed)
- **Optional location** — users can skip geolocation; app gracefully falls back to time-of-day + browser signals only
- **Age & gender context** — optional dropdowns that can refine the mood analysis
- **Fully responsive** — works on mobile and desktop
- **No tracking, no accounts** — everything runs client-side or through a lightweight proxy

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Express 5 + TypeScript |
| Logging | Pino |
| Monorepo | pnpm workspaces |
| Weather API | Open-Meteo (free, no key) |
| Geocoding | Nominatim / OpenStreetMap (free, no key) |
| Playlist art | Spotify oEmbed (public endpoint, no auth) |

---

## 🧠 How It Works

```
User opens app
      │
      ▼
[Optional] Grant browser location
      │
      ├─ Granted ──► Fetch GPS coords ──► Open-Meteo weather ──► Nominatim city name
      │
      └─ Skipped ──► No weather data (time-of-day only)
      │
      ▼
Detect browser energy signals
  (scroll depth, time on page, tab visibility)
      │
      ▼
Map signals ──► Mood key (e.g. "rainy", "morning", "latenight")
           ──► Energy level (Low / Medium / High)
      │
      ▼
Look up MOOD_MAP ──► Pick random playlist from matching pool
      │
      ▼
Fetch real cover art via /api/playlist-image proxy
      │
      ▼
Show result card with playlist name, description, art, and Spotify link
```

### Mood Keys

| Key | Triggered when |
|---|---|
| `rain` | Weather code = drizzle or rain |
| `thunder` | Weather code = thunderstorm |
| `snow` | Weather code = snow |
| `cloudy` | Weather code = overcast / fog |
| `sunnyDay` | Clear sky + daytime hours |
| `clearNight` | Clear sky + nighttime hours |
| `morning` | Hour 5–11 (fallback) |
| `afternoon` | Hour 12–17 (fallback) |
| `evening` | Hour 18–21 (fallback) |
| `latenight` | Hour 22–4 (fallback) |

### Energy Detection

Browser signals are scored 0–100 and mapped to:
- **Low** — little activity (slow scroll, short session, tab in background)
- **Medium** — moderate activity
- **High** — heavy activity (rapid scroll, long session, tab focused)

---

## 📁 Project Structure

```
/
├── artifacts/
│   ├── moodtune/                   # React frontend
│   │   ├── public/
│   │   │   └── logo.png            # App logo / favicon
│   │   └── src/
│   │       ├── hooks/
│   │       │   └── useMoodAnalyzer.ts  # Core mood logic, playlist pool, browser signals
│   │       ├── pages/
│   │       │   └── Home.tsx            # Full single-page UI
│   │       └── index.css               # Global styles (Tailwind base)
│   │
│   └── api-server/                 # Express backend
│       └── src/
│           ├── routes/
│           │   ├── index.ts            # Route registry
│           │   ├── weather.ts          # GET /api/weather  (Open-Meteo proxy)
│           │   └── playlistImage.ts    # GET /api/playlist-image (Spotify oEmbed proxy)
│           └── app.ts                  # Express app setup
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/chill-me-up.git
cd chill-me-up

# 2. Install dependencies
pnpm install

# 3. Start the API server (runs on PORT env var, default 3001)
pnpm --filter @workspace/api-server run dev

# 4. Start the frontend (in a separate terminal)
pnpm --filter @workspace/moodtune run dev
```

Open `http://localhost:5173` in your browser.

> **No API keys required.** Open-Meteo, Nominatim, and Spotify oEmbed are all free public endpoints.

---

## 🎧 Verified Playlist Pool

All 23 playlists are live-verified against Spotify's oEmbed API. No dead links.

| Key | Spotify Name | Vibe |
|---|---|---|
| peacefulPiano | Peaceful Piano | Calm / Focus |
| deepFocus | Deep Focus | Calm / Focus |
| sleep | Sleep | Calm / Sleep |
| jazzVibes | Jazz Classics | Calm / Jazz |
| chillHits | Chill Hits | Chill |
| chillVibes | Mood Booster | Chill / Happy |
| morningMood | Peaceful Guitar | Morning |
| loungeVibes | Yoga & Meditation | Lounge |
| rainyDay | Rainy Day | Rain |
| indiePop | All New Indie | Indie / Rain |
| vivaLatino | Reggae Classics | Sunny |
| happyHits | Happy Hits! | Happy |
| topHits | Today's Top Hits | Pop |
| mint | mint | Pop / Fresh |
| popRising | Pop Rising | Pop |
| rockClassics | Rock Classics | Rock |
| powerWorkout | Beast Mode | Workout / High energy |
| cardio | Gym Hits | Workout / High energy |
| danceHits | Rock Party | Dance / Party |
| dancePop | All Out 60s | Throwback |
| allOut90s | All Out 90s | Throwback |
| allOut2010s | All Out 2010s | Throwback |
| rapCaviar | RapCaviar | Hip-hop |

---

## 🌐 API Endpoints

### `GET /api/health`
Returns server status.

### `GET /api/weather?lat={lat}&lon={lon}`
Proxies Open-Meteo and Nominatim. Returns current weather code, temperature, and city name.

### `GET /api/playlist-image?id={spotifyPlaylistId}`
Proxies Spotify's public oEmbed endpoint. Returns `{ imageUrl: string | null }`.

---

## 🤝 Contributing

Contributions are welcome! If you want to add more verified playlists:

1. Test the playlist ID against `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/{ID}`
2. Confirm it returns `200` with a `thumbnail_url`
3. Add it to the `P` object in `useMoodAnalyzer.ts` with the correct name from the oEmbed `title` field
4. Add it to the relevant mood pools in `MOOD_MAP`

Please do **not** add unverified playlist IDs — they will return broken links for users.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## ☕ Support

Made with ❤️ by **Abid Hasan**

If you find this tool useful, consider buying me a coffee:
👉 [buymeacoffee.com/abid_hasan112](https://buymeacoffee.com/abid_hasan112)
