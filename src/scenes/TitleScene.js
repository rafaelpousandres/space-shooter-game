const isTouchDevice = () => (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  || (typeof window !== 'undefined' && 'ontouchstart' in window);

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    const touch = isTouchDevice();

    this.bg = this.add.tileSprite(0, 0, width, height, 'bg-stars').setOrigin(0, 0);
    this.planet = this.add.image(width * 0.78, height * 0.18, 'prop-planet').setScale(2).setAlpha(0.7);
    this.eclipse = this.add.image(width * 0.18, height * 0.78, 'prop-eclipse-2').setScale(1.6).setAlpha(0.6);

    this.add.text(width / 2, height * 0.18, 'SPACE', {
      fontFamily: 'monospace', fontSize: '56px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.27, 'SHOOTER', {
      fontFamily: 'monospace', fontSize: '56px', color: '#ffd060', fontStyle: 'bold',
    }).setOrigin(0.5);

    const ship = this.add.sprite(width / 2, height * 0.45, 'player-ship').play('player-idle').setScale(2);
    this.tweens.add({ targets: ship, y: ship.y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this._makeBigButton(width / 2, height * 0.62, 240, 56, 'START', () => this.scene.start('Game'));
    this._makeBigButton(width / 2, height * 0.72, 240, 46, 'HOW TO PLAY', () => this.scene.launch('Help', { returnTo: 'Title' }));
    this._makeBigButton(width / 2, height * 0.82, 240, 40, 'FULLSCREEN',  () => this._toggleFullscreen());

    this.add.text(width / 2, height - 20, 'made with Phaser · art: Warped Legacy Collection', {
      fontFamily: 'monospace', fontSize: '10px', color: '#445577',
    }).setOrigin(0.5);

    // Keyboard shortcuts (desktop)
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Game'));
    this.input.keyboard.on('keydown-H', () => this.scene.launch('Help', { returnTo: 'Title' }));
    this.input.keyboard.on('keydown-F', () => this._toggleFullscreen());
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.3 * (delta / 16.6);
  }

  _toggleFullscreen() {
    if (!this.scale.fullscreen.available) return;
    if (this.scale.isFullscreen) this.scale.stopFullscreen();
    else this.scale.startFullscreen();
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
