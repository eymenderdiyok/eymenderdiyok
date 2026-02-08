export class Time {
  constructor() {
    this.last = 0;
    this.dt = 0;
    this.elapsed = 0;
    this.smoothDt = 0;
    this.frame = 0;
  }

  update(t) {
    if (!this.last) this.last = t;
    const raw = (t - this.last) / 1000;
    this.last = t;
    const clamped = Math.max(0, Math.min(raw, 0.05));
    this.dt = clamped;
    this.elapsed += clamped;
    this.smoothDt = this.smoothDt * 0.9 + clamped * 0.1;
    this.frame++;
  }
}
