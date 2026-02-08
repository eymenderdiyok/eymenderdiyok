export class Replay {
  constructor() {
    this.frames = [];
    this.max = 60 * 30;
  }
  record(car, dt) {
    this.frames.push({ x: car.x, y: car.y, angle: car.angle });
    if (this.frames.length > this.max) this.frames.shift();
  }
}
