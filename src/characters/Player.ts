import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    hp: number;
    maxHp: number;
    isKnockedBack = false;

    hasSword = false;
    isAttacking = false;
    private attackCoolDownMs = 400;
    private lastAttackTime = 0;
    private attackRange = 50;
    private lastDirX = 1;
    private lastDirY = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'adventurer');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.5);
        // @ts-ignore
        this.body.setSize(30, 60).setOffset(25, 40);
        this.setCollideWorldBounds(true);
        this.hp = 80;
        this.maxHp = 100;
    }

    move(cursors: Phaser.Types.Input.Keyboard.CursorKeys, shiftKey: Phaser.Input.Keyboard.Key) {
        if (this.isKnockedBack || this.isAttacking) return;
        const speed = shiftKey.isDown ? 100 : 60;
        const anim = shiftKey.isDown ? 'run' : 'walk';
        let vx = 0, vy = 0;
        if (cursors.left?.isDown) vx -= 1;
        if (cursors.right?.isDown) vx += 1;
        if (cursors.up?.isDown) vy -= 1;
        if (cursors.down?.isDown) vy += 1;
        if (vx !== 0 || vy !== 0) {
            const len = Math.hypot(vx, vy);
            vx = (vx / len) * speed;
            vy = (vy / len) * speed;
            this.setVelocity(vx, vy);
            const dLen = Math.hypot(vx, vy) || 1;
            this.lastDirX = vx / dLen;
            this.lastDirY = vy / dLen;
            this.setFlipX(vx < 0);
            this.anims.play(anim, true);
        } else {
            this.setVelocity(0, 0);
            this.anims.play('idle', true);
        }
    }

    canAttack(): boolean {
        return this.hasSword && !this.isAttacking && (this.scene.time.now - this.lastAttackTime) >= this.attackCoolDownMs;
    }

    attack(): void {
        if (!this.canAttack()) return;
        this.beginAttackState();
        const spec = this.buildAttackSpec();
        this.spawnSwordVisual(spec);
        this.emitAttack(spec);
        this.endAttackLater();
    }

    private beginAttackState() {
        this.isAttacking = true;
        this.lastAttackTime = this.scene.time.now;
        this.setTint(0xffdd55);
    }

    private buildAttackSpec() {
        return {
            px: this.x,
            py: this.y,
            dirX: this.lastDirX,
            dirY: this.lastDirY,
            length: this.attackRange,
            thickness: 8
        };
    }

    private spawnSwordVisual(spec: { px: number; py: number; dirX: number; dirY: number; length: number; thickness: number }) {
        const angle = Math.atan2(spec.dirY, spec.dirX);
        const cx = spec.px + spec.dirX * (spec.length / 2);
        const cy = spec.py + spec.dirY * (spec.length / 2);
        const swordRect = this.scene.add
            .rectangle(cx, cy, spec.length, spec.thickness, 0xffff66, 0.55)
            .setDepth(500)
            .setRotation(angle)
            .setStrokeStyle(2, 0xffee99, 0.85);
        // @ts-ignore
        this.scene.data?.set('lastSwordRect', swordRect);
    }

    private emitAttack(spec: any) {
        this.scene.events.emit('playerAttack', spec);
    }

    private endAttackLater() {
        this.scene.time.delayedCall(120, () => {
            // @ts-ignore
            const swordRect = this.scene.data?.get('lastSwordRect');
            swordRect?.destroy();
            this.clearTint();
            this.isAttacking = false;
        });
    }

    heal(amount: number) { this.hp = Math.min(this.hp + amount, this.maxHp); }
    takeDamage(amount: number) { this.hp = Math.max(this.hp - amount, 0); }
}
