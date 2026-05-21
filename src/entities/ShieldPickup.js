const FALL_SPEED = 80;

export class ShieldPickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'shield', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(34, 34).setOffset(8, 6);
    this.setScale(1.1);
  }

  spawn(x, y) {
    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.setPosition(x, y);
    this.setFrame(0);
    this.setVelocity(0, FALL_SPEED);
    this.spawnAt = this.scene.time.now;

    if (this._pulse) this._pulse.stop();
    this.setAlpha(1);
    this._pulse = this.scene.tweens.add({
      targets: this, alpha: 0.55, duration: 500, yoyo: true, repeat: -1,
    });
  }

  deactivate() {
    this.setActive(false).setVisible(false);
    this.body.enable = false;
    this.body.stop();
    if (this._pulse) { this._pulse.stop(); this._pulse = null; }
    this.setAlpha(1);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.rotation += 0.8 * (delta / 1000);
    if (this.y > this.scene.scale.height + 40) {
      this.deactivate();
    }
  }
}
