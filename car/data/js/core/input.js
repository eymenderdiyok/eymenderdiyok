import { clamp } from './math.js';

export class Input {
  constructor(canvas) {
    this.keys = new Map();
    this.axes = { steer: 0, throttle: 0, brake: 0, nitro: 0 };
    this.touches = new Map();
    this.canvas = canvas;
    this.pointer = { x: 0, y: 0, down: false };
    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => this.keys.set(e.code, true));
    window.addEventListener('keyup', (e) => this.keys.set(e.code, false));
    this.canvas.addEventListener('pointerdown', (e) => this._onPointer(e, true));
    this.canvas.addEventListener('pointerup', (e) => this._onPointer(e, false));
    this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.canvas.addEventListener('pointercancel', (e) => this._onPointer(e, false));
  }

  _onPointer(e, down) {
    this.pointer.down = down;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
  }

  _onPointerMove(e) {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
  }

  update(dt) {
    const k = (code) => !!this.keys.get(code);
    const steer = (k('ArrowLeft') || k('KeyA') ? -1 : 0) + (k('ArrowRight') || k('KeyD') ? 1 : 0);
    const throttle = k('ArrowUp') || k('KeyW') ? 1 : 0;
    const brake = k('ArrowDown') || k('KeyS') ? 1 : 0;
    const nitro = k('ShiftLeft') || k('ShiftRight') ? 1 : 0;
    this.axes.steer = clamp(steer, -1, 1);
    this.axes.throttle = clamp(throttle, 0, 1);
    this.axes.brake = clamp(brake, 0, 1);
    this.axes.nitro = clamp(nitro, 0, 1);
  }
}
