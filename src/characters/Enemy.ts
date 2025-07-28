import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private minX: number;
    private maxX: number;
    private direction: 'left' | 'right';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: number) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.5);
        this.setCollideWorldBounds(true);

        this.minX = x - 100;
        this.maxX = x + 100;
        this.direction = 'left';
    }

    public update(): void {
        if (this.direction === 'left') {
            this.setVelocityX(-40);
            this.setFlipX(true);
            if (this.x <= this.minX) this.direction = 'right';
        } else {
            this.setVelocityX(40);
            this.setFlipX(false);
            if (this.x >= this.maxX) this.direction = 'left';
        }

        this.anims.play('enemyWalk', true);
    }
}
