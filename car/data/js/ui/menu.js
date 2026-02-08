import { GameState } from '../game/state.js';
import { Result } from './result.js';
import { Mobile } from './mobile.js';

export class UI {
  constructor(game) {
    this.game = game;
    this.menu = document.getElementById('menu');
    this.result = document.getElementById('result');
    this.mobile = new Mobile(game);
    this.resultUI = new Result(game);
    this._buildMenu();
  }

  _buildMenu() {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="title">FORZA LEVEL – HTML5</div>
      <div class="subtitle">OFFLINE • AI BOTLAR • GERÇEK FİZİK</div>
      <button class="btn" data-diff="EASY">EASY</button>
      <button class="btn alt" data-diff="NORMAL">NORMAL</button>
      <button class="btn warn" data-diff="HARD">HARD</button>
    `;
    this.menu.appendChild(card);
    card.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.diff;
        this.menu.style.display = 'none';
        this.game.startRace(diff);
      });
    });
  }

  update() {
    if (this.game.state === GameState.RESULT) {
      this.resultUI.show();
    }
  }
}
