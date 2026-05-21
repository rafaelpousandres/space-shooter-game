export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000010, 0.72).setOrigin(0, 0);

    this.add.text(width / 2, height / 2 - 30, 'PAUSED', {
      fontFamily: 'monospace', fontSize: '40px', color: '#ffd060',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, 'P or Esc to resume', {
      fontFamily: 'monospace', fontSize: '14px', color: '#88ccff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'H for help', {
      fontFamily: 'monospace', fontSize: '14px', color: '#88aacc',
    }).setOrigin(0.5);

    const resume = () => {
      if (this.scene.isPaused('Game')) this.scene.resume('Game');
      this.scene.stop();
    };
    this.input.keyboard.once('keydown-P', resume);
    this.input.keyboard.once('keydown-ESC', resume);
    this.input.keyboard.once('keydown-H', () => {
      this.scene.stop();
      this.scene.launch('Help', { returnTo: 'Game' });
    });
  }
}
