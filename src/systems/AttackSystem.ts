import Phaser from 'phaser';
import { Enemy } from '../characters/Enemy';
import Player from '../characters/Player';

export class AttackSystem {
    constructor(
        private scene: Phaser.Scene,
        private player: Player,
        private enemies: Phaser.Physics.Arcade.Group
    ) {}

    register() {
        this.scene.events.on('playerAttack', this.onPlayerAttack, this);
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scene.events.off('playerAttack', this.onPlayerAttack, this);
        });
    }

    private onPlayerAttack(data: { px: number; py: number; dirX: number; dirY: number; length: number; thickness: number }) {
        if (!this.player.hasSword) return;
        const sx = data.px, sy = data.py;
        const ex = sx + data.dirX * data.length;
        const ey = sy + data.dirY * data.length;
        const vx = ex - sx;
        const vy = ey - sy;
        const segLenSq = vx * vx + vy * vy;
        const enemyRadius = 20;
        const margin = 2;

        (this.enemies.getChildren() as Enemy[]).forEach(enemy => {
            if (!enemy.active) return;
            const dx = enemy.x - sx;
            const dy = enemy.y - sy;
            let t = segLenSq > 0 ? (dx * vx + dy * vy) / segLenSq : 0;
            t = Phaser.Math.Clamp(t, 0, 1);
            const nx = sx + vx * t;
            const ny = sy + vy * t;
            const dist = Math.hypot(enemy.x - nx, enemy.y - ny);
            if (dist <= (data.thickness / 2 + enemyRadius + margin)) {
                this.applyEnemyHit(enemy, nx, ny);
            }
        });
    }

    private applyEnemyHit(enemy: Enemy, hitX: number, hitY: number) {
        enemy.takeDamage(10);
        enemy.applyKnockback(hitX, hitY, 200);
        if (enemy.hp <= 0) {
            enemy.destroy();
            enemy.healthBar.destroy();
        }
    }
}
