const BOLT_SPEED = 320;

export class EnemyBolt extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bolt');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(32, 16).setOffset(8, 8);
    this.play('bolt-fly');
  }

  fire(x, y, target) {
    const angle = Math.atan2(target.y - y, target.x - x);
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
