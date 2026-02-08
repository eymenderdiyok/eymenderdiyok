import { clamp, lerp, rand, mixAngles, angleNorm } from '../core/math.js';
import { RacingLine } from './racing_line.js';

export class AIDriver {
  constructor(game, car, profile) {
    this.game = game;
    this.car = car;
    this.profile = profile;
    this.line = new RacingLine(game.track, profile);
    this.targetIdx = 0;
    this.lastEval = 0;
    this.behavior = {
      aggression: profile.aggression,
      patience: profile.patience,
      risk: profile.risk,
      defense: profile.defense
    };
    this.adapt = { lateBrake: 0, earlyGas: 0, drift: 0, risk: 0, errors: 0 };
  }

  update(dt) {
    const g = this.game;
    const p = g.player;
    this.lastEval += dt;
    if (this.lastEval > 0.3) {
      this.lastEval = 0;
      this._analyzePlayer(p);
      this._adaptBehavior(g.rules.difficulty);
    }
    this._drive(dt);
  }

  _analyzePlayer(p) {
    const s = p.speed;
    const slip = Math.abs(p.slip);
    const lateBrake = p.controls.brake > 0.4 && s > 35 ? 1 : 0;
    const earlyGas = p.controls.throttle > 0.7 && s < 15 ? 1 : 0;
    const drift = slip > 0.35 ? 1 : 0;
    const risk = p.controls.brake < 0.1 && p.controls.throttle > 0.8 ? 1 : 0;
    const err = p.damage > 0.1 ? 1 : 0;
    this.adapt.lateBrake = this.adapt.lateBrake * 0.8 + lateBrake * 0.2;
    this.adapt.earlyGas = this.adapt.earlyGas * 0.8 + earlyGas * 0.2;
    this.adapt.drift = this.adapt.drift * 0.8 + drift * 0.2;
    this.adapt.risk = this.adapt.risk * 0.8 + risk * 0.2;
    this.adapt.errors = this.adapt.errors * 0.8 + err * 0.2;
  }

  _adaptBehavior(diff) {
    const a = this.adapt;
    let aggr = this.profile.aggression;
    if (a.lateBrake + a.earlyGas + a.drift + a.risk > 1.8) aggr += 0.2;
    if (a.errors > 0.3 && diff !== 'HARD') aggr -= 0.15;
    if (diff === 'HARD') aggr = Math.max(aggr, 0.6);
    this.behavior.aggression = clamp(aggr, 0.2, 1);
    this.behavior.patience = clamp(this.profile.patience + (a.errors > 0.4 ? 0.2 : -0.1), 0.1, 1);
    this.behavior.risk = clamp(this.profile.risk + a.risk * 0.2, 0.1, 1);
    this.behavior.defense = clamp(this.profile.defense + (a.earlyGas > 0.6 ? 0.2 : 0), 0.1, 1);
  }

  _drive(dt) {
    const c = this.car;
    const t = this.game.track;
    const target = this.line.sample(c.progress + 8);
    const target2 = this.line.sample(c.progress + 20);
    const dx = target.x - c.x;
    const dy = target.y - c.y;
    const angleToTarget = Math.atan2(dy, dx);
    const steerError = angleNorm(angleToTarget - c.angle);
    c.controls.steer = clamp(steerError * 1.8, -1, 1);

    const speedTarget = this._speedPlan(target, target2);
    const spd = c.speed;
    c.controls.throttle = spd < speedTarget ? 1 : 0.2;
    c.controls.brake = spd > speedTarget + 5 ? 0.8 : 0.0;
    c.controls.nitro = spd < speedTarget * 0.7 && this.behavior.risk > 0.6 ? 1 : 0;

    if (Math.random() < 0.002 * (1 - this.behavior.patience)) {
      c.controls.brake += 0.4;
    }
  }

  _speedPlan(t1, t2) {
    const curvature = Math.abs(t2.curve);
    const base = this.car.spec.maxSpeed;
    const slow = base * (1 - curvature * 0.8);
    const risk = this.behavior.risk * 0.2;
    return slow + base * risk;
  }
}
