import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';
import { UIManager } from '../managers/UIManager';
import { GameManager } from '../managers/GameManager';

const PLAYER_SPAWN = { x: 100, y: 300 };
const TREE_POSITIONS = [
    { x: 200, y: 150 }, { x: 400, y: 250 }, { x: 700, y: 200 }, { x: 850, y: 400 },
];
const ROCK_POSITIONS = [
    { x: 250, y: 500 }, { x: 500, y: 550 }, { x: 750, y: 450 }, { x: 900, y: 250 },
];
const LAKE_POSITION = { x: 500, y: 400 };
const COIN_POSITIONS = [
    { x: 150, y: 400 }, { x: 300, y: 150 }, { x: 450, y: 500 }, { x: 600, y: 200 },
    { x: 750, y: 550 }, { x: 900, y: 100 }, { x: 950, y: 350 }, { x: 800, y: 600 },
    { x: 400, y: 650 }, { x: 200, y: 600 },
];
const ENEMY_POSITIONS = [
    { x: 650, y: 500 }, { x: 850, y: 200 }, { x: 350, y: 600 }, { x: 250, y: 100 },
];

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private coins!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private obstacles!: Phaser.Physics.Arcade.StaticGroup;
    private shiftKey!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private ui!: UIManager;
    private gameManager!: GameManager;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('coin', '/assets/goldStar.png');
        this.load.spritesheet('adventurer', '/assets/adventurer.png', {
            frameWidth: 80,
            frameHeight: 112,
        });
        this.load.spritesheet('enemy', '/assets/enemy.png', {
            frameWidth: 80,
            frameHeight: 112,
        });
    }

    create() {
        this.initSceneEvents();
        this.initManagers();
        this.initPlayer();
        this.initObstacles();
        this.initCoins();
        this.initEnemies();
        this.initCollisions();
        this.setupAnimations();
        this.initUI();
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

    private initSceneEvents() {
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.anims.resumeAll();
        });

        this.events.on(Phaser.Scenes.Events.START, () => {
            this.anims.resumeAll();
            this.physics.world.resume();
        });

        this.cursors = this.input.keyboard?.createCursorKeys()!;
        // @ts-ignore
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    private initManagers() {
        this.gameManager = new GameManager(this);
        this.ui = new UIManager(this);
    }

    private initPlayer() {
        this.player = new Player(this, PLAYER_SPAWN.x, PLAYER_SPAWN.y);
        this.player.play('idle');
    }

    private initObstacles() {
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
    }

    private initCoins() {
        this.coins = this.physics.add.group();
        COIN_POSITIONS.forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin') as Phaser.Physics.Arcade.Image;
            coin.setScale(0.5);
        });
    }

    private initEnemies() {
        this.enemies = this.physics.add.group();

        ENEMY_POSITIONS.forEach(pos => {
            const enemy = new Enemy(
                this,
                pos.x,
                pos.y,
                'enemy',
                this.player as unknown as Phaser.Physics.Arcade.Sprite,
                this.gameManager
            );
            enemy.minX = pos.x - 100;
            enemy.maxX = pos.x + 100;
            this.enemies.add(enemy);
        });
    }

    private initCollisions() {
        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.enemies, this.obstacles);
        // @ts-ignore
        this.physics.add.collider(this.player, this.enemies, this.gameManager.hitEnemy, undefined, this.gameManager);
        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            // @ts-ignore
            this.handleCoinPickup(player, coin);
        }, undefined, this);
    }

    private initUI() {
        this.ui.showStartScreen(() => {
            this.gameManager.startGame();
        });
    }

    private handleCoinPickup(player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject) {
        this.gameManager.collectCoin(player, coin);

        const remaining = this.coins.getChildren().filter((c: any) => c.active).length;
        if (remaining === 0) this.spawnPortal();
    }

    private getRandomPortalPosition() {
        const margin = 80;
        const corners = [
            { x: margin, y: margin },
            { x: this.scale.width - margin, y: margin },
            { x: margin, y: this.scale.height - margin },
            { x: this.scale.width - margin, y: this.scale.height - margin },
        ];
        return Phaser.Utils.Array.GetRandom(corners);
    }

    private spawnPortal() {
        const { x: px, y: py } = this.getRandomPortalPosition();
        const portal = this.add.circle(px, py, 20, 0x66ff66).setDepth(50);
        this.physics.add.existing(portal, true);

        this.physics.add.overlap(this.player, portal, () => {
            this.ui.showWinScreen();
            this.gameManager.pauseGame();
        });

        this.gameManager.triggerBerserk();
    }

    private setupAnimations() {
        const anims = [
            { key: 'walk', target: 'adventurer', start: 9, end: 10, rate: 6 },
            { key: 'run', target: 'adventurer', start: 9, end: 10, rate: 10 },
            { key: 'enemyWalk', target: 'enemy', start: 9, end: 10, rate: 6 },
        ];

        anims.forEach(({ key, target, start, end, rate }) => {
            if (!this.anims.exists(key)) {
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers(target, { start, end }),
                    frameRate: rate,
                    repeat: -1,
                });
            }
        });

        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'adventurer', frame: 0 }],
            });
        }
    }
}
