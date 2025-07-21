import Phaser from 'phaser';

let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let coins: Phaser.Physics.Arcade.Group;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let shiftKey: Phaser.Input.Keyboard.Key;

export function preload(this: Phaser.Scene) {
    this.load.image('coin', '/assets/goldStar.png');
    this.load.spritesheet('adventurer', '/assets/adventurer.png', {
        frameWidth: 80,
        frameHeight: 112
    });
}

export function create(this: Phaser.Scene) {
    player = this.physics.add.sprite(400, 300, 'adventurer');
    player.setScale(0.5);

    cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    // @ts-ignore
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 9, end: 10 }),
        frameRate: 6,
        repeat: -1,
    });

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 9, end: 10 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'idle',
        frames: [{ key: 'adventurer', frame: 0 }]
    });

    coins = this.physics.add.group({
        key: 'coin',
        repeat: 10,
        setXY: { x: 50, y: 70, stepX: 70 }
    });

    (coins.getChildren() as Phaser.Physics.Arcade.Image[]).forEach((coin) => {
        coin.setScale(0.5);
    });

    // @ts-ignore
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // @ts-ignore
    this.physics.add.overlap(player, coins, collectCoin, undefined, this);
}

// @ts-ignore
function collectCoin(playerObj: Phaser.GameObjects.GameObject, coinObj: Phaser.GameObjects.GameObject) {
    const coin = coinObj as Phaser.Physics.Arcade.Image;
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

export function update(this: Phaser.Scene) {
    const speed = shiftKey.isDown ? 3 : 2;
    const anim = shiftKey.isDown ? 'run' : 'walk';

    if (cursors.left?.isDown) {
        player.setFlipX(true);
        player.x -= speed;
        player.anims.play(anim, true);
    } else if (cursors.right?.isDown) {
        player.setFlipX(false);
        player.x += speed;
        player.anims.play(anim, true);
    } else if (cursors.up?.isDown) {
        player.y -= speed;
        player.anims.play(anim, true);
    } else if (cursors.down?.isDown) {
        player.y += speed;
        player.anims.play(anim, true);
    } else {
        player.anims.play('idle', true);
    }
}
