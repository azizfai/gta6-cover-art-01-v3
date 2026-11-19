// poster.js — the four Leonida Nights poster templates.
// Each template paints a complete procedural scene on a canvas of any size
// from a seed, then the title block, texture and an optional photo snapshot
// are layered on top. Same seed + same settings = the same poster.

import {
  mulberry32, hashSeed, pick, range, intRange,
  drawSky, drawSun, drawNeonRing, drawSkyline, drawPalm, drawCar, drawBoat,
  drawFigureMan, drawFigureWoman, drawDuffel, drawBirds, drawHelicopter,
  drawStars, drawHalftone, drawGrain, drawVignette, drawWetStreet,
} from './art.js';
import { applyGrade } from './grades.js';

export const TEMPLATES = {
  sunset: { label: 'Sunset Chase', accent: '#ffb35c' },
  neon: { label: 'Neon Nights', accent: '#ff5ea8' },
  beach: { label: 'Beach Heist', accent: '#19b3a6' },
  dawn: { label: 'Skyline Dawn', accent: '#ffd76a' },
};

const INK = '#160a24';

/** Sunset Chase: orange-pink sky, slit sun, highway, low car, palms. */
function drawSunset(ctx, w, h, rng) {
  const u = w / 1080;
  drawSky(ctx, w, h, [[0, '#3b1d5e'], [0.42, '#ff5e78'], [0.62, '#ff9a3d'], [0.78, '#ffd76a']], h * 0.62);
  ctx.save();
  ctx.shadowColor = '#ffdf8a';
  ctx.shadowBlur = 90 * u;
  drawSun(ctx, w * 0.62, h * 0.48, Math.min(w, h) * 0.155, '#fff3b0', true);
  ctx.restore();
  drawSkyline(ctx, w, h * 0.64, rng, { color: '#5a2a63', density: 0.7, minH: 26, maxH: 90, lit: 0.12 });
  // highway
  ctx.fillStyle = '#1c1026';
  ctx.fillRect(0, h * 0.64, w, h * 0.36);
  ctx.strokeStyle = 'rgba(255,215,106,0.85)';
  ctx.lineWidth = 5 * u;
  ctx.setLineDash([34 * u, 26 * u]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.64);
  ctx.lineTo(w * 0.42, h);
  ctx.moveTo(w * 0.5, h * 0.64);
  ctx.lineTo(w * 0.58, h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2 * u;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.66);
  ctx.lineTo(w, h * 0.66);
  ctx.stroke();
  drawPalm(ctx, w * 0.07, h * 0.68, 1.15 * u, INK, rng);
  drawPalm(ctx, w * 0.94, h * 0.66, 0.9 * u, INK, rng);
  drawPalm(ctx, w * 0.14, h * 0.7, 0.7 * u, INK, rng);
  drawCar(ctx, w * 0.3, h * 0.72, 0.75 * u, '#12081c', 'rgba(255,240,180,0.55)');
  drawFigureMan(ctx, w * 0.76, h * 0.84, 1.05 * u, INK, '#ffb35c');
  drawFigureWoman(ctx, w * 0.86, h * 0.84, 0.95 * u, INK, '#ff7eb0');
  drawBirds(ctx, rng, intRange(rng, 4, 8), w, h * 0.08, h * 0.3, 'rgba(40,10,50,0.8)');
}

/** Neon Nights: purple night, neon ring sun, glowing skyline, wet street. */
function drawNeon(ctx, w, h, rng) {
  const u = w / 1080;
  drawSky(ctx, w, h, [[0, '#0d0620'], [0.5, '#2a0a4a'], [0.75, '#160a33']], h * 0.6);
  drawStars(ctx, rng, 110, w, h, h * 0.45);
  drawNeonRing(ctx, w * 0.5, h * 0.32, w * 0.125, '#ff2e88');
  drawSkyline(ctx, w, h * 0.68, rng, { color: '#0a0618', density: 1.25, minH: 60, maxH: 230, lit: 0.5, neon: true });
  // neon sign bars rising from the street line (always grounded, never floating)
  for (let i = 0; i < 4; i++) {
    const x = range(rng, w * 0.08, w * 0.9);
    const bh = h * range(rng, 0.05, 0.11);
    ctx.save();
    ctx.shadowColor = pick(rng, ['#ff2e88', '#37e6ff', '#ffe14d']);
    ctx.shadowBlur = 26 * u;
    ctx.fillStyle = ctx.shadowColor;
    ctx.fillRect(x, h * 0.68 - bh, 6 * u, bh);
    ctx.restore();
  }
  // wet street
  ctx.fillStyle = '#0b0616';
  ctx.fillRect(0, h * 0.68, w, h * 0.32);
  drawWetStreet(ctx, rng, w, h * 0.68, h * 0.3, ['#ff2e88', '#37e6ff', '#ffe14d', '#ffffff']);
  // rain streaks
  ctx.strokeStyle = 'rgba(180,220,255,0.14)';
  ctx.lineWidth = 1.5 * u;
  for (let i = 0; i < 60; i++) {
    const x = rng() * w;
    const y = rng() * h * 0.66;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6 * u, y + 22 * u);
    ctx.stroke();
  }
  drawFigureMan(ctx, w * 0.44, h * 0.86, 1.05 * u, '#05030c', '#37e6ff');
  drawFigureWoman(ctx, w * 0.56, h * 0.86, 0.95 * u, '#05030c', '#ff5ea8');
  drawPalm(ctx, w * 0.06, h * 0.7, 0.9 * u, '#05030c', rng);
}

