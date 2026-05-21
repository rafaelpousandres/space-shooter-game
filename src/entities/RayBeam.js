// Telegraphed beam from below the boss. The first few frames are wind-up
// (no damage); later frames are the active beam that hurts the player.
const ACTIVE_FRAME = 4; // damage starts when anim reaches this frame index

export class RayBeam extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.sprite = scene.add.sprite(0, 0, 'boss-rays').setOrigin(0.5, 0);
    this.add(this.sprite);

    this.body.setSize(40, 220).setOffset(-20, 0);
    this.body.enable = false;
  }

  fire(x, y) {
    this.setActive(true).setVisible(true);
    this.setPosition(x, y);
    this.body.enable = false; // no damage during wind-up
    this.sprite.play('boss-rays-fire');
    this.sprite.once('animationcomplete', () => this.deactivate());
    this.sprite.on('animationupdate', (anim, frame) => {
      if (frame.index >= ACTIVE_FRAME) {
        this.body.enable = true;
      }
    });
  }

  deactivate() {
    this.setActive(false).setVisible(false);
    this.body.enable = false;
    this.sprite.off('animationupdate');
  }
}
