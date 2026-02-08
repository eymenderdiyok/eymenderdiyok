export class Perf {
  constructor() {
    this.samples = [];
    this.max = 120;
    this.last = 0;
    this.fps = 0;
  }
  begin() { this.last = performance.now(); }
  end() {
    const now = performance.now();
    const dt = now - this.last;
    this.samples.push(dt);
    if (this.samples.length > this.max) this.samples.shift();
    const avg = this.samples.reduce((a,b) => a+b, 0) / this.samples.length;
    this.fps = avg ? 1000 / avg : 0;
  }
}
