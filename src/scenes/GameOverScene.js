export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data?.score ?? 0;
  }

  create() {
    const { width, height } = this.scale;
    this.bg = this.add.tileSprite(0, 0, width, height, 'bg-stars').setOrigin(0, 0).setAlpha(0.4);

    this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
      fontFamily: 'monospace', fontSize: '40px', color: '#ff5566',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, 'FINAL SCORE', {
      fontFamily: 'monospace', fontSize: '16px', color: '#88aacc',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, `${this.finalScore}`, {
      fontFamily: 'monospace', fontSize: '36px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 90, 'R retry · SPACE title', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffd060',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Title'));
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.2 * (delta / 16.6);
  }
}
