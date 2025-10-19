// --- Sustainability API Integration (CO2 concentration) ---
// Using Open-Meteo's CO2 API (https://open-meteo.com/en/docs/co2-api) as an example
const CO2_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=0&longitude=0&hourly=co2';
let co2Level = null; // in ppm
let co2Status = 'neutral'; // 'good', 'bad', 'neutral'
let marketChange = 0; // percent change for stock

function fetchCO2Status() {
  fetch(CO2_API_URL)
    .then(res => res.json())
    .then(data => {
      // Get the latest CO2 value (ppm)
      const arr = data.hourly && data.hourly.co2;
      if (!arr || !arr.length) return;
      const latest = arr[arr.length - 1];
      co2Level = latest;
      // Keep co2Status for fallback, but use co2Level for gradient
      if (co2Level < 420) co2Status = 'good';
      else if (co2Level > 440) co2Status = 'bad';
      else co2Status = 'neutral';
    })
    .catch(() => { co2Status = 'neutral'; co2Level = null; });
}

// Poll every 60 minutes (CO2 doesn't change rapidly)
setInterval(fetchCO2Status, 60 * 60 * 1000);
fetchCO2Status();
function lerpColor(a, b, t) {
  // a, b: hex color strings '#rrggbb', t: 0..1
  const ah = a.replace('#', '');
  const bh = b.replace('#', '');
  const ar = parseInt(ah.substring(0,2),16), ag = parseInt(ah.substring(2,4),16), ab = parseInt(ah.substring(4,6),16);
  const br = parseInt(bh.substring(0,2),16), bg = parseInt(bh.substring(2,4),16), bb = parseInt(bh.substring(4,6),16);
  const rr = Math.round(ar + (br-ar)*t);
  const rg = Math.round(ag + (bg-ag)*t);
  const rb = Math.round(ab + (bb-ab)*t);
  return `#${rr.toString(16).padStart(2,'0')}${rg.toString(16).padStart(2,'0')}${rb.toString(16).padStart(2,'0')}`;
}

function getCO2Color() {
  // Use a gradient: green (good) < yellow (neutral) < red (bad)
  // Clamp CO2 to [400, 460] ppm for color mapping
  let t = 0.5;
  if (typeof co2Level === 'number') {
    t = (co2Level - 400) / 60; // 400ppm => 0, 430ppm => 0.5, 460ppm => 1
    t = Math.max(0, Math.min(1, t));
  }
  // Green #4caf50, Yellow #ffd600, Red #e53935
  if (t < 0.5) {
    // Green to Yellow
    return lerpColor('#4caf50', '#ffd600', t*2);
  } else {
    // Yellow to Red
    return lerpColor('#ffd600', '#e53935', (t-0.5)*2);
  }
}
// --- Landing/Loading page logic ---
// --- Animated landing stars ---
const landingStarsCanvas = document.getElementById('landingStars');
const landingStarsCtx = landingStarsCanvas ? landingStarsCanvas.getContext('2d', { alpha: true }) : null;
let landingStars = [];
const LANDING_STAR_COUNT = 32;
function initLandingStars() {
  if (!landingStarsCanvas) return;
  const w = landingStarsCanvas.width = landingStarsCanvas.offsetWidth;
  const h = landingStarsCanvas.height = landingStarsCanvas.offsetHeight;
  landingStars = Array.from({ length: LANDING_STAR_COUNT }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 18 + Math.random() * (w/2 - 18);
    return {
      baseX: w/2 + Math.cos(angle) * radius,
      baseY: h/2 + Math.sin(angle) * radius,
      r: Math.random() * 1.5 + 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
      orbit: 12 + Math.random() * 22,
    };
  });
}

