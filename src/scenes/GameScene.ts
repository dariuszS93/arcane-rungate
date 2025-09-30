import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';

let player: Player;
let coins: Phaser.Physics.Arcade.Group;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let lives = 3;
let livesText: Phaser.GameObjects.Text;
let gameStarted = false;
let isPlayerInvulnerable = false;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let shiftKey: Phaser.Input.Keyboard.Key;
let enemies: Phaser.Physics.Arcade.Group;

const PLAYER_SPAWN = { x: 100, y: 300 };

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

// TODO: to refactor
export function create(this: Phaser.Scene) {
    player = new Player(this, PLAYER_SPAWN.x, PLAYER_SPAWN.y);

    coins = this.physics.add.group();
    for (let i = 0; i < 12; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        const coin = coins.create(x, y, 'coin') as Phaser.Physics.Arcade.Image;
        coin.setScale(0.5);
    }

    enemies = this.physics.add.group();
    for (let i = 0; i < 4; i++) {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const enemy = new Enemy(this, x, y, 'enemy');

        enemy.minX = x - Phaser.Math.Between(50, 150);
        enemy.maxX = x + Phaser.Math.Between(50, 150);

        enemies.add(enemy);
    }

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

    // @ts-ignore
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    // @ts-ignore
    livesText = this.add.text(16, 48, `Lives: ${lives}`, {fontSize: '24px', fill: '#fff'});

    const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x00000, 0.6).setDepth(100);
    const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 80, 'First Adventure', { fontSize: '40px', color: '#ffffff' }).setOrigin(0.5).setDepth(101);
    const startText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 10, 'Press ENTER to start', { fontSize: '24px', color: '#ffffff'}).setOrigin(0.5).setDepth(101);
    const helpText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, 'Arrows to move | SHIFT to run', { fontSize: '18px', color: '#dddddd'}).setOrigin(0.5).setDepth(101);

    // @ts-ignore
    const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enterKey.once('down', () => {
        overlay.destroy();
        title.destroy();
        startText.destroy();
        helpText.destroy();
        gameStarted = true;
    });

    this.input.once('pointerdown', () => {
        if(!gameStarted) {
            overlay.destroy();
            title.destroy();
            startText.destroy();
            helpText.destroy();
            gameStarted = true;
        }
    })

    // @ts-ignore
    this.physics.add.overlap(player, coins, collectCoin, undefined, this);
    // @ts-ignore
    this.physics.add.collider(player, enemies, hitEnemy, undefined, this);
}

// @ts-ignore
function collectCoin(playerObj: Phaser.GameObjects.GameObject, coinObj: Phaser.GameObjects.GameObject) {
    const coin = coinObj as Phaser.Physics.Arcade.Image;
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

// TODO: to refactor
// @ts-ignore
function hitEnemy(this: Phaser.Scene, playerObj: Phaser.GameObjects.GameObject, enemyObj: Phaser.GameObjects.GameObject) {
    if(!gameStarted) return;
    if(isPlayerInvulnerable) return;

    lives -= 1;
    livesText.setText(`Lives: ${lives}`);

    const player = playerObj as Phaser.Physics.Arcade.Sprite;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;

    if (player && enemy && player.body) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const angle = Math.atan2(dy, dx);
        const force = 300;
        player.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
    }

    isPlayerInvulnerable = true;
    player.setTint(0xff0000);

    this.time.delayedCall(1000, () => {
        isPlayerInvulnerable = false;
        player.clearTint();
    });

    if(lives <= 0) {
        const weight = this.scale.width / 2;
        const height = this.scale.height / 2;
        this.add.rectangle(weight, height, this.scale.width, this.scale.height, 0x00000, 0.7).setDepth(200);
        this.add.text(weight, height - 30, 'Game Over', { fontSize: '36px', color: '#fff' }).setOrigin(0.5).setDepth(201);
        this.add.text(weight, height + 20, 'Press ENTER to restart', { fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(201);

        // @ts-ignore
        const enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enter.once('down', () => {
            score = 0;
            lives = 3;
            this.scene.restart();
        });
    }
}

export function update(this: Phaser.Scene) {
    if(gameStarted) {
        if (player) player.move(cursors, shiftKey);
        (enemies.getChildren() as Enemy[]).forEach((enemy) => {
            enemy.update();
        })
    }else {
        if (player) {
            player.setVelocity(0, 0);
            player.anims.play('idle', true);
        }
    }
}
