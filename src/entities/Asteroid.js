const SIZES = {
  small:  { scale: 1.8, hp: 1, score:  5, speed: [80, 130] },
  medium: { scale: 2.4, hp: 2, score: 15, speed: [60, 100] },
  large:  { scale: 3.0, hp: 4, score: 30, speed: [40,  80] },
};

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'asteroid-1');
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  spawn(x, y) {
    const variant = Phaser.Math.Between(1, 5);
    const sizes = ['small', 'small', 'medium', 'medium', 'large'];
    const sizeKey = sizes[Phaser.Math.Between(0, sizes.length - 1)];
    const cfg = SIZES[sizeKey];

    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.setTexture(`asteroid-${variant}`);
    this.setScale(cfg.scale);
    this.setPosition(x, y);
    this.body.setCircle(this.width / 2);
    this.body.setOffset(0, 0);

    this.hp = cfg.hp;
    this.scoreValue = cfg.score;
    this.rotationSpeed = Phaser.Math.FloatBetween(-1.2, 1.2);
    const speed = Phaser.Math.Between(cfg.speed[0], cfg.speed[1]);
    this.setVelocity(Phaser.Math.FloatBetween(-30, 30), speed);
    this.clearTint();
  }

  hit(damage = 1) {
    this.hp -= damage;
    if (this.hp <= 0) return true;
    this.setTintFill(0xffaa88);
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
    this.rotation += this.rotationSpeed * (delta / 1000);
    if (this.y > this.scene.scale.height + 80 || this.x < -80 || this.x > this.scene.scale.width + 80) {
      this.deactivate();
    }
  }
}
