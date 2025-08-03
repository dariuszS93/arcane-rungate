// @ts-ignore
// @ts-ignore

import Phaser, {Scene} from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';

let player: Player;
let coins: Phaser.Physics.Arcade.Group;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let shiftKey: Phaser.Input.Keyboard.Key;
let enemies: Phaser.Physics.Arcade.Group;

export function preload(this: Phaser.Scene) {
    this.load.image('coin', '/assets/goldStar.png');
    this.load.spritesheet('adventurer', '/assets/adventurer.png', {
        frameWidth: 80,
        frameHeight: 112
    });
    this.load.spritesheet('enemy', '/assets/enemy.png', {
        frameWidth: 80,
        frameHeight: 112
    })
}

export function create(this: Phaser.Scene) {
    player = new Player(this, 100, 300);

    enemies = this.physics.add.group();
    const enemy = new Enemy(this, 600, 300, 'enemy');
    enemies.add(enemy);

    cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    // @ts-ignore
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    if (!this.anims.exists('walk')) {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 9, end: 10 }),
            frameRate: 6,
            repeat: -1,
        });
    }

    if (!this.anims.exists('run')) {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('adventurer', { start: 9, end: 10 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    if (!this.anims.exists('idle')) {
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'adventurer', frame: 0 }]
        });
    }

    player.play('idle');

    if (!this.anims.exists('enemyWalk')) {
        this.anims.create({
            key: 'enemyWalk',
            frames: this.anims.generateFrameNumbers('enemy', { start: 9, end: 10 }),
            frameRate: 6,
            repeat: -1,
        });
    }
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
    // @ts-ignore
    this.physics.add.overlap(player, enemies, hitEnemy, undefined, this);
}

// @ts-ignore
function collectCoin(playerObj: Phaser.GameObjects.GameObject, coinObj: Phaser.GameObjects.GameObject) {
    const coin = coinObj as Phaser.Physics.Arcade.Image;
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

// @ts-ignore
function hitEnemy(this: Phaser.Scene, playerObj: Phaser.GameObjects.GameObject, enemyObj: Phaser.GameObjects.GameObject) {
    this.scene.restart();
}

export function update(this: Phaser.Scene) {
    if (player) player.move(cursors, shiftKey);
    (enemies.getChildren() as Enemy[]).forEach((enemy) => {
        enemy.update();
    })
}
