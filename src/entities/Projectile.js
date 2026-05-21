const BULLET_SPEED = 560;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pulse');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(40, 16).setOffset(12, 8);
    this.play('pulse-fly');
  }

  fire(x, y, angle) {
    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.setPosition(x, y);
    this.rotation = angle;
    this.setVelocity(Math.cos(angle) * BULLET_SPEED, Math.sin(angle) * BULLET_SPEED);
  }

  deactivate() {
    this.setActive(false).setVisible(false);
    this.body.enable = false;
    this.body.stop();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    const m = 40;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    if (this.x < -m || this.x > w + m || this.y < -m || this.y > h + m) {
      this.deactivate();
    }
  }
}
