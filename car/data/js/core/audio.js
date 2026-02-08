export class AudioBus {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
  }

  enable() {
    if (this.enabled) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.4;
    this.master.connect(this.ctx.destination);
    this.enabled = true;
  }

  beep(freq, dur, vol=0.1) {
    if (!this.enabled) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.value = freq;
    o.type = 'sawtooth';
    g.gain.value = vol;
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }
}
