import { Time } from './time.js';
import { Input } from './input.js';
import { Perf } from '../util/perf.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.time = new Time();
    this.input = new Input(canvas);
    this.game = null;
    this.ui = null;
    this.running = false;
    this.perf = new Perf();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setGame(game) {
    this.game = game;
  }

  setUI(ui) {
    this.ui = ui;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    if (this.game) this.game.onResize(w, h, dpr);
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (t) => {
      if (!this.running) return;
      this.time.update(t);
      this.input.update(this.time.dt);
      this.perf.begin();
      if (this.game) this.game.update(this.time, this.input);
      if (this.game) this.game.render(this.ctx, this.time);
      if (this.ui) this.ui.update(this.time);
      this.perf.end();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}
