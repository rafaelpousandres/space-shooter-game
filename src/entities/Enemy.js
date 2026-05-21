export const EnemyType = Object.freeze({
  DRIFTER: 'drifter',  // enemy-01: straight down
  TANK:    'tank',     // enemy-02: slow, more HP, shoots
  FAST:    'fast',     // enemy-03: fast sine-wave, contact damage
});

const CONFIG = {
  drifter: { texture: 'enemy-01', anim: 'enemy-01-idle', hp: 1, speed: 130, score: 10 },
  tank:    { texture: 'enemy-02', anim: 'enemy-02-idle', hp: 3, speed:  80, score: 30, fireCooldownMs: 1800 },
  fast:    { texture: 'enemy-03', anim: 'enemy-03-idle', hp: 1, speed: 200, score: 20 },
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy-01');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(36, 36).setOffset(6, 6);
  }

  spawn(x, y, type) {
    const cfg = CONFIG[type];
    this.enemyType = type;
    this.hp = cfg.hp;
    this.scoreValue = cfg.score;
    this.fireCooldownMs = cfg.fireCooldownMs || 0;
    this.nextFireAt = 0;
    this.spawnTime = this.scene.time.now;
    this.startX = x;

    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.setPosition(x, y);
    this.setTexture(cfg.texture);
    this.play(cfg.anim);
    this.setVelocity(0, cfg.speed);
    this.clearTint();
  }

  hit(damage = 1) {
    this.hp -= damage;
    if (this.hp <= 0) return true;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => { if (this.active) this.clearTint(); });
    return false;
  }

  deactivate() {
    this.setActive(false).setVisible(false);
    this.body.enable = false;
    this.body.stop();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.enemyType === EnemyType.FAST) {
      // Sine-wave horizontal weave around starting X.
      const t = (time - this.spawnTime) / 1000;
      const offset = Math.sin(t * 3.5) * 80;
      this.x = this.startX + offset;
    }

    if (this.enemyType === EnemyType.TANK && time >= this.nextFireAt) {
      this.nextFireAt = time + this.fireCooldownMs;
      this.scene.fireEnemyBolt(this.x, this.y, this.scene.player);
    }

    if (this.y > this.scene.scale.height + 60) {
      this.deactivate();
    }
  }
}
