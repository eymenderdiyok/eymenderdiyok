import { TAU, lerp, clamp } from '../core/math.js';

export class Renderer {
  constructor(game) {
    this.game = game;
  }

  clear(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b0f14');
    g.addColorStop(1, '#080a0e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  render(ctx, time) {
    const g = this.game;
    this.clear(ctx);
    g.camera.apply(ctx);
    g.track.render(ctx, time);
    for (const car of g.cars) car.render(ctx, time, g.camera);
    g.effects.render(ctx, time);
    g.camera.unapply(ctx);
  }
}
