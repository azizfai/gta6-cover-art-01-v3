// art.js — canvas drawing primitives for Leonida Nights posters.
// Every scene is drawn from code (no photos, no downloaded assets, system
// fonts only). All randomness comes from a seeded generator, so the same
// seed always paints the same poster.

/** Deterministic PRNG (mulberry32) from a 32-bit integer seed. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hashes any seed value (number or string) down to a 32-bit integer. */
export function hashSeed(seed) {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded helpers: pick, range and integer range from a next() function. */
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
export function range(rng, min, max) {
  return min + rng() * (max - min);
}
export function intRange(rng, min, max) {
  return Math.floor(range(rng, min, max + 1));
}

/** Vertical sky gradient with a soft horizon glow. */
export function drawSky(ctx, w, h, stops, horizonY) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (horizonY !== undefined) {
    const glow = ctx.createRadialGradient(w * 0.5, horizonY, 0, w * 0.5, horizonY, w * 0.55);
    glow.addColorStop(0, 'rgba(255,255,255,0.20)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }
}

/** A solid sun disc, optionally with retro horizontal slits.
 *  The slits are punched on an offscreen canvas so the cut stays inside the
 *  disc (a destination-out fill on the main canvas would smear its shadow
 *  across the skyline drawn later). The caller's shadow settings still glow
 *  around the finished disc when it is drawn back. */
export function drawSun(ctx, x, y, r, color, slits) {
  const pad = 4;
  const off = document.createElement('canvas');
  off.width = Math.ceil(r * 2 + pad * 2);
  off.height = Math.ceil(r * 2 + pad * 2);
  const o = off.getContext('2d');
  o.fillStyle = color;
  o.beginPath();
  o.arc(r + pad, r + pad, r, 0, Math.PI * 2);
  o.fill();
  if (slits) {
    o.globalCompositeOperation = 'destination-out';
    const gap = r / 4.2;
    for (let i = 0; i < 4; i++) {
      const sy = r + pad + r * 0.18 + i * gap;
      o.fillRect(pad - 2, sy, r * 2 + 4, Math.max(2, r * 0.055 + i * r * 0.02));
    }
  }
  ctx.drawImage(off, x - r - pad, y - r - pad);
}

/** A glowing neon ring sun (hollow circle with blur glow). */
export function drawNeonRing(ctx, x, y, r, color) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = r * 0.35;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(4, r * 0.07);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = r * 0.12;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, r * 0.02);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** A city skyline silhouette along a baseline, with lit windows. */
export function drawSkyline(ctx, w, baseY, rng, opts) {
  const { color, density = 1, minH = 40, maxH = 190, lit = 0.35, neon = false } = opts || {};
  const step = Math.max(18, 46 / density);
  let x = -10;
  const windows = [];
  ctx.fillStyle = color;
  while (x < w + 20) {
    const bw = range(rng, step * 0.6, step * 1.5);
    const bh = range(rng, minH, maxH) * (0.7 + rng() * 0.6);
    const bx = x;
    const by = baseY - bh;
    ctx.fillRect(bx, by, bw, bh);
    if (rng() < 0.45) {
      // rooftop antenna
      ctx.fillRect(bx + bw / 2 - 1, by - range(rng, 8, 26), 2, 30);
    }
    if (rng() < 0.3) {
      // water tower / rooftop box
      ctx.fillRect(bx + bw * 0.2, by - 12, bw * 0.35, 12);
    }
    const cols = Math.max(1, Math.floor(bw / 16));
    const rows = Math.max(1, Math.floor(bh / 22));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rng() < lit) {
          windows.push([
            bx + 5 + c * 16,
            by + 7 + r * 22,
            neon ? pick(rng, ['#ff5ea8', '#37e6ff', '#ffe14d', '#ff9a3d']) : pick(rng, ['#ffd76a', '#ffe9a8', '#ffb35c']),
          ]);
        }
      }
    }
    x += bw + range(rng, 2, 14);
  }
  for (const [wx, wy, wc] of windows) {
    ctx.fillStyle = wc;
    ctx.globalAlpha = range(rng, 0.55, 1);
    ctx.fillRect(wx, wy, 7, 10);
  }
  ctx.globalAlpha = 1;
}

