import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';
import { GameManager } from '../managers/GameManager.ts';

export function spawnRandomCoins(group: Phaser.Physics.Arcade.Group, count = 12) {
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(50, 950);
        const y = Phaser.Math.Between(50, 700);
        const coin = group.create(x, y, 'coin') as Phaser.Physics.Arcade.Image;
        coin.setScale(0.5);
    }
}

export function spawnRandomEnemies(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    player: Player,
    gameManager: GameManager,
    count = 4
) {
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(100, 950);
        const y = Phaser.Math.Between(100, 700);
        const enemy = new Enemy(scene, x, y, 'enemy', player as unknown as Phaser.Physics.Arcade.Sprite, gameManager);
        enemy.minX = x - Phaser.Math.Between(50, 150);
        enemy.maxX = x + Phaser.Math.Between(50, 150);
        group.add(enemy);
    }
}

export function spawnRandomTrees(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup, count = 4) {
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(100, 900);
        const y = Phaser.Math.Between(100, 700);
        const tree = scene.add.rectangle(x, y, 40, 40, 0x228B22);
        scene.physics.add.existing(tree, true);
        group.add(tree);
    }
}

export function spawnRandomRocks(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup, count = 4) {
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(100, 900);
        const y = Phaser.Math.Between(100, 700);
        const rock = scene.add.rectangle(x, y, 50, 50, 0x808080);
        scene.physics.add.existing(rock, true);
        group.add(rock);
    }
}

export function spawnRandomLake(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup) {
    const x = Phaser.Math.Between(200, 800);
    const y = Phaser.Math.Between(200, 600);
    const lake = scene.add.rectangle(x, y, 200, 100, 0x1E90FF);
    scene.physics.add.existing(lake, true);
    group.add(lake);
}
