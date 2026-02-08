import { clamp, lerp, vecLen } from '../core/math.js';
import { TRACK } from '../data/track_data.js';

export class Track {
  constructor() {
    this.points = TRACK.points;
    this.widths = TRACK.widths;
    this.friction = TRACK.friction;
    this.bank = TRACK.bank;
    this.length = TRACK.length;
    this.center = TRACK.center;
    this.cache = TRACK.cache;
  }

  sampleAt(t) {
    const idx = Math.floor(t) % this.points.length;
    const next = (idx + 1) % this.points.length;
    const p0 = this.points[idx];
    const p1 = this.points[next];
    const w = lerp(this.widths[idx], this.widths[next], t - idx);
    const f = lerp(this.friction[idx], this.friction[next], t - idx);
    const b = lerp(this.bank[idx], this.bank[next], t - idx);
    return { x: lerp(p0.x, p1.x, t-idx), y: lerp(p0.y, p1.y, t-idx), w, f, b, idx };
  }

  findClosest(x, y, lastIndex=0) {
    let best = 1e9;
    let bestIdx = lastIndex;
    const span = 40;
    for (let i=-span;i<=span;i++) {
      const idx = (lastIndex + i + this.points.length) % this.points.length;
      const p = this.points[idx];
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < best) { best = d; bestIdx = idx; }
    }
    return bestIdx;
  }

  render(ctx) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0d121a';
    ctx.lineWidth = 70;
    ctx.beginPath();
    for (let i=0;i<this.points.length;i++) {
      const p = this.points[i];
      if (i===0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#2b3340';
    ctx.lineWidth = 56;
    ctx.stroke();

    ctx.strokeStyle = '#5b6472';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 18]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(56,225,255,0.12)';
    ctx.lineWidth = 90;
    ctx.stroke();

    ctx.restore();
  }
}
