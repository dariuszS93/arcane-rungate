import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';
import { UIManager } from '../managers/UIManager.ts';
import { GameManager } from '../managers/GameManager.ts';

const PLAYER_SPAWN = { x: 100, y: 300 };

export class GameScene extends Phaser.Scene {

    private player!: Player;
    private coins!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private shiftKey!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private ui!: UIManager;
    private gameManager!: GameManager;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload = ()=> {
        this.load.image('coin', '/assets/goldStar.png');
        this.load.spritesheet('adventurer', '/assets/adventurer.png', {
            frameWidth: 80,
            frameHeight: 112
        });
        this.load.spritesheet('enemy', '/assets/enemy.png', {
            frameWidth: 80,
            frameHeight: 112
        });
    }

    create = ()=> {
        this.gameManager = new GameManager(this);
        this.ui = new UIManager(this);

        this.player = new Player(this, PLAYER_SPAWN.x, PLAYER_SPAWN.y);

        this.coins = this.physics.add.group();
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(50, 950);
            const y = Phaser.Math.Between(50, 700);
            const coin = this.coins.create(x, y, 'coin') as Phaser.Physics.Arcade.Image;
            coin.setScale(0.5);
        }

        this.enemies = this.physics.add.group();
        for (let i = 0; i < 4; i++) {
            const x = Phaser.Math.Between(100, 950);
            const y = Phaser.Math.Between(100, 700);
            const enemy = new Enemy(this, x, y, 'enemy', this.player as unknown as Phaser.Physics.Arcade.Sprite, this.gameManager);
            enemy.minX = x - Phaser.Math.Between(50, 150);
            enemy.maxX = x + Phaser.Math.Between(50, 150);
            // @ts-ignore
            this.enemies.add(enemy);
        }

        this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
        // @ts-ignore
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.setupAnimations();

        this.player.play('idle');

        this.physics.add.overlap(this.player, this.coins, (p: any, coin: any) => {
            this.gameManager.collectCoin(p, coin);
            const remaining = this.coins.getChildren().filter((c:any)=>c.active).length;
            if (remaining === 0) {
                const px = this.scale.width - 80;
                const py = 80;
                const portal = this.add.circle(px, py, 20, 0x66ff66).setDepth(50);
                this.physics.add.existing(portal, true);
                // @ts-ignore
                this.physics.add.overlap(this.player, portal, () => {
                    this.ui.showWinScreen();
                }, undefined, this);
                this.gameManager.triggerBerserk();
            }
        }, undefined, this);

        // @ts-ignore
        this.physics.add.collider(this.player, this.enemies, this.gameManager.hitEnemy, undefined, this.gameManager);

        this.ui.showStartScreen(() => {
            this.gameManager.startGame();
        });
    }

    update() {
        if (this.gameManager.isStarted) {
            this.player.move(this.cursors, this.shiftKey);
            (this.enemies.getChildren() as Enemy[]).forEach(enemy => enemy.update());
        } else {
            this.player.setVelocity(0, 0);
            this.player.anims.play('idle', true);
        }
    }

    private setupAnimations() {
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
        if (!this.anims.exists('enemyWalk')) {
            this.anims.create({
                key: 'enemyWalk',
                frames: this.anims.generateFrameNumbers('enemy', { start: 9, end: 10 }),
                frameRate: 6,
                repeat: -1,
            });
        }
    }
}
