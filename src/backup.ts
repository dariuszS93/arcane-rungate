// import Phaser from "phaser";
//
// const config: Phaser.Types.Core.GameConfig = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     backgroundColor: '#2d2d2d',
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: { x: 0, y: 0 }
//         }
//     },
//     scene: {
//         preload,
//         create,
//         update
//     }
// };
//
// function preload(this: Phaser.Scene) {
//     // this.load.image('player', '/assets/player.png');
//     this.load.image('coin', '/assets/goldStar.png');
//     this.load.spritesheet('adventurer', '/assets/adventurer.png', {
//         frameWidth: 80,
//         frameHeight: 112
//     });
// }
//
// let player: Phaser.GameObjects.Sprite;
// let coins: Phaser.Physics.Arcade.Group;
// let score = 0;
// let scoreText: Phaser.GameObjects.Text;
// let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
//
// function create(this: Phaser.Scene) {
//     player = this.physics.add.sprite(400, 300, 'adventurer');
//     player.setScale(0.5);
//     cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
//
//     this.anims.create({
//        key: 'walk',
//        frames: this.anims.generateFrameNumbers('adventurer', { start: 9, end: 10}),
//        frameRate: 8,
//        repeat: -1,
//     });
//
//     this.anims.create({
//        key: 'idle',
//        frames: [{ key: 'adventurer', frame: 0}]
//     });
//
//     this.input.keyboard?.on('keydown-LEFT', () => {
//         player.x -= 10
//         player.anims.play('walk', true);
//     });
//     this.input.keyboard?.on('keydown-RIGHT', () => {
//         player.x += 10
//         player.anims.play('walk', true);
//     });
//     this.input.keyboard?.on('keydown-UP', () => {
//         player.y -= 10;
//         player.anims.play('walk', true);
//     });
//     this.input.keyboard?.on('keydown-DOWN', () => {
//         player.y += 10;
//         player.anims.play('walk', true);
//     });
//
//     coins = this.physics.add.group({
//         key: 'coin',
//         repeat: 10,
//         setXY: {x: 50, y: 70, stepX: 70}
//     });
//
//     (coins.getChildren() as Phaser.Physics.Arcade.Image[]).forEach((coin) => {
//         coin.setScale(0.5);
//     });
//
//     scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
//
//     // @ts-ignore
//     this.physics.add.overlap(player, coins, collectCoin, undefined, this);
// }
//
// function collectCoin(playerObj: Phaser.GameObjects.GameObject, coinObj: Phaser.GameObjects.GameObject) {
//     const coin = coinObj as Phaser.Physics.Arcade.Image;
//     coin.disableBody(true, true);
//     score += 10;
//     scoreText.setText(`Score: ${score}`);
// }
//
// function update(this: Phaser.Scene) {
//     if(cursors.left?.isDown) {
//         player.setFlipX(true);
//         player.x -=2;
//         player.anims.play('walk', true);
//     }
//     else if(cursors.right?.isDown) {
//         player.setFlipX(false);
//         player.x +=2;
//         player.anims.play('walk', true);
//     }
//     else if(cursors.up?.isDown) {
//         player.y -=2;
//         player.anims.play('walk', true);
//     }
//     else if(cursors.down?.isDown) {
//         player.y +=2;
//         player.anims.play('walk', true);
//     }
//     else {
//         player.anims.play('idle', true);
//     }
// }
//
// new Phaser.Game(config);