function animateLandingStars(now) {
  if (!landingStarsCanvas || !landingStarsCtx || !landingStars.length || landing.getAttribute('aria-hidden') === 'true') return;
  const w = landingStarsCanvas.width;
  const h = landingStarsCanvas.height;
  landingStarsCtx.clearRect(0, 0, w, h);
  for (const s of landingStars) {
    // Celestial drift: each star orbits its base position
    const t = now * 0.0002 * s.speed + s.phase;
    const x = s.baseX + Math.cos(t) * s.orbit;
    const y = s.baseY + Math.sin(t) * s.orbit * 0.7;
    landingStarsCtx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2);
    landingStarsCtx.beginPath();
    landingStarsCtx.arc(x, y, s.r, 0, Math.PI * 2);
    landingStarsCtx.fillStyle = '#fff8ff';
    landingStarsCtx.shadowColor = '#a259ff';
    landingStarsCtx.shadowBlur = 8;
    landingStarsCtx.fill();
    landingStarsCtx.shadowBlur = 0;
  }
  landingStarsCtx.globalAlpha = 1;
  requestAnimationFrame(animateLandingStars);
}

window.addEventListener('load', () => {
  if (landingStarsCanvas) {
    initLandingStars();
    animateLandingStars(performance.now());
    window.addEventListener('resize', () => {
      initLandingStars();
    });
  }
});
const landing = document.getElementById('landing');
const startBtn = document.getElementById('startBtn');
function hideLanding() {
  if (!landing) return;
  landing.setAttribute('aria-hidden', 'true');
  setTimeout(() => { landing.style.display = 'none'; }, 800);
}
if (startBtn) {
  startBtn.addEventListener('click', hideLanding);
  startBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') hideLanding();
  });
}
// Auto-hide after 2.5s if user doesn't click
setTimeout(hideLanding, 2500);

// --- Controls menu toggle ---
const controlsMenu = document.getElementById('controls');
const controlsToggle = document.getElementById('controlsToggle');
// Collapse controls menu by default
controlsMenu.classList.add('collapsed');
controlsToggle.setAttribute('aria-expanded', 'false');
controlsToggle.addEventListener('click', () => {
  const isCollapsed = controlsMenu.classList.toggle('collapsed');
  controlsToggle.setAttribute('aria-expanded', (!isCollapsed).toString());
});

import { angleFromTime, pointOnEllipse, setPlanetPosition } from './orbits.js';

