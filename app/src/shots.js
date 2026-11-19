// shots.js — screenshot scenes and PNG export helpers.
// `?shot=cover` shows one finished poster full-bleed (the cover screenshot);
// `?shot=editor` shows the generator UI. window.__shotReady is set once the
// scene has painted, so a headless browser can screenshot deterministically.

import { renderPoster } from './poster.js';

/** Renders a poster of the given size into a fresh canvas and returns it. */
export function exportPosterCanvas(width, height, opts) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  renderPoster(canvas.getContext('2d'), opts);
  return canvas;
}

/** Downloads a poster PNG of the given size from the current settings. */
export function downloadPoster(width, height, opts, status) {
  const canvas = exportPosterCanvas(width, height, opts);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leonida-nights-${width}x${height}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    if (status) status.textContent = `Saved leonida-nights-${width}x${height}.png`;
  }, 'image/png');
}

/**
 * Sets up a fixed scene for a screenshot. `stage` is the viewer canvas and
 * `redraw` repaints it from state; `applyShotState` applies the query's
 * template/seed/grade/title to the app state before painting.
 */
export function runShot(shot, query, stage, applyShotState, redraw) {
  const template = query.get('template') || 'sunset';
  const seed = Number(query.get('seed') || 7);
  const grade = query.get('grade') || 'warm';
  const title = query.get('title') || 'LEONIDA';
  const subtitle = query.get('subtitle') || 'SUNSET HEIST';
  applyShotState({ template, seed, grade, title, subtitle });
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // the stage canvas fills the whole viewport for a full-bleed poster shot
    const w = window.innerWidth;
    const h = window.innerHeight;
    stage.width = w;
    stage.height = h;
    stage.style.width = `${w}px`;
    stage.style.height = `${h}px`;
  }
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
