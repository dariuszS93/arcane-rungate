import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }
        }
    },
    scene: {
        preload,
        create, 
        update
    }
};

function preload(this: Phaser.Scene) {
    this.load.image('player', '/assets/player.png');
    this.load.image('coin', '/assets/goldStar.png');
}

let player: Phaser.GameObjects.Sprite;
let coins: Phaser.Physics.Arcade.Group;
let score = 0;
let scoreText: Phaser.GameObjects.Text;

function create(this: Phaser.Scene) {
    player = this.physics.add.sprite(400, 300, 'player');
    player.setScale(0.5);

    coins = this.physics.add.group({
        key: 'coin',
        repeat: 10,
        setXY: {x: 50, y: 70, stepX: 70}
    });

    (coins.getChildren() as Phaser.Physics.Arcade.Image[]).forEach((coin) => {
        coin.setScale(0.5);
    });

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    this.input.keyboard?.on('keydown-LEFT', () => player.x -= 10);
    this.input.keyboard?.on('keydown-RIGHT', () => player.x += 10);
    this.input.keyboard?.on('keydown-UP', () => player.y -= 10);
    this.input.keyboard?.on('keydown-DOWN', () => player.y += 10);

    // @ts-ignore
    this.physics.add.overlap(player, coins, collectCoin, undefined, this);
}

function collectCoin(playerObj: Phaser.GameObjects.GameObject, coinObj: Phaser.GameObjects.GameObject) {
    const coin = coinObj as Phaser.Physics.Arcade.Image;
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

function update(this: Phaser.Scene) {

}

new Phaser.Game(config);