import Display from './display.js';

export default class Ui {

  constructor() {

    this.display = new Display();

  }

  render(game) {

    this.display.clear();

    this.display.setColor('yellow');
    this.display.rect(40, window.innerHeight - 60, Math.abs(game.player.velocity) * 2000, 20);

    this.display.setColor('white');

    let str = `${Math.floor(Math.abs(game.player.velocity*1000))} mph`;

    if(game.player.velocity > 0) {
      str += ' R';
    }

    this.display.text(str, '50px Arial', 40, window.innerHeight - 100);

  }

}