// --- Stock Market API Integration ---
// Using Alpha Vantage demo API (replace with your own key for production)
const STOCK_API_KEY = '46335DTYP07KKIUP'; // Replace with your own key for production
const STOCK_API_URL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${STOCK_API_KEY}`;
let marketStatus = 'neutral'; // 'up', 'down', 'neutral'
let lastMarketPrice = null;

function fetchMarketStatus() {
  fetch(STOCK_API_URL)
    .then(res => res.json())
    .then(data => {
      const quote = data['Global Quote'];
      if (!quote) return;
      const price = parseFloat(quote['05. price']);
      const prevClose = parseFloat(quote['08. previous close']);
      if (isNaN(price) || isNaN(prevClose)) return;
      lastMarketPrice = price;
      marketChange = ((price - prevClose) / prevClose) * 100;
      if (price > prevClose) marketStatus = 'up';
      else if (price < prevClose) marketStatus = 'down';
      else marketStatus = 'neutral';
    })
    .catch(() => { marketStatus = 'neutral'; marketChange = 0; });
}

// Poll every 60 seconds
setInterval(fetchMarketStatus, 60000);
fetchMarketStatus();

// Starfield heartbeat canvas
// --- Controls ---
const controls = {
  mercury: document.getElementById('toggleMercury'),
  earth: document.getElementById('toggleEarth'),
  venus: document.getElementById('toggleVenus'),
  mars: document.getElementById('toggleMars'),
  jupiter: document.getElementById('toggleJupiter'),
  saturn: document.getElementById('toggleSaturn'),
  theme: document.getElementById('themeSelect'),
  speed: document.getElementById('speedRange'),
  speedValue: document.getElementById('speedValue'),
  markerStyle: document.getElementById('markerStyle'),
  pauseBtn: document.getElementById('pauseBtn'),
};
let animationSpeed = 1;
let markerStyle = 'dot';
let paused = false;
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d', { alpha: true });
let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let stars = [];
const STAR_COUNT = 900; // tuned for perf; adjust with device size

function resize() {
  dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const { innerWidth: w, innerHeight: h } = window;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  initStars(w, h);
}

function randIn(min, max) { return Math.random() * (max - min) + min; }

function initStars(w, h) {
  const count = Math.round(STAR_COUNT * (w * h) / (1440 * 900));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: randIn(0.5, 1.6),
    baseAlpha: randIn(0.25, 0.9),
    twinklePhase: Math.random() * Math.PI * 2,
  }));
}

let lastSecond = -1;
let pulse = 0; // 0..1 easing for heartbeat

function drawStars(now) {
  if (paused) return;
  const w = canvas.width / dpr, h = canvas.height / dpr;
  ctx.clearRect(0, 0, w, h);

  // Second-based heartbeat
  const date = new Date();
  const sec = date.getSeconds();
  if (sec !== lastSecond) {
    lastSecond = sec;
    pulse = prefersReducedMotion.matches ? 0.3 : 1; // gentler for reduced motion
  }
  // Smoothly decay pulse
  pulse *= prefersReducedMotion.matches ? 0.93 : 0.86;

  for (const s of stars) {
  const base = prefersReducedMotion.matches ? 0.06 : 0.12;
  const tw = base * Math.sin((now / 1000) * 2 + s.twinklePhase); // subtle twinkle
  const a = Math.min(1, Math.max(0, s.baseAlpha + tw + pulse * 0.2));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
  const radius = prefersReducedMotion.matches ? s.r * (1 + pulse * 0.05) : s.r * (1 + pulse * 0.12);
  ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Orbital SVG setup
const svg = document.getElementById('orbits');
const mercury = document.getElementById('mercury');
const earth = document.getElementById('earth');
const venus = document.getElementById('venus');
const mars = document.getElementById('mars');
const jupiter = document.getElementById('jupiter');
const saturn = document.getElementById('saturn');

const mercuryOrbit = document.getElementById('mercury-orbit');
const earthOrbit = document.getElementById('earth-orbit');
const venusOrbit = document.getElementById('venus-orbit');
const marsOrbit = document.getElementById('mars-orbit');
const jupiterOrbit = document.getElementById('jupiter-orbit');
const saturnOrbit = document.getElementById('saturn-orbit');

const mercuryTitle = document.getElementById('mercury-title');
const earthTitle = document.getElementById('earth-title');
const venusTitle = document.getElementById('venus-title');
const marsTitle = document.getElementById('mars-title');
const jupiterTitle = document.getElementById('jupiter-title');
const saturnTitle = document.getElementById('saturn-title');

// Orbit geometry matching index.html viewBox 1000x700 and centers at (500,350)
const CENTER = { x: 500, y: 350 }; // Sun position
// Realistic eccentricities (approx)
const MERCURY = { rx: 220, ry: 200, e: 0.2056 };
const EARTH = { rx: 320, ry: 260, e: 0.0167 };
const VENUS = { rx: 400, ry: 300, e: 0.0068 };
const MARS = { rx: 470, ry: 330, e: 0.0934 };
const JUPITER = { rx: 540, ry: 360, e: 0.0489 };
const SATURN = { rx: 610, ry: 390, e: 0.0565 };
// All orbits share the same vertical center
function uniformOrbitCenter() {
  return { x: CENTER.x, y: CENTER.y };
}
const MERCURY_CENTER = uniformOrbitCenter();
const EARTH_CENTER = uniformOrbitCenter();
const VENUS_CENTER = uniformOrbitCenter();
const MARS_CENTER = uniformOrbitCenter();
const JUPITER_CENTER = uniformOrbitCenter();
const SATURN_CENTER = uniformOrbitCenter();


function getMarketColor() {
  // Use a gradient: red (down) < yellow (neutral) < green (up)
  // Clamp percent change to [-2, 2] for color mapping
  let t = 0.5;
  if (typeof marketChange === 'number') {
    t = (marketChange + 2) / 4; // -2% => 0, 0% => 0.5, +2% => 1
    t = Math.max(0, Math.min(1, t));
  }
  // Red #e53935, Yellow #ffd600, Green #4caf50
  if (t < 0.5) {
    // Red to Yellow
    return lerpColor('#e53935', '#ffd600', t*2);
  } else {
    // Yellow to Green
    return lerpColor('#ffd600', '#4caf50', (t-0.5)*2);
  }
}

function updateOrbits(now) {
  if (paused) return;
  const t = new Date();
  const hours = t.getHours();
  const minutes = t.getMinutes();
  const seconds = t.getSeconds();
  const milliseconds = t.getMilliseconds();
  const { minuteAngle, hourAngle, dayAngle, weekAngle, monthAngle, yearAngle } = angleFromTime({ hours, minutes, seconds, milliseconds, date: t });

  // Align 0 to the top (12 o'clock) and keep clockwise motion
  const CLOCK_ANGLE_OFFSET = -Math.PI / 2; // top of ellipse
  const mAngle = minuteAngle + CLOCK_ANGLE_OFFSET;
  const eAngle = hourAngle + CLOCK_ANGLE_OFFSET;
  const vAngle = dayAngle + CLOCK_ANGLE_OFFSET;
  const maAngle = weekAngle + CLOCK_ANGLE_OFFSET;
  const jAngle = monthAngle + CLOCK_ANGLE_OFFSET;
  const sAngle = yearAngle + CLOCK_ANGLE_OFFSET;

  const m = pointOnEllipse(MERCURY_CENTER.x, MERCURY_CENTER.y, MERCURY.rx, MERCURY.ry, mAngle);
  const e = pointOnEllipse(EARTH_CENTER.x, EARTH_CENTER.y, EARTH.rx, EARTH.ry, eAngle);
  const v = pointOnEllipse(VENUS_CENTER.x, VENUS_CENTER.y, VENUS.rx, VENUS.ry, vAngle);
  const ma = pointOnEllipse(MARS_CENTER.x, MARS_CENTER.y, MARS.rx, MARS.ry, maAngle);
  const j = pointOnEllipse(JUPITER_CENTER.x, JUPITER_CENTER.y, JUPITER.rx, JUPITER.ry, jAngle);
  const s = pointOnEllipse(SATURN_CENTER.x, SATURN_CENTER.y, SATURN.rx, SATURN.ry, sAngle);

  // Orbit visibility toggles
  mercury.style.display = controls.mercury.checked ? '' : 'none';
  earth.style.display = controls.earth.checked ? '' : 'none';
  venus.style.display = controls.venus.checked ? '' : 'none';
  mars.style.display = controls.mars.checked ? '' : 'none';
  jupiter.style.display = controls.jupiter.checked ? '' : 'none';
  saturn.style.display = controls.saturn.checked ? '' : 'none';

  setPlanetPosition(mercury, m.x, m.y);
  setPlanetPosition(earth, e.x, e.y);
  setPlanetPosition(venus, v.x, v.y);
  setPlanetPosition(mars, ma.x, ma.y);
  setPlanetPosition(jupiter, j.x, j.y);
  setPlanetPosition(saturn, s.x, s.y);

  // Marker style for all planets
  [mercury, earth, venus, mars, jupiter, saturn].forEach((planet) => {
    planet.setAttribute('filter', markerStyle === 'glow' ? 'url(#softShadow)' : '');
    planet.setAttribute('stroke-width', markerStyle === 'ring' ? '3' : '1');
    planet.setAttribute('opacity', markerStyle === 'dot' ? '1' : '0.95');
  });
  // Only Mercury color changes with market
  const mercuryColor = getMarketColor();
  mercury.setAttribute('fill', mercuryColor);
  mercury.setAttribute('stroke', mercuryColor);
  // Only Earth color changes with CO2/sustainability
  const earthColor = getCO2Color();
  earth.setAttribute('fill', earthColor);
  earth.setAttribute('stroke', earthColor);

  // Update tooltips
  if (mercuryTitle) mercuryTitle.textContent = `Seconds in minute: ${String(seconds).padStart(2, '0')}`;
  if (earthTitle) earthTitle.textContent = `Minutes in hour: ${String(minutes).padStart(2, '0')}`;
  if (venusTitle) venusTitle.textContent = `Hours in day: ${String(hours).padStart(2, '0')}`;
  if (marsTitle) marsTitle.textContent = `Day of week: ${t.toLocaleDateString(undefined, { weekday: 'long' })}`;
  if (jupiterTitle) jupiterTitle.textContent = `Day of month: ${t.getDate()}`;
  if (saturnTitle) saturnTitle.textContent = `Day of year: ${Math.floor((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(t.getFullYear(), 0, 1)) / 86400000) + 1}`;
}

// HUD time text and 12/24 toggle
const timeText = document.getElementById('timeText');
const toggleFormatBtn = document.getElementById('toggleFormat');
let use12h = true;
let lastTextUpdate = 0;

function formatTime(date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  let suffix = '';
  if (use12h) {
    suffix = h >= 12 ? ' PM' : ' AM';
    h = h % 12; if (h === 0) h = 12;
  }
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (!use12h) {
    const hh = String(h).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${h}:${mm}:${ss}${suffix}`;
}

