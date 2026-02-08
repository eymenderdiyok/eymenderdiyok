export class HUD {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById('hud');
    this.speed = document.createElement('div');
    this.telemetry = document.createElement('div');
    this.lap = document.createElement('div');
    this.position = document.createElement('div');
    this.minimap = document.createElement('div');
    this.speed.className = 'speed';
    this.telemetry.className = 'telemetry';
    this.lap.className = 'lap';
    this.position.className = 'position';
    this.minimap.className = 'minimap';
    this.el.appendChild(this.speed);
    this.el.appendChild(this.telemetry);
    this.el.appendChild(this.lap);
    this.el.appendChild(this.position);
    this.el.appendChild(this.minimap);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 220;
    this.canvas.height = 120;
    this.minimap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  update() {
    const p = this.game.player;
    const v = Math.floor(p.speed * 3.6);
    this.speed.textContent = `${v} km/h`;
    this.telemetry.textContent = `THR ${p.controls.throttle.toFixed(2)} | BRK ${p.controls.brake.toFixed(2)} | STR ${p.controls.steer.toFixed(2)} | N2O ${p.controls.nitro.toFixed(2)}`;
    this.lap.textContent = `LAP ${p.lap}/${this.game.rules.laps}`;
    this.position.textContent = `POS ${p.position}/${this.game.cars.length}`;
    this.drawMinimap();
  }

  drawMinimap() {
    const ctx = this.ctx;
    const t = this.game.track;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.save();
    ctx.translate(this.canvas.width/2, this.canvas.height/2);
    const scale = 0.1;
    ctx.scale(scale, scale);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i=0;i<t.points.length;i++) {
      const p = t.points[i];
      if (i===0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
    for (const car of this.game.cars) {
      ctx.fillStyle = car.isPlayer ? '#38e1ff' : 'rgba(255,183,3,0.8)';
      ctx.beginPath();
      ctx.arc(car.x, car.y, 16, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
}
