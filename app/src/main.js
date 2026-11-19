// main.js — Leonida Nights app bootstrap: state, controls, gallery, export.
// One click generates a finished GTA-style cover poster; everything runs
// offline in the browser, no network request, system fonts only.
import { renderPoster, TEMPLATES } from './poster.js';
import { GRADES } from './grades.js';
import { runShot, downloadPoster } from './shots.js';

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const gallery = document.getElementById('gallery');

const state = {
  template: 'sunset',
  seed: 20261119,
  grade: 'warm',
  title: 'LEONIDA',
  subtitle: 'SUNSET HEIST',
  tagline: 'Two outlaws. One last score. Welcome to Leonida.',
  texture: true,
  photo: null,
  photoZoom: 1,
  photoX: 0,
  photoY: 0,
};

function posterOpts() {
  return {
    template: state.template,
    seed: state.seed,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    tagline: state.tagline,
    texture: state.texture,
    photo: state.photo
      ? { img: state.photo, zoom: state.photoZoom, dx: state.photoX, dy: state.photoY }
      : null,
  };
}

function redraw() {
  renderPoster(stage.getContext('2d'), posterOpts());
  document.getElementById('seedLabel').textContent = `Seed ${state.seed}`;
  document.getElementById('seedInput').value = String(state.seed);
}

/** Builds the gallery: 12 posters from different seeds across the templates. */
function buildGallery() {
  gallery.innerHTML = '';
  const keys = Object.keys(TEMPLATES);
  for (let i = 0; i < 12; i++) {
    const seed = 1000 + i * 7919;
    const template = keys[i % keys.length];
    const thumb = document.createElement('canvas');
    thumb.width = 240;
    thumb.height = 240;
    thumb.className = 'thumb';
    thumb.title = `${TEMPLATES[template].label} · seed ${seed}`;
    renderPoster(thumb.getContext('2d'), {
      template,
      seed,
      grade: ['warm', 'neon', 'bw', 'vintage'][i % 4],
      title: 'LEONIDA',
      subtitle: TEMPLATES[template].label.toUpperCase(),
      tagline: 'Two outlaws. One last score.',
      texture: true,
      photo: null,
    });
    thumb.addEventListener('click', () => {
      state.template = template;
      state.seed = seed;
      syncControls();
      redraw();
      status.textContent = `Loaded ${TEMPLATES[template].label} · seed ${seed}`;
    });
    gallery.appendChild(thumb);
  }
}

function syncControls() {
  for (const btn of document.querySelectorAll('[data-template]')) {
    btn.classList.toggle('active', btn.dataset.template === state.template);
  }
  for (const btn of document.querySelectorAll('[data-grade]')) {
    btn.classList.toggle('active', btn.dataset.grade === state.grade);
  }
  document.getElementById('titleInput').value = state.title;
  document.getElementById('subtitleInput').value = state.subtitle;
  document.getElementById('taglineInput').value = state.tagline;
  document.getElementById('textureToggle').checked = state.texture;
}

function bindControls() {
  for (const btn of document.querySelectorAll('[data-template]')) {
    btn.addEventListener('click', () => {
      state.template = btn.dataset.template;
      syncControls();
      redraw();
    });
  }
  for (const btn of document.querySelectorAll('[data-grade]')) {
    btn.addEventListener('click', () => {
      state.grade = btn.dataset.grade;
      syncControls();
      redraw();
    });
  }
  document.getElementById('generateBtn').addEventListener('click', () => {
    state.seed = Math.floor(Math.random() * 900000) + 1000;
    redraw();
    status.textContent = `New poster · seed ${state.seed} — share the seed to share the poster.`;
  });
  document.getElementById('seedInput').addEventListener('change', (e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      state.seed = Math.floor(n);
      redraw();
    }
  });
  document.getElementById('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value.toUpperCase().slice(0, 24) || 'LEONIDA';
    redraw();
  });
  document.getElementById('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value.toUpperCase().slice(0, 32);
    redraw();
  });
  document.getElementById('taglineInput').addEventListener('input', (e) => {
    state.tagline = e.target.value.slice(0, 90);
    redraw();
  });
  document.getElementById('textureToggle').addEventListener('change', (e) => {
    state.texture = e.target.checked;
    redraw();
  });
  document.getElementById('photoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      state.photo = img;
      document.getElementById('photoControls').hidden = false;
      status.textContent = 'Photo added as a polaroid snapshot — drag the sliders to crop and position it.';
      redraw();
    };
    img.src = URL.createObjectURL(file);
  });
  document.getElementById('photoZoom').addEventListener('input', (e) => {
    state.photoZoom = Number(e.target.value);
    redraw();
  });
  document.getElementById('photoX').addEventListener('input', (e) => {
    state.photoX = Number(e.target.value);
    redraw();
  });
  document.getElementById('photoY').addEventListener('input', (e) => {
    state.photoY = Number(e.target.value);
    redraw();
  });
  document.getElementById('photoRemove').addEventListener('click', () => {
    state.photo = null;
    document.getElementById('photoControls').hidden = true;
    document.getElementById('photoInput').value = '';
    redraw();
  });
  for (const btn of document.querySelectorAll('[data-export]')) {
    btn.addEventListener('click', () => {
      const [w, h] = btn.dataset.export.split('x').map(Number);
      downloadPoster(w, h, posterOpts(), status);
    });
  }
}

// Test hook for headless verification: renders the current poster at any size.
window.__leonida = {
  state,
  redraw,
  renderAt(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    renderPoster(c.getContext('2d'), posterOpts());
    return c.toDataURL('image/png').length;
  },
};

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
buildGallery();
bindControls();
syncControls();
if (shot) {
  runShot(shot, query, stage, (s) => {
    state.template = s.template;
    state.seed = s.seed;
    state.grade = s.grade;
    state.title = s.title;
    state.subtitle = s.subtitle;
    syncControls();
  }, redraw);
} else {
  redraw();
}
