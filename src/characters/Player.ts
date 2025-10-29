import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    hp: number;
    maxHp: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'adventurer');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.5);
        // @ts-ignore
        this.body.setSize(30, 60).setOffset(25, 40);
        this.setCollideWorldBounds(true);

        this.hp = 80;
        this.maxHp = 100;
    }

    heal(amount: number) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }

    takeDamage(amount: number) {
        this.hp = Math.max(this.hp - amount, 0);
    }

    move(cursors: Phaser.Types.Input.Keyboard.CursorKeys, shiftKey: Phaser.Input.Keyboard.Key) {
        const speed = shiftKey.isDown ? 100 : 60;
        const anim = shiftKey.isDown ? 'run' : 'walk';

        let vx = 0;
        let vy = 0;

        if (cursors.left?.isDown) vx -= 1;
        if (cursors.right?.isDown) vx += 1;
        if (cursors.up?.isDown) vy -= 1;
        if (cursors.down?.isDown) vy += 1;

        if (vx !== 0 || vy !== 0) {
            const len = Math.hypot(vx, vy);
            if (len > 0) {
                vx = (vx / len) * speed;
                vy = (vy / len) * speed;
            }
            this.setVelocity(vx, vy);

            if (vx < 0) this.setFlipX(true);
            else if (vx > 0) this.setFlipX(false);

            this.anims.play(anim, true);
        } else {
            this.setVelocity(0, 0);
            this.anims.play('idle', true);
        }
    }
}
