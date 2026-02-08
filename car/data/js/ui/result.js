export class Result {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById('result');
    this.card = document.createElement('div');
    this.card.className = 'card';
    this.el.appendChild(this.card);
  }

  show() {
    const sorted = [...this.game.cars].sort((a,b)=>a.position-b.position);
    const lines = sorted.map((c,i)=>`${i+1}. ${c.isPlayer ? 'PLAYER' : 'AI'}`);
    const medal = this._medal(sorted[0]);
    this.card.innerHTML = `
      <div class="title">RESULT</div>
      <div class="subtitle">${medal}</div>
      <div>${lines.join('<br>')}</div>
    `;
    this.el.style.display = 'flex';
  }

  _medal(car) {
    if (!car.isPlayer) return 'NO MEDAL';
    if (car.position === 1) return '<div class="medal">🥇</div>';
    if (car.position === 2) return '<div class="medal">🥈</div>';
    if (car.position === 3) return '<div class="medal">🥉</div>';
    return 'NO MEDAL';
  }
}
