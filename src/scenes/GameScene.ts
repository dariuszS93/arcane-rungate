import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';
import { UIManager } from '../managers/UIManager.ts';
import { GameManager } from '../managers/GameManager.ts';

const PLAYER_SPAWN = { x: 100, y: 300 };
const TREE_POSITIONS = [
    { x: 200, y: 150 },
    { x: 400, y: 250 },
    { x: 700, y: 200 },
    { x: 850, y: 400 },
];
const ROCK_POSITIONS = [
    { x: 250, y: 500 },
    { x: 500, y: 550 },
    { x: 750, y: 450 },
    { x: 900, y: 300 },
];
const LAKE_POSITION = { x: 500, y: 400 };
const COIN_POSITIONS = [
    { x: 150, y: 400 },
    { x: 300, y: 150 },
    { x: 450, y: 500 },
    { x: 600, y: 200 },
    { x: 750, y: 550 },
    { x: 900, y: 100 },
    { x: 950, y: 350 },
    { x: 800, y: 600 },
    { x: 400, y: 650 },
    { x: 200, y: 600 },
];
const ENEMY_POSITIONS = [
    { x: 650, y: 500 },
    { x: 850, y: 200 },
    { x: 350, y: 600 },
    { x: 250, y: 100 },
];

export class GameScene extends Phaser.Scene {

    private player!: Player;
    private coins!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private shiftKey!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private ui!: UIManager;
    private gameManager!: GameManager;
    private obstacles!: Phaser.Physics.Arcade.StaticGroup;

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
        COIN_POSITIONS.forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin') as Phaser.Physics.Arcade.Image;
            coin.setScale(0.5);
        });

        this.enemies = this.physics.add.group();
        ENEMY_POSITIONS.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'enemy', this.player as unknown as Phaser.Physics.Arcade.Sprite, this.gameManager);
            enemy.minX = pos.x - 100;
            enemy.maxX = pos.x + 100;
            this.enemies.add(enemy);
        });

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

        this.obstacles = this.physics.add.staticGroup();

        TREE_POSITIONS.forEach(pos => {
           const tree = this.add.rectangle(pos.x, pos.y, 40, 40, 0x228B22);
           this.physics.add.existing(tree, true);
           this.obstacles.add(tree);
        });

        ROCK_POSITIONS.forEach(pos => {
           const rock = this.add.rectangle(pos.x, pos.y, 50, 50, 0x808080);
           this.physics.add.existing(rock, true);
           this.obstacles.add(rock);
        });

        const lake = this.add.rectangle(LAKE_POSITION.x, LAKE_POSITION.y, 200, 100, 0x1E90FF);
        this.physics.add.existing(lake, true);
        this.obstacles.add(lake);

        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.enemies, this.obstacles);
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
