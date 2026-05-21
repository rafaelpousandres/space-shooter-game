const isTouchDevice = () => (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  || (typeof window !== 'undefined' && 'ontouchstart' in window);

export class HelpScene extends Phaser.Scene {
  constructor() {
    super('Help');
  }

  init(data) {
    this.returnTo = data?.returnTo ?? null;
  }

  create() {
    const { width, height } = this.scale;
    const touch = isTouchDevice();

    const bg = this.add.rectangle(0, 0, width, height, 0x000010, 0.85)
      .setOrigin(0, 0)
      .setInteractive();

    const panelW = 380;
    const panelH = 560;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x111a2c, 0.95).setOrigin(0, 0)
      .setStrokeStyle(2, 0x55ccff, 0.6);

    this.add.text(width / 2, panelY + 24, 'HELP', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffd060',
    }).setOrigin(0.5);

    const labelStyle = { fontFamily: 'monospace', fontSize: '13px', color: '#88ccff' };
    const rowStyle   = { fontFamily: 'monospace', fontSize: '13px', color: '#ffffff' };

    let y = panelY + 70;
    const leftX = panelX + 24;
    const colX  = panelX + 150;

    this.add.text(leftX, y, 'CONTROLS', labelStyle);
    y += 22;
    const rows = touch ? [
      ['tap & drag',  'move (auto-fire)'],
      ['top-right ‖', 'pause'],
      ['top-right ?', 'this help'],
      ['top-right ⛶', 'fullscreen'],
    ] : [
      ['WASD / arrows', 'move'],
      ['mouse',         'aim'],
      ['left click',    'fire (hold for auto)'],
      ['H',             'toggle this help'],
      ['P / Esc',       'pause'],
      ['R',             'restart on game over'],
    ];
    for (const [key, desc] of rows) {
      this.add.text(leftX + 8, y, key, rowStyle);
      this.add.text(colX, y, desc, rowStyle);
      y += 18;
    }

    y += 12;
    this.add.text(leftX, y, 'ENEMIES', labelStyle);
    y += 26;
    const enemyRows = [
      { texture: 'enemy-01', anim: 'enemy-01-idle', name: 'drifter', desc: '1 HP, straight down' },
      { texture: 'enemy-02', anim: 'enemy-02-idle', name: 'tank',    desc: '3 HP, slow, shoots' },
      { texture: 'enemy-03', anim: 'enemy-03-idle', name: 'raider',  desc: '1 HP, fast, weaves' },
    ];
    for (const e of enemyRows) {
      this.add.sprite(leftX + 16, y, e.texture).play(e.anim).setScale(0.9);
      this.add.text(leftX + 48, y - 8, e.name, rowStyle);
      this.add.text(colX,        y - 8, e.desc, rowStyle);
      y += 36;
    }

    y += 6;
    this.add.text(leftX, y, 'HAZARDS', labelStyle);
    y += 26;
    this.add.sprite(leftX + 16, y, 'asteroid-3').setScale(1.4);
    this.add.text(leftX + 48, y - 8, 'asteroid', rowStyle);
    this.add.text(colX,        y - 8, 'destructible, contact dmg', rowStyle);

    y += 32;
    this.add.text(leftX, y, 'PICKUPS', labelStyle);
    y += 26;
    this.add.sprite(leftX + 16, y, 'shield', 0).setScale(0.7);
    this.add.text(leftX + 48, y - 8, 'shield', rowStyle);
    this.add.text(colX,        y - 8, 'absorbs 3 hits', rowStyle);

    this.add.text(width / 2, panelY + panelH - 22,
      touch ? 'tap anywhere to close' : 'press H, Esc, or click to close', {
        fontFamily: 'monospace', fontSize: '12px', color: '#ffd060',
      }).setOrigin(0.5);

    const close = () => {
      if (this.returnTo === 'Game') {
        if (this.scene.isPaused('Game')) this.scene.resume('Game');
        if (this.scene.isPaused('HUD'))  this.scene.resume('HUD');
      }
      this.scene.stop();
    };
    bg.on('pointerdown', close);
    this.input.keyboard.once('keydown-H', close);
    this.input.keyboard.once('keydown-ESC', close);
  }
}
