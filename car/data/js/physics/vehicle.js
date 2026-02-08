import { clamp, lerp, vecLen, angleNorm, mixAngles } from '../core/math.js';
import { TireModel } from './tires.js';

export class Vehicle {
  constructor(spec) {
    this.spec = spec;
    this.x = spec.x;
    this.y = spec.y;
    this.vx = 0;
    this.vy = 0;
    this.angle = spec.angle || 0;
    this.angular = 0;
    this.speed = 0;
    this.radius = spec.radius || 16;
    this.mass = spec.mass || 1200;
    this.controls = { steer: 0, throttle: 0, brake: 0, nitro: 0 };
    this.damage = 0;
    this.isPlayer = !!spec.isPlayer;
    this.color = spec.color || '#ffffff';
    this.lap = 1;
    this.progress = 0;
    this.position = 1;
    this.targetSpeed = 0;
    this.steerAssist = 0;
    this.slip = 0;
  }

  update(dt, track, weather) {
    const c = this.controls;
    const maxSteer = this.spec.maxSteer;
    const steer = clamp(c.steer + this.steerAssist, -1, 1) * maxSteer;
    const throttle = c.throttle;
    const brake = c.brake;
    const nitro = c.nitro;

    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);

    const speed = this.speed;
    const grip = TireModel.gripCurve(speed) * (weather.gripMul || 1) * (1 - this.damage * 0.35);
    const accel = this.spec.accel * (1 - this.damage * 0.2) * (1 + nitro * 0.35);
    const brakeForce = this.spec.brake * (1 + brake * 0.7);

    const desired = throttle * accel - brake * brakeForce - this.spec.drag * speed * speed;
    const ax = forwardX * desired;
    const ay = forwardY * desired;

    this.vx += ax * dt;
    this.vy += ay * dt;

    const vx = this.vx;
    const vy = this.vy;
    const vlen = Math.hypot(vx, vy) || 0.0001;
    const nx = vx / vlen;
    const ny = vy / vlen;
    const lateral = -nx * forwardY + ny * forwardX;
    this.slip = lateral;
    const lateralGrip = clamp(1 - Math.abs(lateral) * 2, 0.2, 1) * grip;

    const steerTorque = steer * this.spec.steerTorque * lateralGrip * (0.4 + throttle * 0.6);
    this.angular = lerp(this.angular, steerTorque, dt * 4);
    this.angle = angleNorm(this.angle + this.angular * dt);

    const drag = 1 - clamp(this.spec.rolling * (1 - grip), 0, 0.03);
    this.vx *= drag;
    this.vy *= drag;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.speed = Math.hypot(this.vx, this.vy);

    const closest = track.findClosest(this.x, this.y, track.cache.lastIndex || 0);
    track.cache.lastIndex = closest;
    const p = track.points[closest];
    const dx = this.x - p.x;
    const dy = this.y - p.y;
    const dist = Math.hypot(dx, dy);
    const roadWidth = track.widths[closest];
    if (dist > roadWidth) {
      const off = dist - roadWidth;
      this.vx *= 0.96 - off * 0.0008;
      this.vy *= 0.96 - off * 0.0008;
      this.damage = clamp(this.damage + off * 0.00002, 0, 0.9);
    }

    if (this.damage > 0.8) {
      this.vx *= 0.98;
      this.vy *= 0.98;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.fillRect(-20, -10, 40, 20);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-18, -12, 36, 6);
    ctx.fillRect(-18, 6, 36, 6);
    ctx.fillStyle = '#0ff';
    ctx.fillRect(12, -4, 6, 8);
    ctx.restore();
  }
}
