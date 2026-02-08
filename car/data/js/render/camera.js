import { lerp, clamp, mixAngles } from '../core/math.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.angle = 0;
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.width = 1280;
    this.height = 720;
    this.dpr = 1;
  }

  resize(w, h, dpr) {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
  }

  update(target, dt, speed=4) {
    this.x = lerp(this.x, target.x, clamp(dt*speed,0,1));
    this.y = lerp(this.y, target.y, clamp(dt*speed,0,1));
    this.angle = mixAngles(this.angle, target.angle, clamp(dt*speed,0,1));
    if (this.shake > 0) {
      this.shake -= dt * 2.5;
      this.shakeX = (Math.random()-0.5) * this.shake * 12;
      this.shakeY = (Math.random()-0.5) * this.shake * 12;
    } else {
      this.shake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(this.width/2 + this.shakeX, this.height/2 + this.shakeY);
    ctx.rotate(-this.angle);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  unapply(ctx) { ctx.restore(); }
}
