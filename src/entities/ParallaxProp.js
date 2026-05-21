const TEXTURES = ['prop-planet', 'prop-eclipse-1', 'prop-eclipse-2'];

export class ParallaxProp extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'prop-planet');
    scene.add.existing(this);
    this.setDepth(-10);
  }

  spawn() {
    const t = Phaser.Utils.Array.GetRandom(TEXTURES);
    this.setTexture(t);
    const scale = Phaser.Math.FloatBetween(0.9, 2.2);
    this.setScale(scale);
    this.setAlpha(Phaser.Math.FloatBetween(0.35, 0.75));
    this.x = Phaser.Math.Between(40, this.scene.scale.width - 40);
    this.y = -this.displayHeight;
    this.fallSpeed = Phaser.Math.Between(15, 35);
    this.setActive(true).setVisible(true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.y += this.fallSpeed * (delta / 1000);
    if (this.y - this.displayHeight > this.scene.scale.height) {
      this.setActive(false).setVisible(false);
    }
  }
}
