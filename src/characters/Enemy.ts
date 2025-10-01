import Phaser from 'phaser';

// @ts-ignore
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    public minX: number;
    public maxX: number;
    private direction: 'left' | 'right';
    private readonly target?: Phaser.Physics.Arcade.Sprite;
    private gameManager?: any;
    private detectionRange = 160;
    private patrolSpeed = 40;
    private chaseSpeed = 60;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, target?: Phaser.Physics.Arcade.Sprite, gameManager?: any, frame?: number) {
        super(scene, x, y, texture, frame);

        // @ts-ignore
        scene.add.existing(this);
        // @ts-ignore
        scene.physics.add.existing(this);

        this.setScale(0.5);
        this.setCollideWorldBounds(true);

        this.minX = x - 100;
        this.maxX = x + 100;
        this.direction = 'left';

        this.target = target;
        this.gameManager = gameManager;
    }

    public update(): void {
        const isBerserk = !!this.gameManager?.isBerserk;

        const distToPlayer = this.target ? Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) : Infinity;

        if (isBerserk || (distToPlayer <= this.detectionRange)) {
            this.state = 'chase';
            if (this.target) {
                const vx = this.target.x - this.x;
                const vy = this.target.y - this.y;
                const len = Math.hypot(vx, vy) || 1;
                const nx = vx / len;
                const ny = vy / len;
                this.setVelocity(nx * this.chaseSpeed, ny * this.chaseSpeed);
                this.setFlipX(nx < 0);
            }
        } else {
            this.state = 'patrol';
            if (this.direction === 'left') {
                this.setVelocityX(-this.patrolSpeed);
                this.setFlipX(true);
                if (this.x <= this.minX) this.direction = 'right';
            } else {
                this.setVelocityX(this.patrolSpeed);
                this.setFlipX(false);
                if (this.x >= this.maxX) this.direction = 'left';
            }
        }

        this.anims.play('enemyWalk', true);
    }
}