/** A palm tree silhouette: curved trunk + drooping fronds. */
export function drawPalm(ctx, x, y, s, color, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  // curved trunk
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -60, 30, -118);
  ctx.stroke();
  // fronds
  const topX = 30;
  const topY = -118;
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = (-Math.PI * 0.92) + (i / (fronds - 1)) * Math.PI * 0.84;
    const len = 62 + rng() * 26;
    const cx = topX + Math.cos(a) * len * 0.55;
    const cy = topY + Math.sin(a) * len * 0.55 - 14;
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len + 34;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  // coconut cluster
  ctx.beginPath();
  ctx.arc(topX - 4, topY + 6, 5, 0, Math.PI * 2);
  ctx.arc(topX + 6, topY + 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A low sports-car silhouette with headlight glow, facing right. */
export function drawCar(ctx, x, y, s, color, glowColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // headlight beam
  const beam = ctx.createLinearGradient(150, 0, 330, 0);
  beam.addColorStop(0, glowColor || 'rgba(255,240,180,0.55)');
  beam.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(150, -16);
  ctx.lineTo(330, -44);
  ctx.lineTo(330, 6);
  ctx.lineTo(150, -4);
  ctx.closePath();
  ctx.fill();
  // body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.lineTo(-146, -22);
  ctx.lineTo(-96, -28);
  ctx.lineTo(-58, -58);
  ctx.lineTo(8, -62);
  ctx.lineTo(52, -30);
  ctx.lineTo(138, -22);
  ctx.lineTo(152, -8);
  ctx.lineTo(150, 0);
  ctx.closePath();
  ctx.fill();
  // cabin glass
  ctx.fillStyle = 'rgba(255,180,120,0.35)';
  ctx.beginPath();
  ctx.moveTo(-48, -52);
  ctx.lineTo(2, -55);
  ctx.lineTo(40, -30);
  ctx.lineTo(-52, -30);
  ctx.closePath();
  ctx.fill();
  // wheels
  ctx.fillStyle = '#050505';
  for (const wx of [-96, 96]) {
    ctx.beginPath();
    ctx.arc(wx, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8c8c8';
    ctx.beginPath();
    ctx.arc(wx, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#050505';
  }
  // headlight dot
  ctx.fillStyle = '#fff6c8';
  ctx.beginPath();
  ctx.arc(146, -14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A speedboat silhouette with a wake, facing right. */
export function drawBoat(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-120, 0);
  ctx.lineTo(120, 0);
  ctx.lineTo(96, 26);
  ctx.lineTo(-84, 26);
  ctx.closePath();
  ctx.fill();
  // cabin + windshield
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-12, -34);
  ctx.lineTo(38, -34);
  ctx.lineTo(58, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(140,230,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(-8, -28);
  ctx.lineTo(32, -28);
  ctx.lineTo(46, -4);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  // wake
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-120 - i * 26, 30 + i * 10);
    ctx.quadraticCurveTo(-170 - i * 26, 34 + i * 10, -230 - i * 20, 26 + i * 12);
    ctx.stroke();
  }
  ctx.restore();
}

/** A man in a jacket, standing silhouette with a rim-light edge. */
export function drawFigureMan(ctx, x, y, s, color, rim) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  // legs
  ctx.lineWidth = 17;
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.lineTo(-14, 0);
  ctx.moveTo(0, -96);
  ctx.lineTo(16, 0);
  ctx.stroke();
  // torso (jacket)
  ctx.beginPath();
  ctx.moveTo(-26, -190);
  ctx.quadraticCurveTo(0, -204, 26, -190);
  ctx.lineTo(20, -96);
  ctx.lineTo(-20, -96);
  ctx.closePath();
  ctx.fill();
  // open jacket V
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(-8, -188);
  ctx.lineTo(8, -188);
  ctx.lineTo(0, -140);
  ctx.closePath();
  ctx.fill();
  // arms: one bent, one relaxed
  ctx.strokeStyle = color;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(-24, -184);
  ctx.lineTo(-38, -128);
  ctx.lineTo(-30, -96);
  ctx.moveTo(24, -184);
  ctx.lineTo(40, -132);
  ctx.lineTo(34, -100);
  ctx.stroke();
  // head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -216, 17, 0, Math.PI * 2);
  ctx.fill();
  // rim light on the sun side
  if (rim) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(4, -216, 17, -1.1, 1.2);
    ctx.moveTo(28, -188);
    ctx.lineTo(22, -98);
    ctx.stroke();
  }
  ctx.restore();
}

/** A woman with flowing hair, walking silhouette with a rim-light edge. */
export function drawFigureWoman(ctx, x, y, s, color, rim) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  // legs, mid-stride
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, -98);
  ctx.lineTo(-22, -8);
  ctx.moveTo(0, -98);
  ctx.lineTo(20, -2);
  ctx.stroke();
  // dress / torso
  ctx.beginPath();
  ctx.moveTo(-20, -186);
  ctx.quadraticCurveTo(0, -198, 20, -186);
  ctx.quadraticCurveTo(26, -140, 14, -96);
  ctx.lineTo(-14, -96);
  ctx.quadraticCurveTo(-24, -140, -20, -186);
  ctx.closePath();
  ctx.fill();
  // arms
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-18, -180);
  ctx.quadraticCurveTo(-38, -150, -30, -112);
  ctx.moveTo(18, -180);
  ctx.quadraticCurveTo(38, -152, 28, -116);
  ctx.stroke();
  // head
  ctx.beginPath();
  ctx.arc(0, -212, 15, 0, Math.PI * 2);
  ctx.fill();
  // flowing hair
  ctx.beginPath();
  ctx.moveTo(-14, -216);
  ctx.quadraticCurveTo(-34, -196, -28, -158);
  ctx.quadraticCurveTo(-18, -176, -12, -196);
  ctx.quadraticCurveTo(-8, -214, -14, -216);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -218);
  ctx.quadraticCurveTo(30, -200, 24, -164);
  ctx.quadraticCurveTo(14, -182, 10, -198);
  ctx.closePath();
  ctx.fill();
  if (rim) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(3, -212, 15, -1.0, 1.3);
    ctx.moveTo(22, -184);
    ctx.lineTo(16, -98);
    ctx.stroke();
  }
  ctx.restore();
}

