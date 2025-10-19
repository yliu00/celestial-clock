# Celestial Clock

> Built for HackTX 2025 — a cosmic hackathon project that visualizes time as celestial motion.

**Live Demo:** https://yliu00.github.io/celestial-clock/

## What is it?

Celestial Clock is a real-time, interactive website that tells time using stars and planetary orbits. Instead of numbers, you see:

- **Starfield heartbeat:** Animated stars pulse and twinkle every second.
- **Planetary orbits:** Each planet tracks a different time cycle:
	- Mercury: seconds in a minute (color reflects stock market performance)
	- Earth: minutes in an hour (color reflects real-time CO2 concentration)
	- Venus: hours in a day
	- Mars: day of week
	- Jupiter: day of month
	- Saturn: day of year
- **Landing page:** Animated cosmic stars and a purple-themed start button.
- **Control panel:** Toggle orbits, switch theme, adjust animation speed, and more.
- **Accessibility:** ARIA live regions, keyboard navigation, and responsive design.

## Tech Stack

- **Languages:** HTML, CSS, JavaScript (ES6+)
- **Graphics:** SVG (orbits, planets), Canvas (starfields)
- **APIs:**
	- Alpha Vantage (stock market data for Mercury)
	- Open-Meteo Air Quality API (CO2 data for Earth)
- **Fonts:** Google Fonts (Montserrat, Poppins)
- **No frameworks, no backend, no database.**

## How to Run Locally

1. Clone the repo:
	 ```sh
	 git clone https://github.com/yliu00/celestial-clock.git
	 cd celestial-clock
	 ```
2. Open `index.html` in your browser.
3. Or serve with any static server (e.g., Python, VS Code Live Server).

## Features

- Animated starfield background and landing overlay
- Real-time planetary orbits for all major time cycles
- Dynamic planet colors based on live stock market and CO2 data
- Beautiful, modern UI with cosmic gradients and themes
- Fully accessible and responsive

## HackTX Notes

- Built in 24 hours for HackTX 2025
- Team: Yichen & Annabelle
- APIs used: Alpha Vantage, Open-Meteo
- No backend, no database, just pure client-side magic

---

Made with 💜 at HackTX
