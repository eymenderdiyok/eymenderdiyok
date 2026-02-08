export class Pool {
  constructor(create, size=64) {
    this.create = create;
    this.items = Array.from({length: size}, () => create());
    this.used = 0;
  }
  get() {
    if (this.used >= this.items.length) this.items.push(this.create());
    return this.items[this.used++];
  }
  reset() { this.used = 0; }
}
