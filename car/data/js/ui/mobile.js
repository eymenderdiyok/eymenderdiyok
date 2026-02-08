export class Mobile {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById('mobile');
    this._build();
  }

  _build() {
    const left = document.createElement('div');
    left.className = 'control left';
    const right = document.createElement('div');
    right.className = 'control right';
    const gas = document.createElement('div');
    gas.className = 'btn gas';
    gas.textContent = 'GAS';
    const brake = document.createElement('div');
    brake.className = 'btn brake';
    brake.textContent = 'BRAKE';
    this.el.appendChild(left);
    this.el.appendChild(right);
    this.el.appendChild(gas);
    this.el.appendChild(brake);

    left.addEventListener('pointerdown', () => this.game.player.controls.steer = -1);
    left.addEventListener('pointerup', () => this.game.player.controls.steer = 0);
    right.addEventListener('pointerdown', () => this.game.player.controls.steer = 1);
    right.addEventListener('pointerup', () => this.game.player.controls.steer = 0);
    gas.addEventListener('pointerdown', () => this.game.player.controls.throttle = 1);
    gas.addEventListener('pointerup', () => this.game.player.controls.throttle = 0);
    brake.addEventListener('pointerdown', () => this.game.player.controls.brake = 1);
    brake.addEventListener('pointerup', () => this.game.player.controls.brake = 0);
  }
}
