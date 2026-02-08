import { Track } from '../physics/track.js';
import { Vehicle } from '../physics/vehicle.js';
import { Renderer } from '../render/renderer.js';
import { Camera } from '../render/camera.js';
import { HUD } from '../render/hud.js';
import { Effects } from '../render/effects.js';
import { AIManager } from '../ai/ai_manager.js';
import { GameState } from './state.js';
import { WEATHER } from './weather.js';
import { Replay } from './replay.js';
import { Ghost } from './ghost.js';
import { resolveCarCollision } from '../physics/collision.js';
import { VEHICLES } from '../data/vehicle_data.js';

export class Game {
  constructor(engine) {
    this.engine = engine;
    this.state = GameState.MENU;
    this.track = new Track();
    this.camera = new Camera();
    this.renderer = new Renderer(this);
    this.hud = new HUD(this);
    this.effects = new Effects(this);
    this.weather = WEATHER;
    this.rules = { laps: 3, difficulty: 'NORMAL' };
    this.cars = [];
    this.player = null;
    this.ai = null;
    this.replay = new Replay();
    this.ghost = new Ghost();
    this._initCars();
  }

  _initCars() {
    this.cars = [];
    const base = VEHICLES[0];
    const spacing = 50;
    for (let i=0;i<8;i++) {
      const spec = { ...base, x: this.track.points[0].x - i * spacing, y: this.track.points[0].y + i * 10, angle: 0 };
      spec.color = i === 0 ? '#38e1ff' : `hsl(${(i*40)%360}, 80%, 60%)`;
      spec.isPlayer = i === 0;
      const car = new Vehicle(spec);
      this.cars.push(car);
    }
    this.player = this.cars[0];
    this.ai = new AIManager(this);
  }

  onResize(w, h, dpr) {
    this.camera.resize(w, h, dpr);
  }

  startRace(diff) {
    this.rules.difficulty = diff;
    this.state = GameState.RACE;
  }

  update(time, input) {
    if (this.state !== GameState.RACE) return;
    this.player.controls = { ...this.player.controls, ...input.axes };

    for (const car of this.cars) {
      car.update(time.dt, this.track, this.weather);
    }
    for (let i=0;i<this.cars.length;i++) {
      for (let j=i+1;j<this.cars.length;j++) {
        resolveCarCollision(this.cars[i], this.cars[j]);
      }
    }

    this._updateProgress();
    this._sortPositions();
    this.ai.update(time.dt);

    this.camera.update(this.player, time.dt, 5);
    this.effects.update(time.dt);
    this.replay.record(this.player, time.dt);
    this.ghost.update(this.player, time.dt);
  }

  _updateProgress() {
    const t = this.track;
    for (const car of this.cars) {
      const idx = t.findClosest(car.x, car.y, car._lastIdx || 0);
      car._lastIdx = idx;
      car.progress = idx + car.lap * t.points.length;
      if (idx < 10 && car._lastIdx > t.points.length - 20) car.lap++;
    }
  }

  _sortPositions() {
    const sorted = [...this.cars].sort((a,b)=>b.progress-a.progress);
    sorted.forEach((c,i)=>c.position=i+1);
  }

  render(ctx, time) {
    this.renderer.render(ctx, time);
  }
}
