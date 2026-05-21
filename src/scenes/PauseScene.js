export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const { width, height } = this.scale;

    // Full-screen catcher: any tap outside the buttons resumes.
    const bg = this.add.rectangle(0, 0, width, height, 0x000010, 0.78)
      .setOrigin(0, 0)
      .setInteractive();

    this.add.text(width / 2, height / 2 - 90, 'PAUSED', {
      fontFamily: 'monospace', fontSize: '44px', color: '#ffd060',
    }).setOrigin(0.5);

    this._makeBigButton(width / 2, height / 2 - 10, 220, 50, 'RESUME', () => this._resume());
    this._makeBigButton(width / 2, height / 2 + 56, 220, 44, 'HELP', () => {
      this.scene.stop();
      this.scene.launch('Help', { returnTo: 'Game' });
    });

    this.add.text(width / 2, height / 2 + 130, 'or P / Esc / tap', {
      fontFamily: 'monospace', fontSize: '12px', color: '#88aacc',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => this._resume());

    this.input.keyboard.once('keydown-P', () => this._resume());
    this.input.keyboard.once('keydown-ESC', () => this._resume());
    this.input.keyboard.once('keydown-H', () => {
      this.scene.stop();
      this.scene.launch('Help', { returnTo: 'Game' });
    });
  }

  _resume() {
    if (this.scene.isPaused('Game')) this.scene.resume('Game');
    if (this.scene.isPaused('HUD'))  this.scene.resume('HUD');
    this.scene.stop();
  }

  _makeBigButton(x, y, w, h, label, onTap) {
    const bg = this.add.rectangle(x, y, w, h, 0x111a2c, 0.95)
      .setStrokeStyle(2, 0x55ccff, 0.7)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '20px', color: '#aaddff',
    }).setOrigin(0.5);
    bg.on('pointerdown', (pointer, lx, ly, event) => {
      bg.fillColor = 0x224466;
      event.stopPropagation();
      onTap();
    });
    bg.on('pointerup',  () => bg.fillColor = 0x111a2c);
    bg.on('pointerout', () => bg.fillColor = 0x111a2c);
    return { bg, txt };
  }
}
