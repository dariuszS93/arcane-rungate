import Phaser from 'phaser';

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

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        target?: Phaser.Physics.Arcade.Sprite,
        gameManager?: any,
        frame?: number
    ) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
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
        const worldBounds = this.scene.physics.world.bounds;

        this.resetDirectionAfterBerserk(isBerserk);
        this.handleWorldBounds(worldBounds);

        const distToPlayer = this.getDistanceToPlayer();

        if (isBerserk) {
            this.handleBerserkMode();
        } else if (distToPlayer <= this.detectionRange) {
            this.chasePlayer();
        } else {
            this.handlePatrol();
        }

        this.handleBlocked();
        this.anims.play('enemyWalk', true);
    }

    private resetDirectionAfterBerserk(isBerserk: boolean) {
        if (this.wasBerserk && !isBerserk) {
            this.setVelocity(0, 0);
            this.direction = Math.random() > 0.5 ? 'left' : 'right';
        }
        this.wasBerserk = isBerserk;
    }

    private getDistanceToPlayer(): number {
        if (!this.target) return Infinity;
        return Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    }

    private handleWorldBounds(bounds: Phaser.Geom.Rectangle) {
        if (this.x <= bounds.x + 10) {
            this.direction = 'right';
            this.setVelocityX(this.patrolSpeed);
        }
        if (this.x >= bounds.width - 10) {
            this.direction = 'left';
            this.setVelocityX(-this.patrolSpeed);
        }
        if (this.y <= bounds.y + 10) {
            this.setVelocityY(this.patrolSpeed);
        }
        if (this.y >= bounds.height - 10) {
            this.setVelocityY(-this.patrolSpeed);
        }
    }

    private handleBerserkMode() {
        if (!this.target) return;
        const { nx, ny } = this.getDirectionToPlayer();
        this.setVelocity(nx * this.chaseSpeed, ny * this.chaseSpeed);
        this.setFlipX(nx < 0);
    }

    private chasePlayer() {
        if (!this.target) return;
        this.chaseCooldown = 1200;
        const { nx, ny } = this.getDirectionToPlayer();
        this.setVelocity(nx * this.chaseSpeed, ny * this.chaseSpeed);
        this.setFlipX(nx < 0);
    }

    private handlePatrol() {
        if (this.chaseCooldown > 0) {
            this.chaseCooldown -= 16;
            return;
        }
        this.setVelocityY(0);

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

    private handleBlocked() {
        // @ts-ignore
        if (this.body?.blocked?.left) this.direction = 'right';
        // @ts-ignore
        if (this.body?.blocked?.right) this.direction = 'left';
        // @ts-ignore
        if (this.body?.blocked?.up) this.setVelocityY(this.patrolSpeed);
        // @ts-ignore
        if (this.body?.blocked?.down) this.setVelocityY(-this.patrolSpeed);
    }

    private getDirectionToPlayer() {
        const vx = (this.target?.x ?? 0) - this.x;
        const vy = (this.target?.y ?? 0) - this.y;
        const len = Math.hypot(vx, vy) || 1;
        return { nx: vx / len, ny: vy / len };
    }
}
