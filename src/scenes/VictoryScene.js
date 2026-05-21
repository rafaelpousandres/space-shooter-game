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

    this.add.text(width / 2, height / 2 - 130, 'VICTORY', {
      fontFamily: 'monospace', fontSize: '52px', color: '#ffd060', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 70, 'BOSSES DOWN', {
      fontFamily: 'monospace', fontSize: '18px', color: '#88ffcc',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 30, 'FINAL SCORE', {
      fontFamily: 'monospace', fontSize: '14px', color: '#88aacc',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 5, `${this.finalScore}`, {
      fontFamily: 'monospace', fontSize: '40px', color: '#ffffff',
    }).setOrigin(0.5);

    this._makeBigButton(width / 2, height / 2 + 90, 220, 50, 'TITLE', () => this.scene.start('Title'));
    this._makeBigButton(width / 2, height / 2 + 150, 220, 44, 'PLAY AGAIN', () => this.scene.start('Game'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-R', () => this.scene.start('Game'));
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.2 * (delta / 16.6);
  }

  _makeBigButton(x, y, w, h, label, onTap) {
    const bg = this.add.rectangle(x, y, w, h, 0x111a2c, 0.95)
      .setStrokeStyle(2, 0x55ccff, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '20px', color: '#aaddff',
    }).setOrigin(0.5);
    bg.on('pointerdown', () => { bg.fillColor = 0x224466; onTap(); });
    bg.on('pointerup',  () => bg.fillColor = 0x111a2c);
    bg.on('pointerout', () => bg.fillColor = 0x111a2c);
  }
}
