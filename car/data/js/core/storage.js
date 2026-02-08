export class Storage {
  constructor(prefix='car-html5') {
    this.prefix = prefix;
  }
  key(k) { return `${this.prefix}:${k}`; }
  get(k, fallback=null) {
    const v = localStorage.getItem(this.key(k));
    if (v === null || v === undefined) return fallback;
    try { return JSON.parse(v); } catch { return v; }
  }
  set(k, v) { localStorage.setItem(this.key(k), JSON.stringify(v)); }
  del(k) { localStorage.removeItem(this.key(k)); }
}
