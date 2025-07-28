import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'adventurer');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.5);
        this.setCollideWorldBounds(true);
    }

    move(cursors: Phaser.Types.Input.Keyboard.CursorKeys, shiftKey: Phaser.Input.Keyboard.Key) {
        const speed = shiftKey.isDown ? 100 : 60;
        const anim = shiftKey.isDown ? 'run' : 'walk';

        let moving = false;

        if (cursors.left?.isDown) {
            this.setVelocity(-speed, 0);
            this.setFlipX(true);
            this.anims.play(anim, true);
            moving = true;
        } else if (cursors.right?.isDown) {
            this.setVelocity(speed, 0);
            this.setFlipX(false);
            this.anims.play(anim, true);
            moving = true;
        } else if (cursors.up?.isDown) {
            this.setVelocity(0, -speed);
            this.anims.play(anim, true);
            moving = true;
        } else if (cursors.down?.isDown) {
            this.setVelocity(0, speed);
            this.anims.play(anim, true);
            moving = true;
        }

        if (!moving) {
            this.setVelocity(0, 0);
            this.anims.play('idle', true);
        }
    }
}