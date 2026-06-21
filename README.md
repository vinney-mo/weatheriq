# WeatherIQ

A weather dashboard built with Next.js that consumes the [WeatherAI API](https://weather-ai.co/docs).

**Live demo:** https://weatheriq-seven.vercel.app/

## What it does

The app has two views, switched with a **Today / Forecast** toggle, plus two
global controls  - **Units** (metric / imperial, imperial is the default) and
**AI Summary** (on / off, on is the default).

- **Today** (default view)  - current conditions, a daily summary, and an
  hourly breakdown table for the selected location.
- **Forecast**  - a 7-day outlook shown as one card per day; clicking a day
  shows that day's hourly detail.

A city dropdown (Mombasa, Kisumu, and others, plus an "Auto-detect" default based on your IP address)
controls location.


## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- No database  - all state is in-memory on the client for the current session

## Setup

Requirements: Node.js 20+, a WeatherAI API key.

```bash
git clone <repository-url>
cd weatheriq
npm install
```

Create `.env.local` in the project root:

```env
WEATHER_AI_API_KEY=your_api_key
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Build & run in production

```bash
npm run build
npm start
```

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com) (or any Node-compatible host).
3. Add the `WEATHER_AI_API_KEY` environment variable in the project settings.
4. Deploy.