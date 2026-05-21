const BOLT_SPEED = 280;

export class BossBolt extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss-bolt');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(3);
    this.body.setSize(6, 6).setOffset(1, 1);
    this.play('boss-bolt-fly');
  }

  fire(x, y, angle) {
    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.setPosition(x, y);
    this.rotation = angle;
    this.setVelocity(Math.cos(angle) * BOLT_SPEED, Math.sin(angle) * BOLT_SPEED);
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