function updateTimeText(nowTs) {
  if (!nowTs) nowTs = performance.now();
  if (nowTs - lastTextUpdate < 200) return; // throttle updates
  lastTextUpdate = nowTs;
  const now = new Date();
  timeText.textContent = formatTime(now);
}

toggleFormatBtn.addEventListener('click', () => {
  use12h = !use12h;
  toggleFormatBtn.textContent = use12h ? '12h' : '24h';
  updateTimeText();
});

toggleFormatBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleFormatBtn.click();
  }
});

// Initial draw of tick marks (optional subtle rings)
window.addEventListener('load', () => {
  // Position orbit ellipses so the Sun sits at a focus
  if (mercuryOrbit) {
      mercuryOrbit.setAttribute('cx', CENTER.x);
      mercuryOrbit.setAttribute('cy', CENTER.y);
  }
  if (earthOrbit) {
      earthOrbit.setAttribute('cx', CENTER.x);
      earthOrbit.setAttribute('cy', CENTER.y);
  }
  if (venusOrbit) {
      venusOrbit.setAttribute('cx', CENTER.x);
      venusOrbit.setAttribute('cy', CENTER.y);
  }
  if (marsOrbit) {
      marsOrbit.setAttribute('cx', CENTER.x);
      marsOrbit.setAttribute('cy', CENTER.y);
  }
  if (jupiterOrbit) {
      jupiterOrbit.setAttribute('cx', CENTER.x);
      jupiterOrbit.setAttribute('cy', CENTER.y);
  }
  if (saturnOrbit) {
      saturnOrbit.setAttribute('cx', CENTER.x);
      saturnOrbit.setAttribute('cy', CENTER.y);
  }
});

function loop(now) {
  drawStars(now);
  updateOrbits(now);
  updateTimeText(now);
  if (!paused) {
    requestAnimationFrame((t) => loop(t * animationSpeed));
  }
}


window.addEventListener('resize', resize, { passive: true });
resize();
requestAnimationFrame(loop);

// --- Controls wiring ---
controls.theme.addEventListener('change', (e) => {
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-cosmic');
  document.body.classList.add('theme-' + controls.theme.value);
});
controls.speed.addEventListener('input', (e) => {
  animationSpeed = parseFloat(controls.speed.value);
  controls.speedValue.textContent = animationSpeed.toFixed(2) + 'x';
});
controls.markerStyle.addEventListener('change', (e) => {
  markerStyle = controls.markerStyle.value;
});
controls.pauseBtn.addEventListener('click', () => {
  paused = !paused;
  controls.pauseBtn.classList.toggle('paused', paused);
  controls.pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) requestAnimationFrame(loop);
});
// Orbit toggles: update immediately on change
[controls.mercury, controls.earth, controls.venus, controls.mars, controls.jupiter, controls.saturn].forEach((el) => {
  el.addEventListener('change', () => {
    updateOrbits(performance.now());
  });
});
