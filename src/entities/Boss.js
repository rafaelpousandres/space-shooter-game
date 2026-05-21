const HOVER_Y = 140;
const ENTER_SPEED = 60;

export const BOSS_TIERS = [
  { hp:  50, fireMul: 1.00, tint: 0xffffff, name: 'RED LEADER' },
  { hp:  80, fireMul: 0.75, tint: 0x88ddff, name: 'ICE CRUSHER' },
  { hp: 120, fireMul: 0.55, tint: 0xffcc44, name: 'GOLD WARDEN' },
];

export class Boss extends Phaser.GameObjects.Container {
  constructor(scene, x, y, tier = 0) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const cfg = BOSS_TIERS[tier];
    this.tier = tier;
    this.fireMul = cfg.fireMul;

    this.thrust = scene.add.sprite(0, -68, 'boss-thrust').play('boss-thrust-burn').setRotation(Math.PI);
    this.body_ = scene.add.sprite(0, 0, 'boss-body', 0);
    this.cannonL = scene.add.image(-72, 8, 'boss-cannon-left');
    this.cannonR = scene.add.image(72, 8, 'boss-cannon-right');
    this.body_.setTint(cfg.tint);
    this.cannonL.setTint(cfg.tint);
    this.cannonR.setTint(cfg.tint);
    this.add([this.thrust, this.body_, this.cannonL, this.cannonR]);

    this.body.setSize(160, 110).setOffset(-80, -55);

    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.state = 'enter';
    this.stateEnterTime = scene.time.now;
    this.nextActionAt = 0;
    this.driftSeed = Math.random() * 1000;
    this.alive = true;
    this.spawnX = x;
    this.normalTint = cfg.tint;
  }

  hit(damage = 1) {
    if (!this.alive) return false;
    this.hp -= damage;
    this.scene.cameras.main.shake(80, 0.004);
    this.body_.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.alive) this.body_.setTint(this.normalTint);
    });

    const ratio = this.hp / this.maxHp;
    let frame = 0;
    if (ratio < 0.2) frame = 4;
    else if (ratio < 0.4) frame = 3;
    else if (ratio < 0.6) frame = 2;
    else if (ratio < 0.8) frame = 1;
    this.body_.setFrame(frame);

    this.scene.events.emit('boss-hp-changed', Math.max(0, this.hp), this.maxHp);

    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  cannonLWorld() { return { x: this.x + this.cannonL.x, y: this.y + this.cannonL.y }; }
  cannonRWorld() { return { x: this.x + this.cannonR.x, y: this.y + this.cannonR.y }; }

  preUpdate(time, delta) {
    if (!this.alive) return;

    if (this.state === 'enter') {
      this.y += ENTER_SPEED * (delta / 1000);
      if (this.y >= HOVER_Y) {
        this.y = HOVER_Y;
        this.state = 'attack-a';
        this.stateEnterTime = time;
        this.nextActionAt = time + 600;
      }
      return;
    }

    const t = (time - this.stateEnterTime) / 1000;
    this.x = this.spawnX + Math.sin((t + this.driftSeed) * 0.6) * 120;

    if (time < this.nextActionAt) return;

    switch (this.state) {
      case 'attack-a': this._attackSpread(time); break;
      case 'attack-b': this._attackAimed(time); break;
      case 'attack-c': this._attackRays(time); break;
    }
  }

  _attackSpread(time) {
    const fanCount = 5;
    const spreadDeg = 60;
    const half = Phaser.Math.DegToRad(spreadDeg / 2);
    const step = Phaser.Math.DegToRad(spreadDeg) / (fanCount - 1);

    for (const cannon of [this.cannonLWorld(), this.cannonRWorld()]) {
      for (let i = 0; i < fanCount; i++) {
        const angle = Math.PI / 2 - half + step * i;
        this.scene.fireBossBolt(cannon.x, cannon.y, angle);
      }
    }
    this._shotsInPhase = (this._shotsInPhase || 0) + 1;
    if (this._shotsInPhase >= 3) {
      this._shotsInPhase = 0;
      this.state = 'attack-b';
      this.stateEnterTime = time;
      this.nextActionAt = time + 600 * this.fireMul;
    } else {
      this.nextActionAt = time + 900 * this.fireMul;
    }
  }

  _attackAimed(time) {
    const target = this.scene.player;
    if (target && target.active) {
      for (const cannon of [this.cannonLWorld(), this.cannonRWorld()]) {
        const angle = Math.atan2(target.y - cannon.y, target.x - cannon.x);
        this.scene.fireBossBolt(cannon.x, cannon.y, angle);
      }
    }
    this._shotsInPhase = (this._shotsInPhase || 0) + 1;
    if (this._shotsInPhase >= 6) {
      this._shotsInPhase = 0;
      this.state = 'attack-c';
      this.stateEnterTime = time;
      this.nextActionAt = time + 800 * this.fireMul;
    } else {
      this.nextActionAt = time + 320 * this.fireMul;
    }
  }

  _attackRays(time) {
    this.scene.fireBossRay(this.x, this.y + 50);
    this.state = 'attack-a';
    this.stateEnterTime = time;
    this.nextActionAt = time + 2200 * this.fireMul;
  }
}
