import { AIDriver } from './ai_driver.js';
import { AI_PROFILES } from '../data/ai_profiles.js';

export class AIManager {
  constructor(game) {
    this.game = game;
    this.drivers = [];
    this._init();
  }

  _init() {
    const bots = this.game.cars.filter(c => !c.isPlayer);
    for (let i=0;i<bots.length;i++) {
      const profile = AI_PROFILES[i % AI_PROFILES.length];
      this.drivers.push(new AIDriver(this.game, bots[i], profile));
    }
  }

  update(dt) {
    for (const d of this.drivers) d.update(dt);
  }
}
