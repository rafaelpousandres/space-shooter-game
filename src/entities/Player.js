const MOVE_SPEED = 240;
const FIRE_COOLDOWN_MS = 140;
const MAX_HP = 3;
const HIT_INVULN_MS = 700;
const RESPAWN_INVULN_MS = 1600;

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.thrust = scene.add.sprite(0, 18, 'player-thrust').play('thrust-burn');
    this.thrust.setVisible(false);
    this.ship = scene.add.sprite(0, 0, 'player-ship').play('player-idle');
    this.add([this.thrust, this.ship]);

    this.body.setSize(28, 28).setOffset(-14, -14);
    this.body.setCollideWorldBounds(true);

    this.keys = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      upArrow: 'UP', downArrow: 'DOWN', leftArrow: 'LEFT', rightArrow: 'RIGHT',
    });
    this.pointer = scene.input.activePointer;

    this.nextFireAt = 0;
    this.hp = MAX_HP;
    this.lives = 3;
    this.invulnUntil = scene.time.now + RESPAWN_INVULN_MS;
    this._blinkTween = scene.tweens.add({
      targets: [this.ship, this.thrust],
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: -1,
    });
    this._updateBlink();
  }

  get isInvulnerable() {
    return this.scene.time.now < this.invulnUntil;
  }

  _updateBlink() {
    if (this.isInvulnerable) {
      if (this._blinkTween.paused) this._blinkTween.resume();
    } else {
      if (!this._blinkTween.paused) {
        this._blinkTween.pause();
        this.ship.setAlpha(1);
        this.thrust.setAlpha(1);
      }
    }
  }

  takeDamage(amount = 1) {
    if (this.isInvulnerable || !this.active) return false;
    this.hp -= amount;
    this.scene.events.emit('hp-changed', Math.max(0, this.hp));
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    this.invulnUntil = this.scene.time.now + HIT_INVULN_MS;
    this._updateBlink();
    return true;
  }

  die() {
    this.lives -= 1;
    this.scene.events.emit('lives-changed', this.lives);
    this.scene.spawnBigExplosion(this.x, this.y);

    if (this.lives <= 0) {
      this.setActive(false).setVisible(false);
      this.body.enable = false;
      this.scene.onPlayerGameOver();
      return;
    }

    this.respawn();
  }

  respawn() {
    this.hp = MAX_HP;
    this.scene.events.emit('hp-changed', this.hp);
    this.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 100);
    this.invulnUntil = this.scene.time.now + RESPAWN_INVULN_MS;
    this._updateBlink();
  }

  update(time) {
    if (!this.active) return;
    this._updateBlink();

    const k = this.keys;
    const left = k.left.isDown || k.leftArrow.isDown;
    const right = k.right.isDown || k.rightArrow.isDown;
    const up = k.up.isDown || k.upArrow.isDown;
    const down = k.down.isDown || k.downArrow.isDown;

    let vx = (right ? 1 : 0) - (left ? 1 : 0);
    let vy = (down ? 1 : 0) - (up ? 1 : 0);
    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv; vy *= inv;
    }
    this.body.setVelocity(vx * MOVE_SPEED, vy * MOVE_SPEED);
    this.thrust.setVisible(vx !== 0 || vy !== 0);

    const aimX = this.pointer.worldX;
    const aimY = this.pointer.worldY;
    const angle = Math.atan2(aimY - this.y, aimX - this.x);
    this.ship.rotation = angle + Math.PI / 2;
    this.thrust.rotation = this.ship.rotation;
    const back = 22;
    this.thrust.x = -Math.cos(angle) * back;
    this.thrust.y = -Math.sin(angle) * back;

    if (this.pointer.isDown && time >= this.nextFireAt) {
      this.scene.fireBullet(this.x, this.y, angle);
      this.nextFireAt = time + FIRE_COOLDOWN_MS;
    }
  }
}