/** Beach Heist: teal sea and sand, speedboat, palms, gulls, shore figures. */
function drawBeach(ctx, w, h, rng) {
  const u = w / 1080;
  drawSky(ctx, w, h, [[0, '#6fd8ef'], [0.4, '#b8f1e4'], [0.55, '#ffe9a8']], h * 0.42);
  drawSun(ctx, w * 0.78, h * 0.16, w * 0.07, '#fffbe0', false);
  // soft clouds
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 3; i++) {
    const cx = range(rng, w * 0.1, w * 0.6);
    const cy = range(rng, h * 0.08, h * 0.3);
    const cw = range(rng, 90, 170) * u;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw, cw * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + cw * 0.5, cy + cw * 0.08, cw * 0.7, cw * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // sea
  const sea = ctx.createLinearGradient(0, h * 0.42, 0, h * 0.68);
  sea.addColorStop(0, '#0e7d8c');
  sea.addColorStop(1, '#19b3a6');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.42, w, h * 0.26);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2.5 * u;
  for (let i = 0; i < 7; i++) {
    const y = h * (0.45 + i * 0.032);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 24) {
      const yy = y + Math.sin(x * 0.02 + i * 2.4) * 4 * u;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // sand
  const sand = ctx.createLinearGradient(0, h * 0.68, 0, h);
  sand.addColorStop(0, '#f2d8a0');
  sand.addColorStop(1, '#dfb26e');
  ctx.fillStyle = sand;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);
  ctx.strokeStyle = 'rgba(190,140,70,0.5)';
  ctx.lineWidth = 2 * u;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.68);
  ctx.quadraticCurveTo(w * 0.4, h * 0.71, w, h * 0.685);
  ctx.stroke();
  drawBoat(ctx, w * 0.42, h * 0.55, 1.3 * u, '#10222e');
  drawPalm(ctx, w * 0.08, h * 0.74, 1.05 * u, '#123524', rng);
  drawPalm(ctx, w * 0.93, h * 0.72, 0.85 * u, '#123524', rng);
  drawBirds(ctx, rng, intRange(rng, 5, 9), w, h * 0.06, h * 0.3, 'rgba(20,60,70,0.85)');
  drawFigureWoman(ctx, w * 0.82, h * 0.8, 1.0 * u, '#123524', '#ffd76a');
  drawDuffel(ctx, w * 0.68, h * 0.84, 1.0 * u, '#123524');
  drawFigureMan(ctx, w * 0.16, h * 0.8, 1.05 * u, '#123524', '#ffd76a');
}

