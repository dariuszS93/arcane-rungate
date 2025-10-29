import Phaser from "phaser";

export class UIManager {
    private scene: Phaser.Scene;
    private scoreText!: Phaser.GameObjects.Text;
    private playerHpBar!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // @ts-ignore
        this.scoreText = this.scene.add.text(25, 45, 'Score: 0', { fontSize: '28px', fill: '#fff' }).setScrollFactor(0);
        this.playerHpBar = this.scene.add.graphics().setScrollFactor(0);

        this.scene.events.on('scoreChanged', this.updateScore, this);
        this.scene.events.on('playerHpChanged', this.updatePlayerHpBar, this);
        this.scene.events.on('gameOver', this.showGameOver, this);

        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scene.events.off('scoreChanged', this.updateScore, this);
            this.scene.events.off('playerHpChanged', this.updatePlayerHpBar, this);
            this.scene.events.off('gameOver', this.showGameOver, this);
        });
    }

    private updatePlayerHpBar = (hpData: { hp: number; maxHp: number } | number) => {
        const player = (this.scene as any).player as { hp: number; maxHp: number };
        const hp = typeof hpData === 'number' ? hpData : hpData.hp;
        const maxHp = typeof hpData === 'number' ? player.maxHp : hpData.maxHp;
        const width = 200;
        const height = 15;
        const x = 20;
        const y = 20;

        const hpPercent = hp / maxHp;

        this.playerHpBar.clear();
        this.playerHpBar.fillStyle(0x000000, 0.5);
        this.playerHpBar.fillRect(x - 2, y - 2, width + 4, height + 4);
        this.playerHpBar.fillStyle(0xff0000);
        this.playerHpBar.fillRect(x, y, width * hpPercent, height);
    }

    private updateScore = (score: number) => {
        this.scoreText.setText(`Score: ${score}`);
    }

    showStartScreen = (onStart: () => void) => {
        const overlay = this.scene.add.rectangle(this.scene.scale.width / 2, this.scene.scale.height / 2, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.6).setDepth(100);
        const title = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 - 80, 'First Adventure', { fontSize: '40px', color: '#ffffff' }).setOrigin(0.5).setDepth(101);
        const startText = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 - 10, 'Press ENTER to start', { fontSize: '24px', color: '#ffffff'}).setOrigin(0.5).setDepth(101);
        const helpText = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 + 40, 'Arrows to move | SHIFT to run', { fontSize: '18px', color: '#dddddd'}).setOrigin(0.5).setDepth(101);

        // @ts-ignore
        const enterKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.once('down', () => {
            overlay.destroy();
            title.destroy();
            startText.destroy();
            helpText.destroy();
            onStart();
            const player = (this.scene as any).player;
            if (player) this.updatePlayerHpBar({ hp: player.hp, maxHp: player.maxHp });
        });
    }

    private showGameOver = () => {
        const weight = this.scene.scale.width / 2;
        const height = this.scene.scale.height / 2;
        this.scene.add.rectangle(weight, height, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.7).setDepth(200);
        this.scene.add.text(weight, height - 30, 'Game Over', { fontSize: '36px', color: '#fff' }).setOrigin(0.5).setDepth(201);
        this.scene.add.text(weight, height + 20, 'Press ENTER to restart', { fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(201);

        // @ts-ignore
        const enter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enter.once('down', () => {
            this.scene.scene.restart();
        });
    }

    showWinScreen = () => {
        this.scene.add.rectangle(this.scene.scale.width/2, this.scene.scale.height/2, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.7).setDepth(200);
        this.scene.add.text(this.scene.scale.width/2, this.scene.scale.height/2 - 20, 'You Win!', {fontSize: '36px', color:'#fff'}).setOrigin(0.5).setDepth(201);
        this.scene.add.text(this.scene.scale.width/2, this.scene.scale.height/2 + 20, 'Press ENTER to restart', {fontSize: '20px', color:'#fff'}).setOrigin(0.5).setDepth(201);
        // @ts-ignore
        const enter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enter.once('down', ()=> this.scene.scene.restart());
    }
}