/** A duffel bag silhouette on the ground. */
export function drawDuffel(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-46, 0);
  ctx.quadraticCurveTo(-48, -26, -20, -30);
  ctx.lineTo(20, -30);
  ctx.quadraticCurveTo(48, -26, 46, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-16, -30);
  ctx.quadraticCurveTo(0, -48, 16, -30);
  ctx.stroke();
  ctx.restore();
}

/** Small "v" gulls scattered in the sky. */
export function drawBirds(ctx, rng, count, w, top, bottom, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = range(rng, w * 0.05, w * 0.95);
    const y = range(rng, top, bottom);
    const s = range(rng, 6, 16);
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.7, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.7, x + s, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** A helicopter silhouette with a spinning rotor blur. */
export function drawHelicopter(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  // rotor blur
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-95, -34);
  ctx.lineTo(95, -34);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-58, -8, 92, 14);
  // tail
  ctx.beginPath();
  ctx.moveTo(-40, -6);
  ctx.lineTo(-108, -22);
  ctx.lineTo(-108, -2);
  ctx.closePath();
  ctx.fill();
  // tail fin + rotor
  ctx.fillRect(-112, -34, 6, 36);
  ctx.fillRect(-10, -30, 20, 8);
  // skids
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-44, 30);
  ctx.lineTo(40, 30);
  ctx.moveTo(-30, 18);
  ctx.lineTo(-30, 30);
  ctx.moveTo(26, 18);
  ctx.lineTo(26, 30);
  ctx.stroke();
  ctx.restore();
}

/** A star field for night skies. */
export function drawStars(ctx, rng, count, w, h, maxY) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * maxY;
    const r = range(rng, 0.6, 2.2);
    ctx.globalAlpha = range(rng, 0.3, 1);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Halftone dot overlay, denser toward the bottom. */
export function drawHalftone(ctx, w, h, alpha) {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = alpha;
  const step = 16;
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const t = y / h;
      const r = 0.5 + t * t * 2.0;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Film grain: random dark/light specks. */
export function drawGrain(ctx, rng, w, h, amount) {
  ctx.save();
  const n = Math.floor(w * h * amount);
  for (let i = 0; i < n; i++) {
    const v = rng();
    ctx.fillStyle = v < 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.14)';
    ctx.fillRect(rng() * w, rng() * h, 1.6, 1.6);
  }
  ctx.restore();
}

/** Darkened corners to focus the centre. */
export function drawVignette(ctx, w, h, strength) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Wet-street reflection streaks under a skyline. */
export function drawWetStreet(ctx, rng, w, y, h, colors) {
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const x = rng() * w;
    const len = range(rng, 12, 70);
    ctx.strokeStyle = pick(rng, colors);
    ctx.globalAlpha = range(rng, 0.12, 0.5);
    ctx.lineWidth = range(rng, 1.5, 4);
    ctx.beginPath();
    ctx.moveTo(x, y + rng() * h * 0.4);
    ctx.lineTo(x + range(rng, -4, 4), y + rng() * h * 0.4 + len);
    ctx.stroke();
  }
  ctx.restore();
}
