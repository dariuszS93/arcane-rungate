import Phaser from 'phaser';
import type Player from "../characters/Player";

export class GameManager {
    private scene: Phaser.Scene;
    public score = 0;
    public isStarted = false;
    private isPlayerInvulnerable = false;
    public isBerserk = false;
    private damagePerHit = 20;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    startGame() {
        this.isStarted = true;
    }

    collectCoin = (_playerObj: Phaser.GameObjects.GameObject, coinObj: Phaser.GameObjects.GameObject)=> {
        const coin = coinObj as Phaser.Physics.Arcade.Image;
        coin.disableBody(true, true);
        this.score += 10;
        this.scene.events.emit('scoreChanged', this.score);
    }

    hitEnemy = (playerObj: Phaser.GameObjects.GameObject, enemyObj: Phaser.GameObjects.GameObject)=> {
        if (!this.isStarted || this.isPlayerInvulnerable) return;

        const player = playerObj as Player;
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;

        player.takeDamage(this.damagePerHit);
        this.scene.events.emit('playerHpChanged', { hp: player.hp, maxHp: player.maxHp });

        if (player && enemy && player.body) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const angle = Math.atan2(dy, dx);
            const force = 300;
            player.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
        }

        this.isPlayerInvulnerable = true;
        player.setTint(0xff0000);

        this.scene.time.delayedCall(2000, () => {
            this.isPlayerInvulnerable = false;
            player.clearTint();
        });

        if(player.hp <= 0) {
            this.scene.events.emit('gameOver');
            this.pauseGame();
        }
    }

    triggerBerserk() {
        if (this.isBerserk) return;
        this.isBerserk = true;
        this.scene.events.emit('berserkStarted');
        this.scene.events.emit('message', 'Enemies are enraged!');

        this.scene.time.delayedCall(12000, () => {
            this.endBerserk();
        })
    }

    endBerserk() {
        this.isBerserk = false;
        this.scene.events.emit('berserkEnded');
    }

    pauseGame() {
        this.scene.physics.pause();
        this.scene.anims.pauseAll();
    }
}
