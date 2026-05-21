import { Player } from '../entities/Player.js';
import { Projectile } from '../entities/Projectile.js';
import { Enemy, EnemyType } from '../entities/Enemy.js';
import { EnemyBolt } from '../entities/EnemyBolt.js';
import { Asteroid } from '../entities/Asteroid.js';
import { Boss } from '../entities/Boss.js';
import { BossBolt } from '../entities/BossBolt.js';
import { RayBeam } from '../entities/RayBeam.js';
import { ParallaxProp } from '../entities/ParallaxProp.js';

const BOSS_SCORE_THRESHOLD = 800;

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

    this.player = new Player(this, width / 2, height - 100);

    this.score = 0;
    this.startTime = this.time.now;
    this.gameOverTriggered = false;
    this.bossActive = false;
    this.bossSpawned = false;
    this.boss = null;
    this.rayBeam = null;

    this.physics.add.overlap(this.bullets, this.enemies, this._onBulletHitEnemy, null, this);
    this.physics.add.overlap(this.bullets, this.asteroids, this._onBulletHitAsteroid, null, this);
    this.physics.add.overlap(this.player, this.enemies, this._onPlayerHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.asteroids, this._onPlayerHitAsteroid, null, this);
    this.physics.add.overlap(this.player, this.enemyBolts, this._onPlayerHitBolt, null, this);
    this.physics.add.overlap(this.player, this.bossBolts, this._onPlayerHitBolt, null, this);

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
    this.events.emit('boss-hp-changed', 0, 0); // hidden

    this.input.keyboard.on('keydown-H', () => {
      if (this.gameOverTriggered) return;
      if (this.scene.isPaused()) return;
      this.scene.pause();
      this.scene.launch('Help', { returnTo: 'Game' });
    });
    this.input.keyboard.on('keydown-P', () => this._togglePause());
    this.input.keyboard.on('keydown-ESC', () => this._togglePause());

    this.events.once('shutdown', () => {
      this.scene.stop('HUD');
      this.scene.stop('Pause');
      this.scene.stop('Help');
    });

    // Seed two props so background isn't empty at start.
    this._spawnProp(true);
    this._spawnProp(true);
  }

  update(time, delta) {
    this.bg.tilePositionY -= 0.6 * (delta / 16.6);
    this.player.update(time, delta);
  }

  _togglePause() {
    if (this.gameOverTriggered) return;
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch('Pause');
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

  onPlayerGameOver() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this._spawnTimers.forEach(t => t.remove());
    this._asteroidTimer.remove();
    this._difficultyTimer.remove();
    this._propTimer.remove();
    this.time.delayedCall(900, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', { score: this.score });
    });
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

  _spawnBoss() {
    this.bossActive = true;
    this.bossSpawned = true;
    this.boss = new Boss(this, this.scale.width / 2, -120);

    this.physics.add.overlap(this.bullets, this.boss, this._onBulletHitBoss, null, this);
    this.physics.add.overlap(this.player, this.boss, this._onPlayerHitBoss, null, this);

    this.events.emit('boss-hp-changed', this.boss.hp, this.boss.maxHp);

    // Big announcement text.
    const txt = this.add.text(this.scale.width / 2, this.scale.height / 2, 'WARNING\nBOSS APPROACHING', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff5566', align: 'center',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: txt, alpha: 1, duration: 250, yoyo: true, hold: 900, onComplete: () => txt.destroy() });
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
    if (!this.bossSpawned && !this.gameOverTriggered && this.score >= BOSS_SCORE_THRESHOLD) {
      this._spawnBoss();
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
      asteroid.deactivate();
    }
  }

  _onBulletHitBoss(bullet, boss) {
    if (!bullet.active || !boss.alive) return;
    this._spawnHitSpark(bullet.x, bullet.y);
    bullet.deactivate();
    const killed = boss.hit(1);
    if (killed) {
      this._onBossDefeated(boss);
    }
  }

  _onBossDefeated(boss) {
    this._addScore(500);
    // Chain a few explosions for impact.
    this.cameras.main.shake(800, 0.02);
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 90, () => {
        if (!boss) return;
        const ox = Phaser.Math.Between(-70, 70);
        const oy = Phaser.Math.Between(-40, 40);
        this.spawnBigExplosion(boss.x + ox, boss.y + oy, Phaser.Math.FloatBetween(1.8, 2.6));
      });
    }
    this.time.delayedCall(900, () => {
      boss.destroy();
      this.boss = null;
      this.bossActive = false;
      this._endGameVictory();
    });
  }

  _endGameVictory() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this._spawnTimers.forEach(t => t.remove());
    this._asteroidTimer.remove();
    this._difficultyTimer.remove();
    this._propTimer.remove();
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
}
