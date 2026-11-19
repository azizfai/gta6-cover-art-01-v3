// grades.js — the four colour grades for Leonida Nights posters.
// A grade is a canvas filter applied to the finished scene plus a tint
// overlay, so the same poster can be re-graded without repainting it.

export const GRADES = {
  warm: {
    label: 'Warm Sunset',
    filter: 'saturate(1.3) contrast(1.06) sepia(0.16) brightness(1.02)',
    tint: 'rgba(255,110,40,0.07)',
  },
  neon: {
    label: 'Neon Night',
    filter: 'saturate(1.55) contrast(1.14) hue-rotate(-6deg) brightness(0.98)',
    tint: 'rgba(255,40,160,0.06)',
  },
  bw: {
    label: 'Black & White',
    filter: 'grayscale(1) contrast(1.28) brightness(1.06)',
    tint: 'rgba(0,0,0,0)',
  },
  vintage: {
    label: 'Faded Vintage',
    filter: 'sepia(0.5) contrast(0.94) brightness(1.03) saturate(0.75)',
    tint: 'rgba(255,220,160,0.08)',
  },
};

/** Applies a grade to a canvas in place (via an offscreen copy + filter). */
export function applyGrade(canvas, gradeId) {
  const grade = GRADES[gradeId] || GRADES.warm;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  off.getContext('2d').drawImage(canvas, 0, 0);
  ctx.save();
  ctx.filter = grade.filter;
  ctx.drawImage(off, 0, 0);
  ctx.restore();
  if (grade.tint && grade.tint !== 'rgba(0,0,0,0)') {
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, w, h);
  }
  return grade;
}
