import { clamp, lerp } from '../core/math.js';

export class Effects {
  constructor(game) {
    this.game = game;
    this.blur = 0;
    this.speedLines = [];
  }

  update(dt) {
    const v = this.game.player.speed;
    this.blur = lerp(this.blur, clamp(v / 80, 0, 1), dt * 3);
    if (Math.random() < this.blur * 0.6) this._spawnLine();
    for (const l of this.speedLines) l.life -= dt;
    this.speedLines = this.speedLines.filter(l => l.life > 0);
  }

  _spawnLine() {
    const a = Math.random() * Math.PI * 2;
    const r = 200 + Math.random() * 400;
    this.speedLines.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      life: 0.2 + Math.random() * 0.4,
      w: 1 + Math.random() * 3
    });
  }

  render(ctx) {
    const c = this.game.camera;
    if (!this.blur) return;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(56,225,255,0.12)';
    for (const l of this.speedLines) {
      ctx.lineWidth = l.w;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x * 1.2, l.y * 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
