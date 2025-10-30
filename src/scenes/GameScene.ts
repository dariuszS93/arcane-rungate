import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';
import { UIManager } from '../managers/UIManager';
import { GameManager } from '../managers/GameManager';
import { AttackSystem } from '../systems/AttackSystem';

const PLAYER_SPAWN = { x: 150, y: 700 };

const TREE_POSITIONS = [
    { x: 250, y: 200 }, { x: 350, y: 180 }, { x: 600, y: 220 }, { x: 850, y: 250 },
    { x: 200, y: 500 }, { x: 300, y: 550 }, { x: 1800, y: 150 }, { x: 1650, y: 200 },
    { x: 1550, y: 350 }, { x: 1450, y: 600 }, { x: 1700, y: 900 }, { x: 1400, y: 950 },
    { x: 400, y: 950 }, { x: 700, y: 800 }, { x: 900, y: 750 },
];

const BUSHES_POSITIONS = [
    { x: 500, y: 350 }, { x: 550, y: 420 }, { x: 850, y: 650 }, { x: 1100, y: 300 },
    { x: 1350, y: 700 }, { x: 1600, y: 800 }, { x: 1750, y: 500 },
    { x: 300, y: 750 }, { x: 550, y: 950 },
];

const ROCK_POSITIONS = [
    { x: 100, y: 150 }, { x: 450, y: 150 }, { x: 1000, y: 450 }, { x: 1250, y: 200 },
    { x: 1550, y: 450 }, { x: 1750, y: 300 }, { x: 1450, y: 800 }, { x: 950, y: 950 },
    { x: 650, y: 700 }, { x: 300, y: 900 },
];

const LAKE_POSITION = { x: 800, y: 500 };

const COIN_POSITIONS = [
    { x: 250, y: 350 }, { x: 500, y: 200 }, { x: 750, y: 150 }, { x: 1000, y: 150 },
    { x: 1250, y: 400 }, { x: 1450, y: 250 }, { x: 1700, y: 400 },
    { x: 1750, y: 650 }, { x: 1500, y: 850 }, { x: 1200, y: 950 },
    { x: 900, y: 900 }, { x: 650, y: 850 }, { x: 400, y: 800 },
    { x: 350, y: 700 }, { x: 400, y: 500 },
];

const ENEMY_POSITIONS = [
    { x: 600, y: 600 }, { x: 1300, y: 350 }, { x: 1500, y: 600 }, { x: 1300, y: 900 }, { x: 800, y: 300 },
    { x: 400, y: 600 }, { x: 1500, y: 200 }, { x: 350, y: 350 }, { x: 1600, y: 950 }, { x: 1200, y: 650 },
];

const POTION_POSITIONS = [
    { x: 650, y: 150 }, { x: 1500, y: 100 }, { x: 1300, y: 600 }, { x: 1500, y: 900 }, { x: 750, y: 900 },
];

const SWORD_POSITIONS = [
    { x: 500, y: 500 },
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
    // @ts-ignore
    private background!: Phaser.GameObjects.TileSprite;
    private potions!: Phaser.Physics.Arcade.Group;
    private swords!: Phaser.Physics.Arcade.Group;
    // @ts-ignore
    private attackKey!: Phaser.Input.Keyboard.Key;
    private attackSystem!: AttackSystem;

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
        this.load.image('rocks', 'assets/rocks/rock.png');
        this.load.atlas('world', '/assets/world/world.png', '/assets/world/world.json');
    }

    create() {
        this.initSceneEvents();
        this.initManagers();
        this.initBackground();
        this.initPlayer();
        this.initObstacles();
        this.initCoins();
        this.initPotions();
        this.initPlayerHpBar();
        this.initEnemies();
        this.initCollisions();
        this.setupAnimations();
        this.initUI();
        this.initSwordPickup();
        this.initAttackInput();
        this.initAttackEvents();
    }

    update() {
        if (this.gameManager.isStarted) {
            this.player.move(this.cursors, this.shiftKey);
            // @ts-ignore
            (this.enemies.getChildren() as Enemy[]).forEach(enemy => enemy.update());
            if(Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                this.player.attack();
            }
        } else {
            this.player.setVelocity(0, 0);
            this.player.anims.play('idle', true);
        }
    }

    private initSwordPickup() {
        this.swords = this.physics.add.group();
        SWORD_POSITIONS.forEach(pos => {
            const sword = this.swords.create(pos.x, pos.y, 'world', 'fence') as Phaser.Physics.Arcade.Sprite;
            sword.setTint(0xccccff);
            sword.setScale(0.7);
        });
        this.physics.add.overlap(this.player, this.swords, (_p, swordObj) => {
            const sword = swordObj as Phaser.Physics.Arcade.Sprite;
            if (!this.player.hasSword) {
                this.player.hasSword = true;
                sword.destroy();
                this.add.text(this.player.x, this.player.y - 50, 'Sword!', { fontSize: '14px', color: '#fff'})
                    .setDepth(200)
                    .setScrollFactor(0)
                    .setAlpha(0);
            }
        })
    }

    private initAttackInput() {
        // @ts-ignore
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    private initAttackEvents() {
        this.attackSystem = new AttackSystem(this, this.player, this.enemies);
        this.attackSystem.register();
    }

    private initPotions() {
        this.potions = this.physics.add.group();
        POTION_POSITIONS.forEach(pos => {
            const potion = this.potions.create(pos.x, pos.y, 'world', 'barrel');
            potion.setDisplaySize(32, 32);
        });

        this.physics.add.overlap(this.player, this.potions,(_, potion) => {
            // @ts-ignore
            this.handlePotionPickup(potion);
        });
    }

    private handlePotionPickup(potion: Phaser.GameObjects.GameObject) {
        potion.destroy();
        this.player.heal(20);
        this.events.emit('playerHpChanged', { hp: this.player.hp, maxHp: this.player.maxHp });
    }

    private initPlayerHpBar() {
        this.events.emit('playerHpChanged', { hp: this.player.hp, maxHp: this.player.maxHp });
    }

    private initBackground() {
        const grassFrame = 'grass';
        this.background = this.add
            .tileSprite(0, 0, this.scale.width, this.scale.height, 'world', grassFrame)
            .setOrigin(0)
            .setDisplaySize(1920, 1080)
            .setDepth(-10);
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
            const tree = this.add.sprite(pos.x, pos.y, 'world', 'tree1');
            tree.setDisplaySize(64, 128);
            this.physics.add.existing(tree, true);
            this.obstacles.add(tree);
        });

        BUSHES_POSITIONS.forEach(pos => {
            const rock = this.add.sprite(pos.x, pos.y, 'world', 'bush');
            rock.setDisplaySize(64, 64);
            this.physics.add.existing(rock, true);
            this.obstacles.add(rock);
        });

        ROCK_POSITIONS.forEach(pos => {
            const rock = this.add.sprite(pos.x, pos.y, 'rocks').setDisplaySize(64, 64);
            this.physics.add.existing(rock, true);
            this.obstacles.add(rock);
        });

        const lake = this.add.sprite(LAKE_POSITION.x, LAKE_POSITION.y, 'world', 'lake');
        lake.setDisplaySize(300, 200);
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
