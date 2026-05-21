import { Player } from '../entities/Player.js';
import { Projectile } from '../entities/Projectile.js';
import { Enemy, EnemyType } from '../entities/Enemy.js';
import { EnemyBolt } from '../entities/EnemyBolt.js';
import { Asteroid } from '../entities/Asteroid.js';
import { Boss, BOSS_TIERS } from '../entities/Boss.js';
import { BossBolt } from '../entities/BossBolt.js';
import { RayBeam } from '../entities/RayBeam.js';
import { ParallaxProp } from '../entities/ParallaxProp.js';
import { ShieldPickup } from '../entities/ShieldPickup.js';

const BOSS_THRESHOLDS = [800, 2000, 4000];
const SHIELD_DROP_CHANCE = 0.15;
const ASTEROID_SHIELD_DROP = 0.30;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const { width, height } = this.scale;

    this.bg = this.add.tileSprite(0, 0, width, height, 'bg-stars').setOrigin(0, 0).setDepth(-20);

    this.props = this.add.group({ classType: ParallaxProp, runChildUpdate: true, maxSize: 6 });

    this.bullets = this.physics.add.group({ classType: Projectile, runChildUpdate: true, maxSize: 96 });
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true, maxSize: 48 });
    this.enemyBolts = this.physics.add.group({ classType: EnemyBolt, runChildUpdate: true, maxSize: 64 });
    this.asteroids = this.physics.add.group({ classType: Asteroid, runChildUpdate: true, maxSize: 24 });
    this.bossBolts = this.physics.add.group({ classType: BossBolt, runChildUpdate: true, maxSize: 64 });
    this.pickups = this.physics.add.group({ classType: ShieldPickup, runChildUpdate: true, maxSize: 12 });

    this.player = new Player(this, width / 2, height - 100);

    this.score = 0;
    this.startTime = this.time.now;
    this.gameOverTriggered = false;
    this.bossActive = false;
    this.bossesDefeated = 0;
    this.boss = null;
    this.rayBeam = null;

    this.physics.add.overlap(this.bullets, this.enemies, this._onBulletHitEnemy, null, this);
    this.physics.add.overlap(this.bullets, this.asteroids, this._onBulletHitAsteroid, null, this);
    this.physics.add.overlap(this.player, this.enemies, this._onPlayerHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.asteroids, this._onPlayerHitAsteroid, null, this);
    this.physics.add.overlap(this.player, this.enemyBolts, this._onPlayerHitBolt, null, this);
    this.physics.add.overlap(this.player, this.bossBolts, this._onPlayerHitBolt, null, this);
    this.physics.add.overlap(this.player, this.pickups, this._onPlayerHitPickup, null, this);

    this._spawnTimers = [
      this.time.addEvent({ delay: 850,  loop: true, callback: () => this._spawn(EnemyType.DRIFTER) }),
      this.time.addEvent({ delay: 2600, loop: true, callback: () => this._spawn(EnemyType.TANK) }),
      this.time.addEvent({ delay: 1800, loop: true, callback: () => this._spawn(EnemyType.FAST) }),
    ];
    this._asteroidTimer = this.time.addEvent({ delay: 1500, loop: true, callback: () => this._spawnAsteroid() });
    this._propTimer = this.time.addEvent({ delay: 3500, loop: true, callback: () => this._spawnProp() });
    this._difficultyTimer = this.time.addEvent({
      delay: 8000, loop: true, callback: () => this._rampDifficulty(),
    });

    this.scene.launch('HUD', { gameScene: this });
    this.events.emit('score-changed', 0);
    this.events.emit('hp-changed', this.player.hp);
    this.events.emit('lives-changed', this.player.lives);
    this.events.emit('shield-changed', 0, 3);
    this.events.emit('boss-hp-changed', 0, 0);

    this.input.keyboard.on('keydown-H', () => this.requestHelp());
    this.input.keyboard.on('keydown-P', () => this.requestPause());
    this.input.keyboard.on('keydown-ESC', () => this.requestPause());

    this.events.once('shutdown', () => {
      this.scene.stop('HUD');
      this.scene.stop('Pause');
      this.scene.stop('Help');
    });

    this._spawnProp(true);
    this._spawnProp(true);
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.6 * (delta / 16.6);
    this.player.update(time, delta);
  }

  requestPause() {
    if (this.gameOverTriggered) return;
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.pause('HUD');
    this.scene.launch('Pause');
  }

  requestHelp() {
    if (this.gameOverTriggered) return;
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.pause('HUD');
    this.scene.launch('Help', { returnTo: 'Game' });
  }

  requestFullscreen() {
    if (!this.scale.fullscreen.available) return;
    if (this.scale.isFullscreen) this.scale.stopFullscreen();
    else this.scale.startFullscreen();
  }

  fireBullet(x, y, angle) {
    const bullet = this.bullets.get(x, y);
    if (!bullet) return;
    bullet.fire(x, y, angle);
  }

  fireEnemyBolt(x, y, target) {
    const bolt = this.enemyBolts.get(x, y);
    if (!bolt) return;
    bolt.fire(x, y, target);
  }

  fireBossBolt(x, y, angle) {
    const bolt = this.bossBolts.get(x, y);
    if (!bolt) return;
    bolt.fire(x, y, angle);
  }

  fireBossRay(x, y) {
    if (!this.rayBeam) {
      this.rayBeam = new RayBeam(this, x, y);
      this.physics.add.overlap(this.player, this.rayBeam, this._onPlayerHitRay, null, this);
    }
    this.rayBeam.fire(x, y);
  }

  spawnBigExplosion(x, y, scale = 2) {
    const boom = this.add.sprite(x, y, 'explosion-g').setScale(scale).play('explode-g');
    boom.once('animationcomplete', () => boom.destroy());
  }

  _maybeDropShield(x, y, chance) {
    if (Math.random() > chance) return;
    const p = this.pickups.get(x, y);
    if (!p) return;
    p.spawn(x, y);
  }

  onPlayerGameOver() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this._stopAllTimers();
    this.time.delayedCall(900, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', { score: this.score });
    });
  }

  _stopAllTimers() {
    this._spawnTimers.forEach(t => t.remove());
    this._asteroidTimer.remove();
    this._difficultyTimer.remove();
    this._propTimer.remove();
  }

  _spawn(type) {
    if (this.gameOverTriggered || this.bossActive) return;
    const enemy = this.enemies.get(0, 0);
    if (!enemy) return;
    const x = Phaser.Math.Between(40, this.scale.width - 40);
    enemy.spawn(x, -40, type);
  }

  _spawnAsteroid() {
    if (this.gameOverTriggered || this.bossActive) return;
    const a = this.asteroids.get(0, 0);
    if (!a) return;
    const x = Phaser.Math.Between(20, this.scale.width - 20);
    a.spawn(x, -60);
  }

  _spawnProp(seed = false) {
    if (this.gameOverTriggered) return;
    const p = this.props.get(0, 0);
    if (!p) return;
    p.spawn();
    if (seed) {
      p.y = Phaser.Math.Between(-p.displayHeight, this.scale.height - p.displayHeight);
    }
  }

  _rampDifficulty() {
    if (this.bossActive) return;
    this._spawnTimers[0].delay = Math.max(280, this._spawnTimers[0].delay - 80);
    this._spawnTimers[1].delay = Math.max(1400, this._spawnTimers[1].delay - 150);
    this._spawnTimers[2].delay = Math.max(700, this._spawnTimers[2].delay - 120);
    this._asteroidTimer.delay = Math.max(700, this._asteroidTimer.delay - 80);
  }

  _spawnBoss(tier) {
    this.bossActive = true;
    this.boss = new Boss(this, this.scale.width / 2, -120, tier);
    this.physics.add.overlap(this.bullets, this.boss, this._onBulletHitBoss, null, this);
    this.physics.add.overlap(this.player, this.boss, this._onPlayerHitBoss, null, this);

    this.events.emit('boss-hp-changed', this.boss.hp, this.boss.maxHp);

    const cfg = BOSS_TIERS[tier];
    const num = tier + 1;
    const txt = this.add.text(this.scale.width / 2, this.scale.height / 2,
      `WARNING\nBOSS ${num} / ${BOSS_THRESHOLDS.length}\n${cfg.name}`, {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff5566', align: 'center',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: txt, alpha: 1, duration: 250, yoyo: true, hold: 1100,
      onComplete: () => txt.destroy(),
    });
    this.cameras.main.shake(300, 0.004);
  }

  _spawnHitSpark(x, y) {
    const spark = this.add.sprite(x, y, 'hit-spark').play('hit-flash');
    spark.once('animationcomplete', () => spark.destroy());
  }

  _spawnEnemyExplosion(x, y) {
    const boom = this.add.sprite(x, y, 'enemy-explosion').play('enemy-explode');
    boom.once('animationcomplete', () => boom.destroy());
  }

  _scorePopup(x, y, amount) {
    const txt = this.add.text(x, y, `+${amount}`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffd060',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: txt, y: y - 26, alpha: 0, duration: 600, ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  _addScore(amount, x, y) {
    this.score += amount;
    this.events.emit('score-changed', this.score);
    if (x !== undefined) this._scorePopup(x, y, amount);
    this._maybeTriggerBoss();
  }

  _maybeTriggerBoss() {
    if (this.gameOverTriggered || this.bossActive) return;
    const next = this.bossesDefeated;
    if (next >= BOSS_THRESHOLDS.length) return;
    if (this.score >= BOSS_THRESHOLDS[next]) {
      this._spawnBoss(next);
    }
  }

  _onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    this._spawnHitSpark(bullet.x, bullet.y);
    bullet.deactivate();
    const killed = enemy.hit(1);
    if (killed) {
      this._spawnEnemyExplosion(enemy.x, enemy.y);
      this._addScore(enemy.scoreValue, enemy.x, enemy.y);
      this._maybeDropShield(enemy.x, enemy.y, SHIELD_DROP_CHANCE);
      enemy.deactivate();
    }
  }

  _onBulletHitAsteroid(bullet, asteroid) {
    if (!bullet.active || !asteroid.active) return;
    this._spawnHitSpark(bullet.x, bullet.y);
    bullet.deactivate();
    const killed = asteroid.hit(1);
    if (killed) {
      this.spawnBigExplosion(asteroid.x, asteroid.y);
      this._addScore(asteroid.scoreValue, asteroid.x, asteroid.y);
      // Larger asteroids drop shields more often.
      const chance = asteroid.scoreValue >= 30 ? ASTEROID_SHIELD_DROP : ASTEROID_SHIELD_DROP * 0.5;
      this._maybeDropShield(asteroid.x, asteroid.y, chance);
      asteroid.deactivate();
    }
  }

  _onBulletHitBoss(bullet, boss) {
    if (!bullet.active || !boss.alive) return;
    this._spawnHitSpark(bullet.x, bullet.y);
    bullet.deactivate();
    const killed = boss.hit(1);
    if (killed) this._onBossDefeated(boss);
  }

  _onBossDefeated(boss) {
    this._addScore(500);
    this.cameras.main.shake(800, 0.02);
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 90, () => {
        if (!boss) return;
        const ox = Phaser.Math.Between(-70, 70);
        const oy = Phaser.Math.Between(-40, 40);
        this.spawnBigExplosion(boss.x + ox, boss.y + oy, Phaser.Math.FloatBetween(1.8, 2.6));
      });
    }
    // Guaranteed shield drop on boss kill.
    this._maybeDropShield(boss.x, boss.y, 1.0);

    this.time.delayedCall(900, () => {
      boss.destroy();
      this.boss = null;
      this.bossActive = false;
      this.bossesDefeated += 1;
      this.events.emit('boss-hp-changed', 0, 0);

      if (this.bossesDefeated >= BOSS_THRESHOLDS.length) {
        this._endGameVictory();
      } else {
        this._postBossRespite();
      }
    });
  }

  _postBossRespite() {
    // Brief breather, then regular spawning automatically resumes (bossActive flag cleared).
    const respiteMs = 1800;
    const banner = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
      'SECTOR CLEAR', {
        fontFamily: 'monospace', fontSize: '22px', color: '#88ffcc',
      }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: banner, alpha: 1, duration: 250, yoyo: true, hold: respiteMs - 500,
      onComplete: () => banner.destroy(),
    });
    // Re-evaluate boss threshold in case score is already past the next one.
    this.time.delayedCall(respiteMs, () => this._maybeTriggerBoss());
  }

  _endGameVictory() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this._stopAllTimers();
    this.time.delayedCall(800, () => {
      this.scene.stop('HUD');
      this.scene.start('Victory', { score: this.score });
    });
  }

  _onPlayerHitEnemy(player, enemy) {
    if (!enemy.active || !player.active) return;
    const tookDamage = player.takeDamage(1);
    if (tookDamage) {
      this._spawnEnemyExplosion(enemy.x, enemy.y);
      enemy.deactivate();
    }
  }

  _onPlayerHitAsteroid(player, asteroid) {
    if (!asteroid.active || !player.active) return;
    const tookDamage = player.takeDamage(1);
    if (tookDamage) {
      this.spawnBigExplosion(asteroid.x, asteroid.y);
      asteroid.deactivate();
    }
  }

  _onPlayerHitBolt(player, bolt) {
    if (!bolt.active || !player.active) return;
    if (player.takeDamage(1)) {
      this._spawnHitSpark(bolt.x, bolt.y);
    }
    bolt.deactivate();
  }

  _onPlayerHitBoss(player, boss) {
    if (!boss.alive || !player.active) return;
    player.takeDamage(1);
  }

  _onPlayerHitRay(player, ray) {
    if (!ray.active || !player.active) return;
    player.takeDamage(1);
  }

  _onPlayerHitPickup(player, pickup) {
    if (!pickup.active || !player.active) return;
    pickup.deactivate();
    this.player.addShield();
    // Visual confirmation: brief sparkle at pickup point.
    this._spawnHitSpark(pickup.x, pickup.y);
  }
}
