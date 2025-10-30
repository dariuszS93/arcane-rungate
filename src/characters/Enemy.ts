import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    hp: number;
    maxHp: number;
    healthBar: Phaser.GameObjects.Graphics;
    public minX: number;
    public maxX: number;
    public minY: number;
    public maxY: number;
    private direction: 'left' | 'right' | 'up' | 'down';
    private readonly target?: Phaser.Physics.Arcade.Sprite;
    private gameManager?: any;
    private detectionRange = 120;
    private patrolSpeed = 40;
    private chaseSpeed = 60;
    private wasBerserk = false;
    private chaseCooldown = 0;
    private patrolChangeTimer = 0;

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
        // @ts-ignore
        this.body.setSize(30, 60).setOffset(25, 40);
        this.setCollideWorldBounds(true);

        this.minX = x - 100;
        this.maxX = x + 100;
        this.minY = y - 100;
        this.maxY = y + 100;

        const dirs: Array<typeof this.direction> = ['left', 'right', 'up', 'down'];
        this.direction = Phaser.Utils.Array.GetRandom(dirs);

        this.target = target;
        this.gameManager = gameManager;

        this.hp = 50;
        this.maxHp = 50;
        this.healthBar = scene.add.graphics();

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.healthBar.destroy();
        });
    }

    public update(_time: number, delta?: number): void {
        this.updateHealthBar();
        const dt = delta ?? 16;
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
            this.handlePatrol(dt);
        }

        this.handleBlocked();
        this.anims.play('enemyWalk', true);
    }

    takeDamage(amount: number) {
        this.hp = Math.max(this.hp - amount, 0);
    }

    applyKnockback(fromX: number, fromY: number, force: number) {
        const dx = this.x - fromX;
        const dy = this.y - fromY;
        const angle = Math.atan2(dy, dx);
        this.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
        this.scene.time.delayedCall(120, () => {
            if (this.active) this.setVelocity(0);
        })
    }

    updateHealthBar() {
        this.healthBar.clear();
        const barWidth = 40;
        const barHeight = 5;
        const x = this.x - barWidth / 2;
        const y = this.y - 40;

        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

        const healthPercent = this.hp / this.maxHp;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    }

    private resetDirectionAfterBerserk(isBerserk: boolean) {
        if (this.wasBerserk && !isBerserk) {
            this.setVelocity(0, 0);
            const dirs: Array<typeof this.direction> = ['left', 'right', 'up', 'down'];
            this.direction = Phaser.Utils.Array.GetRandom(dirs);
            this.patrolChangeTimer = 0;
        }
        this.wasBerserk = isBerserk;
    }

    private getDistanceToPlayer(): number {
        if (!this.target) return Infinity;
        return Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    }

    private handleWorldBounds(bounds: Phaser.Geom.Rectangle) {
        if (this.x <= bounds.x + 10) {
            if (this.direction === 'left') this.direction = 'right';
            this.setVelocityX(this.patrolSpeed);
        }
        if (this.x >= bounds.width - 10) {
            if (this.direction === 'right') this.direction = 'left';
            this.setVelocityX(-this.patrolSpeed);
        }
        if (this.y <= bounds.y + 10) {
            if (this.direction === 'up') this.direction = 'down';
            this.setVelocityY(this.patrolSpeed);
        }
        if (this.y >= bounds.height - 10) {
            if (this.direction === 'down') this.direction = 'up';
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

    private handlePatrol(dt: number) {
        if (this.chaseCooldown > 0) {
            this.chaseCooldown -= dt;
            return;
        }

        this.patrolChangeTimer -= dt;
        if (this.patrolChangeTimer <= 0) {
            this.pickNewDirection();
            this.patrolChangeTimer = Phaser.Math.Between(1200, 1800);
        }

        switch (this.direction) {
            case 'left':
                this.setVelocity(-this.patrolSpeed, 0);
                this.setFlipX(true);
                if (this.x <= this.minX) this.direction = 'right';
                break;
            case 'right':
                this.setVelocity(this.patrolSpeed, 0);
                this.setFlipX(false);
                if (this.x >= this.maxX) this.direction = 'left';
                break;
            case 'up':
                this.setVelocity(0, -this.patrolSpeed);
                if (this.y <= this.minY) this.direction = 'down';
                break;
            case 'down':
                this.setVelocity(0, this.patrolSpeed);
                if (this.y >= this.maxY) this.direction = 'up';
                break;
        }
    }

    private pickNewDirection() {
        const possible: Array<typeof this.direction> = [];

        if (this.x > this.minX + 5) possible.push('left');
        if (this.x < this.maxX - 5) possible.push('right');
        if (this.y > this.minY + 5) possible.push('up');
        if (this.y < this.maxY - 5) possible.push('down');

        if (possible.length) {
            const filtered = possible.filter(d =>
                !( (this.direction === 'left' && d === 'right') ||
                    (this.direction === 'right' && d === 'left') ||
                    (this.direction === 'up' && d === 'down') ||
                    (this.direction === 'down' && d === 'up') )
            );
            const pool = filtered.length ? filtered : possible;
            this.direction = Phaser.Utils.Array.GetRandom(pool);
        }
    }

    private handleBlocked() {
        // @ts-ignore
        if (this.body?.blocked?.left && this.direction === 'left') this.direction = 'right';
        // @ts-ignore
        if (this.body?.blocked?.right && this.direction === 'right') this.direction = 'left';
        // @ts-ignore
        if (this.body?.blocked?.up && this.direction === 'up') this.direction = 'down';
        // @ts-ignore
        if (this.body?.blocked?.down && this.direction === 'down') this.direction = 'up';
    }

    private getDirectionToPlayer() {
        const vx = (this.target?.x ?? 0) - this.x;
        const vy = (this.target?.y ?? 0) - this.y;
        const len = Math.hypot(vx, vy) || 1;
        return { nx: vx / len, ny: vy / len };
    }
}