/** Skyline Dawn: pale gold sky, full skyline, helicopter, water reflection. */
function drawDawn(ctx, w, h, rng) {
  const u = w / 1080;
  drawSky(ctx, w, h, [[0, '#ffe9b0'], [0.45, '#ffd27a'], [0.7, '#ffb37a']], h * 0.7);
  ctx.save();
  ctx.shadowColor = '#fff0b0';
  ctx.shadowBlur = 110 * u;
  drawSun(ctx, w * 0.22, h * 0.2, w * 0.09, '#fff8d8', false);
  ctx.restore();
  drawHelicopter(ctx, w * 0.74, h * 0.2, 0.9 * u, '#2a1a12');
  drawBirds(ctx, rng, intRange(rng, 5, 9), w, h * 0.1, h * 0.34, 'rgba(60,35,20,0.8)');
  drawSkyline(ctx, w, h * 0.7, rng, { color: '#4a2c22', density: 1.4, minH: 70, maxH: 260, lit: 0.25 });
  // antenna beacon lights
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = '#ff4d4d';
    ctx.globalAlpha = range(rng, 0.6, 1);
    ctx.beginPath();
    ctx.arc(range(rng, w * 0.05, w * 0.95), h * range(rng, 0.38, 0.62), 3.5 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // water with mirrored skyline
  const water = ctx.createLinearGradient(0, h * 0.7, 0, h);
  water.addColorStop(0, '#e8a56a');
  water.addColorStop(1, '#7a4a34');
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.translate(0, h * 1.4);
  ctx.scale(1, -1);
  drawSkyline(ctx, w, h * 0.7, rng, { color: '#4a2c22', density: 1.4, minH: 70, maxH: 260, lit: 0 });
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,235,180,0.5)';
  ctx.lineWidth = 2 * u;
  for (let i = 0; i < 9; i++) {
    const y = h * (0.73 + i * 0.03);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 30) {
      const yy = y + Math.sin(x * 0.015 + i * 1.7) * 3 * u;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  drawFigureMan(ctx, w * 0.3, h * 0.9, 0.85 * u, '#2a1a12', '#ffd76a');
  drawFigureWoman(ctx, w * 0.38, h * 0.9, 0.78 * u, '#2a1a12', '#ffd76a');
}

const SCENES = { sunset: drawSunset, neon: drawNeon, beach: drawBeach, dawn: drawDawn };

/** Big GTA-style title block: subtitle, heavy outlined title, tagline. */
export function drawTitleBlock(ctx, w, h, opts) {
  const { title, subtitle, tagline, accent } = opts;
  const u = w / 1080;
  try {
    ctx.letterSpacing = '2px';
  } catch (e) { /* older canvas: no letter-spacing, fine */ }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const titleSize = Math.round(w * 0.105);
  const titleY = h * 0.885;
  const x = w * 0.07;
  // subtitle
  ctx.font = `800 ${Math.round(w * 0.03)}px "Arial Black", Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 3 * u;
  ctx.fillText((subtitle || '').toUpperCase(), x, titleY - titleSize * 1.02);
  // title: white fill, dark outline, accent drop shadow
  ctx.font = `900 ${titleSize}px "Arial Black", Arial, sans-serif`;
  ctx.shadowColor = accent;
  ctx.shadowOffsetX = 5 * u;
  ctx.shadowOffsetY = 6 * u;
  ctx.shadowBlur = 0;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0d0d0d';
  ctx.lineWidth = titleSize * 0.085;
  ctx.strokeText(title, x, titleY);
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, x, titleY);
  // tagline
  ctx.font = `italic 600 ${Math.round(w * 0.021)}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowOffsetY = 2 * u;
  ctx.fillText(tagline || '', x, titleY + titleSize * 0.42);
  // top-left kicker
  ctx.font = `800 ${Math.round(w * 0.016)}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('A LEONIDA NIGHTS POSTER', x, h * 0.055);
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowOffsetY = 0;
  try {
    ctx.letterSpacing = '0px';
  } catch (e) { /* ignore */ }
}

/** Draws the user's photo as a tilted polaroid snapshot on the poster. */
export function drawPhotoSnapshot(ctx, w, h, photo) {
  if (!photo || !photo.img) return;
  const u = w / 1080;
  const pw = w * 0.23;
  const ph = pw * 1.18;
  const px = w * 0.72;
  const py = h * 0.1;
  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);
  ctx.rotate(-0.055);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 24 * u;
  ctx.shadowOffsetY = 8 * u;
  ctx.fillStyle = '#fdfdf8';
  ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
  ctx.shadowColor = 'rgba(0,0,0,0)';
  // cover-crop the photo into the polaroid frame
  const img = photo.img;
  const fw = pw - 16 * u;
  const fh = ph - 52 * u;
  const zoom = photo.zoom || 1;
  const scale = Math.max(fw / img.width, fh / img.height) * zoom;
  const sw = fw / scale;
  const sh = fh / scale;
  const sx = Math.max(0, Math.min(img.width - sw, (img.width - sw) / 2 + (photo.dx || 0) * img.width * 0.2));
  const sy = Math.max(0, Math.min(img.height - sh, (img.height - sh) / 2 + (photo.dy || 0) * img.height * 0.2));
  ctx.drawImage(img, sx, sy, sw, sh, -pw / 2 + 8 * u, -ph / 2 + 8 * u, fw, fh);
  ctx.fillStyle = '#222222';
  ctx.font = `700 ${Math.round(w * 0.016)}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('LEONIDA  •  2026', 0, ph / 2 - 14 * u);
  ctx.restore();
}

/**
 * Renders a complete poster onto ctx's canvas at its own size.
 * opts: { template, seed, grade, title, subtitle, tagline, texture, photo }
 */
export function renderPoster(ctx, opts) {
  const canvas = ctx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const rng = mulberry32(hashSeed(opts.seed ?? 7));
  const scene = SCENES[opts.template] || SCENES.sunset;
  const accent = (TEMPLATES[opts.template] || TEMPLATES.sunset).accent;
  ctx.clearRect(0, 0, w, h);
  scene(ctx, w, h, rng);
  applyGrade(canvas, opts.grade || 'warm');
  // poster frame
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.strokeRect(w * 0.022, h * 0.022, w * 0.956, h * 0.956);
  drawTitleBlock(ctx, w, h, {
    title: opts.title || 'LEONIDA',
    subtitle: opts.subtitle || 'SUNSET HEIST',
    tagline: opts.tagline || 'Two outlaws. One last score. Welcome to Leonida.',
    accent,
  });
  if (opts.photo) drawPhotoSnapshot(ctx, w, h, opts.photo);
  if (opts.texture) {
    drawHalftone(ctx, w, h, 0.06);
    drawGrain(ctx, mulberry32(hashSeed(String(opts.seed ?? 7) + ':grain')), w, h, 0.00012);
  }
  drawVignette(ctx, w, h, 0.22);
  return { template: opts.template, seed: opts.seed, grade: opts.grade, accent };
}
