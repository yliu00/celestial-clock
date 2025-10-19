# Celestial Clock

A lightweight, production-ready website that tells human time using a starfield heartbeat (seconds) and planetary orbits (minutes and hours).

- Seconds: subtle pulsing/twinkling stars
- Minutes: Mercury completes one revolution per minute (tracks seconds within the minute)
- Hours: Earth completes one revolution per hour (tracks minutes within the hour)

No build tools required. Pure HTML/CSS/JS.

## Run locally

Open `index.html` directly in your browser or host the folder with any static server.

## Implementation notes

- Starfield uses a single `<canvas>` with devicePixelRatio scaling and a decaying pulse once per second.
- Orbits are SVG ellipses with planets positioned via JS. Angles are derived from the current system time for smooth motion.
- Accessibility: time text is updated in an ARIA live region; keyboard support for the 12h/24h toggle.

## Deployment

Serve the folder with a static host (e.g., GitHub Pages, Netlify, Vercel, Azure Static Web Apps). No server-side code required.
