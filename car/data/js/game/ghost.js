export class Ghost {
  constructor() {
    this.active = false;
    this.path = [];
  }
  update(car) {
    if (!this.active) return;
    this.path.push({ x: car.x, y: car.y, angle: car.angle });
  }
}
