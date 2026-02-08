import { clamp } from '../core/math.js';
import { RACING_LINE } from '../data/track_data.js';

export class RacingLine {
  constructor(track, profile) {
    this.track = track;
    this.profile = profile;
  }

  sample(t) {
    const points = RACING_LINE.points;
    const idx = Math.floor(t) % points.length;
    const next = (idx + 1) % points.length;
    const p0 = points[idx];
    const p1 = points[next];
    const f = t - idx;
    const x = p0.x + (p1.x - p0.x) * f;
    const y = p0.y + (p1.y - p0.y) * f;
    const curve = p0.curve + (p1.curve - p0.curve) * f;
    return { x, y, curve };
  }
}
