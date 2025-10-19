// Orbital math utilities and rendering helpers
// We use simple Keplerian-like ellipses centered in the SVG with the Sun at a focus.
// Note: Not to scale with real astronomical distances; visually tuned while preserving eccentricity feel.

function daysInMonth(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

function daysInYearUTC(year) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return Math.round((end - start) / 86400000);
}

export function angleFromTime({ hours, minutes, seconds, milliseconds, date }) {
  // Continuous angles for smooth motion
  const sec = seconds + milliseconds / 1000;
  // Minute orbit (Mercury): one full revolution per minute
  const minuteProgress = sec / 60; // 0..1 within current minute
  // Hour orbit (Earth): one full revolution per hour
  const hourProgress = (minutes + sec / 60) / 60; // 0..1 within current hour

  // Additional cycles require the Date object
  const d = date instanceof Date ? date : new Date();
  // Day orbit: one full revolution per 24 hours
  const dayProgress = (hours + minutes / 60 + sec / 3600) / 24;
  // Week orbit: one full revolution per 7 days (Sunday=0)
  const dow = d.getDay(); // 0..6
  const weekProgress = (dow + dayProgress) / 7;
  // Month orbit: one full revolution per calendar month
  const dim = daysInMonth(d);
  const domIndex = (d.getDate() - 1) + dayProgress; // 0-based day index + time fraction
  const monthProgress = domIndex / dim;
  // Year orbit: one full revolution per year (365/366 days)
  const y = d.getFullYear();
  const startUTC = Date.UTC(y, 0, 1, 0, 0, 0, 0);
  const nowUTC = Date.UTC(y, d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  const doy = (nowUTC - startUTC) / 86400000; // fractional day of year
  const diy = daysInYearUTC(y);
  const yearProgress = doy / diy;

  const TAU = Math.PI * 2;
  return {
    minuteAngle: minuteProgress * TAU,
    hourAngle: hourProgress * TAU,
    dayAngle: dayProgress * TAU,
    weekAngle: weekProgress * TAU,
    monthAngle: monthProgress * TAU,
    yearAngle: yearProgress * TAU,
  };
}

export function pointOnEllipse(cx, cy, rx, ry, theta, eccentricity = 0) {
  // For a simple ellipse centered at (cx,cy), if we want the Sun at a focus,
  // we translate the center by c = e * a along the x-axis. We'll approximate by shifting the group.
  const x = cx + rx * Math.cos(theta);
  const y = cy + ry * Math.sin(theta);
  return { x, y };
}

export function setPlanetPosition(el, x, y) {
  el.setAttribute('cx', x.toFixed(2));
  el.setAttribute('cy', y.toFixed(2));
}

export function drawTickMarks(svg, cx, cy, rOuter, count, opts = {}) {
  // Draw crisp tick marks using <line> elements
  const { rInner = rOuter - 10, color = '#ffffff33', width = 1 } = opts;
  const gId = opts.id || `ticks-${count}`;
  let g = svg.querySelector(`#${gId}`);
  if (!g) {
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', gId);
    svg.appendChild(g);
  } else {
    g.innerHTML = '';
  }
  const TAU = Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    const x1 = cx + rInner * Math.cos(a);
    const y1 = cy + rInner * Math.sin(a);
    const x2 = cx + rOuter * Math.cos(a);
    const y2 = cy + rOuter * Math.sin(a);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', String(width));
    line.setAttribute('shape-rendering', 'crispEdges');
    g.appendChild(line);
  }
}
