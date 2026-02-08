import { Engine } from './core/engine.js';
import { Game } from './game/game.js';
import { UI } from './ui/menu.js';

const canvas = document.getElementById('game');
const engine = new Engine(canvas);
const game = new Game(engine);
const ui = new UI(game);

engine.setGame(game);
engine.setUI(ui);
engine.start();
