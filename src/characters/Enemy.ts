import Phaser from 'phaser';

// @ts-ignore
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    public minX: number;
    public maxX: number;
    private direction: 'left' | 'right';
    private readonly target?: Phaser.Physics.Arcade.Sprite;
    private gameManager?: any;
    private detectionRange = 120;
    private patrolSpeed = 40;
    private chaseSpeed = 60;
    private wasBerserk = false;
    private chaseCooldown = 0;

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

        if (this.wasBerserk && !isBerserk) {
            this.state = 'patrol';
            this.direction = Math.random() > 0.5 ? 'left' : 'right';
        }
        this.wasBerserk = isBerserk;

        const distToPlayer = this.target ? Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) : Infinity;

        const worldBounds = this.scene.physics.world.bounds;

        if (this.x <= worldBounds.x + 10) {
            this.direction = 'right';
            this.setVelocityX(this.patrolSpeed);
        }
        if (this.x >= worldBounds.width - 10) {
            this.direction = 'left';
            this.setVelocityX(-this.patrolSpeed);
        }
        if (this.y <= worldBounds.y + 10) {
            this.setVelocityY(this.patrolSpeed);
        }
        if (this.y >= worldBounds.height - 10) {
            this.setVelocityY(-this.patrolSpeed);
        }

        if (isBerserk) {
            this.wasBerserk = true;
            if (this.target) {
                const vx = this.target.x - this.x;
                const vy = this.target.y - this.y;
                const len = Math.hypot(vx, vy) || 1;
                const nx = vx / len;
                const ny = vy / len;
                this.setVelocity(nx * this.chaseSpeed, ny * this.chaseSpeed);
                this.setFlipX(nx < 0);
            }
            this.anims.play('enemyWalk', true);
            return
        }

        if (!isBerserk && this.wasBerserk) {
            this.wasBerserk = false;
            this.setVelocity(0);
            this.direction = Math.random() < 0.5 ? 'left' : 'right';
        }

        if (isBerserk || (distToPlayer <= this.detectionRange)) {
            this.state = 'chase';
            this.chaseCooldown = 1200;
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
            if (this.chaseCooldown > 0) {
                this.chaseCooldown -= 16;
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

        }

        // @ts-ignore
        if(this.body.blocked.left) this.direction = 'right';
        // @ts-ignore
        if(this.body.blocked.right) this.direction = 'left';
        // @ts-ignore
        if(this.body.blocked.up) this.setVelocity(this.patrolSpeed);
        // @ts-ignore
        if(this.body.blocked.down) this.setVelocity(-this.patrolSpeed);

        this.anims.play('enemyWalk', true);
    }
}
