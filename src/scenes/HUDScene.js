const isTouchDevice = () => (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  || (typeof window !== 'undefined' && 'ontouchstart' in window);

export class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width, height } = this.scale;

    this.scoreText = this.add.text(10, 8, 'SCORE 0', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
    });

    // Lives gets pushed left to leave room for buttons in the corner.
    this.livesText = this.add.text(width - 152, 8, 'LIVES 3', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffd060',
    }).setOrigin(1, 0);

    this.hpBg   = this.add.rectangle(10, 32, 120, 10, 0x222233).setOrigin(0, 0);
    this.hpFill = this.add.rectangle(10, 32, 120, 10, 0x55ff88).setOrigin(0, 0);
    this.add.text(10, 44, 'HP', { fontFamily: 'monospace', fontSize: '10px', color: '#88ccff' });

    this.shieldPips = [];
    for (let i = 0; i < 3; i++) {
      const pip = this.add.sprite(140 + i * 16, 37, 'shield', 0).setScale(0.45).setAlpha(0.25);
      this.shieldPips.push(pip);
    }
    this.add.text(140, 44, 'SHIELD', { fontFamily: 'monospace', fontSize: '10px', color: '#88ddff' });

    // Boss HP bar
    this.bossLabel = this.add.text(width / 2, 56, 'BOSS', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff8888',
    }).setOrigin(0.5, 0).setVisible(false);
    this.bossBarBg   = this.add.rectangle(width / 2 - 100, 72, 200, 8, 0x331111).setOrigin(0, 0).setVisible(false);
    this.bossBarFill = this.add.rectangle(width / 2 - 100, 72, 200, 8, 0xff5566).setOrigin(0, 0).setVisible(false);

    // Top-right tap buttons
    const btnSize = 38;
    const btnY = 26;
    this._makeButton(width - btnSize / 2 - 8,        btnY, btnSize, '‖', () => this.gameScene.requestPause());
    this._makeButton(width - btnSize / 2 - 8 - 46,   btnY, btnSize, '?', () => this.gameScene.requestHelp());
    this._makeButton(width - btnSize / 2 - 8 - 92,   btnY, btnSize, '⛶', () => this.gameScene.requestFullscreen());

    const hint = isTouchDevice()
      ? 'drag to fly · auto-fire · top-right: pause / help / fullscreen'
      : 'WASD move · mouse aim · click to fire · H help · P pause';
    this.hintText = this.add.text(width / 2, height - 18, hint, {
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

  _makeButton(x, y, size, label, onTap) {
    const bg = this.add.rectangle(x, y, size, size, 0x111a2c, 0.85)
      .setStrokeStyle(1, 0x55ccff, 0.7);
    const txt = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '18px', color: '#aaddff',
    }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      bg.fillColor = 0x224466;
      onTap();
    });
    bg.on('pointerup',   () => bg.fillColor = 0x111a2c);
    bg.on('pointerout',  () => bg.fillColor = 0x111a2c);
    return { bg, txt };
  }

  _onScore(score) { this.scoreText.setText(`SCORE ${score}`); }

  _onHp(hp) {
    const maxHp = 3;
    this.hpFill.width = Math.max(0, (hp / maxHp) * 120);
    this.hpFill.fillColor = hp >= 3 ? 0x55ff88 : hp === 2 ? 0xffcc44 : 0xff5544;
  }

  _onLives(lives) { this.livesText.setText(`LIVES ${Math.max(0, lives)}`); }

  _onShield(charges) {
    for (let i = 0; i < this.shieldPips.length; i++) {
      this.shieldPips[i].setAlpha(i < charges ? 1.0 : 0.18);
    }
  }

  _onBossHp(hp, maxHp) {
    const show = maxHp > 0;
    this.bossLabel.setVisible(show);
    this.bossBarBg.setVisible(show);
    this.bossBarFill.setVisible(show);
    if (show) this.bossBarFill.width = Math.max(0, (hp / maxHp) * 200);
  }
}
