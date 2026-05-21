export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('Victory');
  }

  init(data) {
    this.finalScore = data?.score ?? 0;
  }

  create() {
    const { width, height } = this.scale;

    this.bg = this.add.tileSprite(0, 0, width, height, 'bg-stars').setOrigin(0, 0).setAlpha(0.5);
    this.add.image(width / 2, height * 0.22, 'prop-planet').setScale(2.6).setAlpha(0.7);

    this.add.text(width / 2, height / 2 - 100, 'VICTORY', {
      fontFamily: 'monospace', fontSize: '52px', color: '#ffd060', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, 'BOSS DOWN', {
      fontFamily: 'monospace', fontSize: '20px', color: '#88ffcc',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, 'FINAL SCORE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#88aacc',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 40, `${this.finalScore}`, {
      fontFamily: 'monospace', fontSize: '40px', color: '#ffffff',
    }).setOrigin(0.5);

    const prompt = this.add.text(width / 2, height / 2 + 130, 'press SPACE for title', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffd060',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-R', () => this.scene.start('Title'));
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.2 * (delta / 16.6);
  }
}
