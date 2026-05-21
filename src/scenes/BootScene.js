export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('bg-stars',       'assets/bg/stage-back.png');
    this.load.image('prop-planet',    'assets/bg/planet.png');
    this.load.image('prop-eclipse-1', 'assets/bg/eclipse-1.png');
    this.load.image('prop-eclipse-2', 'assets/bg/eclipse-2.png');

    this.load.spritesheet('player-ship',   'assets/player/ship-yellow.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player-thrust', 'assets/player/thrust.png',      { frameWidth: 16, frameHeight: 10 });

    this.load.spritesheet('enemy-01', 'assets/enemies/enemy-01.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('enemy-02', 'assets/enemies/enemy-02.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('enemy-03', 'assets/enemies/enemy-03.png', { frameWidth: 48, frameHeight: 48 });

    this.load.spritesheet('enemy-explosion', 'assets/enemies/enemy-explosion.png', { frameWidth: 80, frameHeight: 80 });
    this.load.spritesheet('explosion-g',     'assets/fx/explosion-g.png',          { frameWidth: 48, frameHeight: 48 });

    this.load.spritesheet('pulse',     'assets/fx/pulse.png',  { frameWidth: 63, frameHeight: 32 });
    this.load.spritesheet('bolt',      'assets/fx/bolt.png',   { frameWidth: 48, frameHeight: 32 });
    this.load.spritesheet('hit-spark', 'assets/fx/hit.png',    { frameWidth: 31, frameHeight: 32 });

    for (let i = 1; i <= 5; i++) {
      this.load.image(`asteroid-${i}`, `assets/asteroids/asteroid-${i}.png`);
    }

    this.load.spritesheet('boss-body',         'assets/boss/boss.png',        { frameWidth: 192, frameHeight: 144 });
    this.load.spritesheet('boss-thrust',       'assets/boss/boss-thrust.png', { frameWidth: 128, frameHeight: 48 });
    this.load.image('boss-cannon-left',        'assets/boss/cannon-left.png');
    this.load.image('boss-cannon-right',       'assets/boss/cannon-right.png');
    this.load.spritesheet('boss-bolt',         'assets/boss/bolt.png',        { frameWidth: 8,  frameHeight: 8 });
    this.load.spritesheet('boss-rays',         'assets/boss/rays.png',        { frameWidth: 64, frameHeight: 224 });
  }

  create() {
    const a = this.anims;
    a.create({ key: 'player-idle', frames: a.generateFrameNumbers('player-ship', { start: 0, end: 4 }), frameRate: 10, repeat: -1 });
    a.create({ key: 'thrust-burn', frames: a.generateFrameNumbers('player-thrust', { start: 0, end: 1 }), frameRate: 16, repeat: -1 });

    a.create({ key: 'enemy-01-idle', frames: a.generateFrameNumbers('enemy-01', { start: 0, end: 4 }), frameRate: 8, repeat: -1 });
    a.create({ key: 'enemy-02-idle', frames: a.generateFrameNumbers('enemy-02', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    a.create({ key: 'enemy-03-idle', frames: a.generateFrameNumbers('enemy-03', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });

    a.create({ key: 'enemy-explode', frames: a.generateFrameNumbers('enemy-explosion', { start: 0, end: 6 }), frameRate: 18 });
    a.create({ key: 'explode-g',     frames: a.generateFrameNumbers('explosion-g',     { start: 0, end: 6 }), frameRate: 20 });

    a.create({ key: 'pulse-fly', frames: a.generateFrameNumbers('pulse', { start: 0, end: 3 }), frameRate: 14, repeat: -1 });
    a.create({ key: 'bolt-fly',  frames: a.generateFrameNumbers('bolt',  { start: 0, end: 3 }), frameRate: 14, repeat: -1 });
    a.create({ key: 'hit-flash', frames: a.generateFrameNumbers('hit-spark', { start: 0, end: 2 }), frameRate: 24 });

    a.create({ key: 'boss-thrust-burn', frames: a.generateFrameNumbers('boss-thrust', { start: 0, end: 1 }),  frameRate: 14, repeat: -1 });
    a.create({ key: 'boss-bolt-fly',    frames: a.generateFrameNumbers('boss-bolt',   { start: 0, end: 1 }),  frameRate: 12, repeat: -1 });
    a.create({ key: 'boss-rays-fire',   frames: a.generateFrameNumbers('boss-rays',   { start: 0, end: 10 }), frameRate: 16 });

    this.scene.start('Title');
  }
}
