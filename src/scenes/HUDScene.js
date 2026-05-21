export class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width } = this.scale;

    this.scoreText = this.add.text(10, 8, 'SCORE 0', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    });

    this.livesText = this.add.text(width - 10, 8, 'LIVES 3', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffd060',
    }).setOrigin(1, 0);

    this.hpBg   = this.add.rectangle(10, 32, 120, 10, 0x222233).setOrigin(0, 0);
    this.hpFill = this.add.rectangle(10, 32, 120, 10, 0x55ff88).setOrigin(0, 0);
    this.add.text(10, 44, 'HP', { fontFamily: 'monospace', fontSize: '10px', color: '#88ccff' });

    // Shield indicator: three pip icons next to the HP bar.
    this.shieldPips = [];
    for (let i = 0; i < 3; i++) {
      const pip = this.add.sprite(140 + i * 16, 37, 'shield', 0).setScale(0.45).setAlpha(0.25);
      this.shieldPips.push(pip);
    }
    this.add.text(140, 44, 'SHIELD', { fontFamily: 'monospace', fontSize: '10px', color: '#88ddff' });

    // Boss HP bar (top center), hidden until boss appears.
    this.bossLabel = this.add.text(width / 2, 8, 'BOSS', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff8888',
    }).setOrigin(0.5, 0).setVisible(false);
    this.bossBarBg   = this.add.rectangle(width / 2 - 100, 24, 200, 8, 0x331111).setOrigin(0, 0).setVisible(false);
    this.bossBarFill = this.add.rectangle(width / 2 - 100, 24, 200, 8, 0xff5566).setOrigin(0, 0).setVisible(false);

    this.hintText = this.add.text(width / 2, this.scale.height - 18,
      'WASD move · mouse aim · click to fire · H help · P pause', {
      fontFamily: 'monospace', fontSize: '11px', color: '#6688aa',
    }).setOrigin(0.5, 0.5);

    const g = this.gameScene.events;
    g.on('score-changed', this._onScore, this);
    g.on('hp-changed', this._onHp, this);
    g.on('lives-changed', this._onLives, this);
    g.on('shield-changed', this._onShield, this);
    g.on('boss-hp-changed', this._onBossHp, this);

    this.events.once('shutdown', () => {
      g.off('score-changed', this._onScore, this);
      g.off('hp-changed', this._onHp, this);
      g.off('lives-changed', this._onLives, this);
      g.off('shield-changed', this._onShield, this);
      g.off('boss-hp-changed', this._onBossHp, this);
    });
  }

  _onScore(score) {
    this.scoreText.setText(`SCORE ${score}`);
  }

  _onHp(hp) {
    const maxHp = 3;
    this.hpFill.width = Math.max(0, (hp / maxHp) * 120);
    this.hpFill.fillColor = hp >= 3 ? 0x55ff88 : hp === 2 ? 0xffcc44 : 0xff5544;
  }

  _onLives(lives) {
    this.livesText.setText(`LIVES ${Math.max(0, lives)}`);
  }

  _onShield(charges, max) {
    for (let i = 0; i < this.shieldPips.length; i++) {
      this.shieldPips[i].setAlpha(i < charges ? 1.0 : 0.18);
    }
  }

  _onBossHp(hp, maxHp) {
    if (maxHp <= 0) {
      this.bossLabel.setVisible(false);
      this.bossBarBg.setVisible(false);
      this.bossBarFill.setVisible(false);
      return;
    }
    this.bossLabel.setVisible(true);
    this.bossBarBg.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossBarFill.width = Math.max(0, (hp / maxHp) * 200);
  }
}
