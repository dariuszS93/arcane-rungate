import Phaser from 'phaser';

export class GameManager {
    private scene: Phaser.Scene;
    public score = 0;
    public lives = 5;
    public isStarted = false;
    private isPlayerInvulnerable = false;
    public isBerserk = false;

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

        this.lives -= 1;
        this.scene.events.emit('livesChanged', this.lives);

        const player = playerObj as Phaser.Physics.Arcade.Sprite;
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;

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

        if(this.lives <= 0) {
            this.scene.events.emit('gameOver');
        }
    }

    triggerBerserk() {
        if (this.isBerserk) return;
        this.isBerserk = true;
        this.scene.events.emit('berserkStarted');
        this.scene.events.emit('message', 'Enemies are enraged!');
    }
}
