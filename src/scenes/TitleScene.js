export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;

    this.bg = this.add.tileSprite(0, 0, width, height, 'bg-stars').setOrigin(0, 0);
    this.planet = this.add.image(width * 0.78, height * 0.18, 'prop-planet').setScale(2).setAlpha(0.7);
    this.eclipse = this.add.image(width * 0.18, height * 0.78, 'prop-eclipse-2').setScale(1.6).setAlpha(0.6);

    this.add.text(width / 2, height * 0.22, 'SPACE', {
      fontFamily: 'monospace', fontSize: '56px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.32, 'SHOOTER', {
      fontFamily: 'monospace', fontSize: '56px', color: '#ffd060', fontStyle: 'bold',
    }).setOrigin(0.5);

    const ship = this.add.sprite(width / 2, height * 0.5, 'player-ship').play('player-idle').setScale(2);
    this.tweens.add({ targets: ship, y: ship.y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const prompt = this.add.text(width / 2, height * 0.7, 'PRESS SPACE TO START', {
      fontFamily: 'monospace', fontSize: '18px', color: '#88ccff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    this.add.text(width / 2, height * 0.78, 'H — HOW TO PLAY', {
      fontFamily: 'monospace', fontSize: '14px', color: '#88aacc',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 20, 'made with Phaser · art: Warped Legacy Collection', {
      fontFamily: 'monospace', fontSize: '10px', color: '#445577',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Game'));
    this.input.keyboard.on('keydown-H', () => this.scene.launch('Help', { returnTo: 'Title' }));
    this.input.on('pointerdown', () => this.scene.start('Game'));
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.3 * (delta / 16.6);
  }
}
