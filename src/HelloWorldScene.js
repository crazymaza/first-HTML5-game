import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene {
    constructor() {
        super('hello-world')
        this.player = undefined;
        this.bullets = undefined;
        this.enemies = undefined;
        this.cursors = undefined;
    }

    ENEMY = 'enemy';
    PLAYER = 'player';
    BULLET = 'bullet';
    timeout = 2000;
    timeoutVar = undefined;
    maxEnemySpeed = 15;
    gameOver = false;
    enemySettings = {
        key: this.ENEMY,
        repeat: 10,
        setXY: {x: 50, y: 40, stepX: 70},
        allowGravity: false,
        collideWorldBounds: true,
    }

    bulletSettings = {
        key: this.BULLET,
        repeat: 0,
        allowGravity: false,
        collideWorldBounds: false,
    }

    preload() {
        this.load.image('bg', 'image/bg.jpg')
        this.load.image(this.ENEMY, 'image/enemy_A.png')
        this.load.image(this.PLAYER, 'image/ship_G.png')
        this.load.image(this.BULLET, 'image/star_small.png')
    }

    create() {
        this.add.image(0, 0, 'bg').setOrigin(0, 0);
        this.player = this.physics.add.image(400, 600, this.PLAYER)

        this.player.setVelocity(0, 0)
        this.player.setCollideWorldBounds(true)

        this.createEnemies();

        if (this.player) {
            this.timeoutVar = setInterval(() => {
                this.shot();
            }, this.timeout)
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(this.player, this.enemies, this.setGameOver, null, this)
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }
        super.update(time, delta);
        this.move();

        this.bullets?.getChildren()
            .forEach(item => {
                item?.y <= 0 ? item.destroy(true) : ''
            })

        this.enemies?.children.iterate((enemy) => {
            if (enemy.body.y === this.player.body.y) {
                this.setGameOver(this.player);
            }

            this.bullets?.children.iterate(bullet => {
                this.physics.add.overlap(
                    enemy,
                    bullet,
                    function () {
                        enemy.destroy(true);
                        bullet.destroy(true);
                    }, null, this
                )
            })
        })

        if (this.enemies.countActive(true) === 2) {
            this.enemies.createMultiple(this.enemySettings);
            this.makeEnemyInteract();
            this.maxEnemySpeed += 5;

            if (this.timeout > 500) {
                clearInterval(this.timeoutVar);
                this.timeout -= this.timeout >= 1000 ? 300 : 200;
                this.timeoutVar = setInterval(() => {
                    this.bullets.createMultiple({
                        ...this.bulletSettings,
                        setXY: {x: this?.player?.x, y: this?.player?.y}
                    })
                    this.makeBulletActive();
                }, this.timeout)
            }
        }
    }

    createEnemies() {
        this.enemies = this.physics.add.group(this.enemySettings);
        this.makeEnemyInteract();
    }

    makeEnemyInteract() {
        this.enemies?.children.iterate((child) => {
            child.setTint(0xff0000)
                .setVelocityY(Phaser.Math.FloatBetween(10, this.maxEnemySpeed), 1);
        })
    }

    shot() {
        this.bullets = this.physics.add.group({
            ...this.bulletSettings,
            setXY: {x: this?.player?.x, y: this?.player?.y}
        })
        this.makeBulletActive();
    }

    move() {
        if (this.cursors?.right.isDown) {
            this.player?.setVelocityX(160);
        } else if (this.cursors?.left.isDown) {
            this.player?.setVelocityX(-160);
        } else {
            this.player?.setVelocityX(0);
        }
    }

    makeBulletActive() {
        this.bullets?.children.iterate((child) => {
            child.setScale(0.5)
                .setTint(0x7fffd4)
                .refreshBody()
                .setVelocityY(-330)
                .setGravityY(-150);
        })
    }

    setGameOver(player) {
        this.physics.pause();
        player.setTint(0xff0000);
        this.gameOver = true;
        const gameOverText = this.add.text(250, 100, 'Game Over', {font: '64px Arial'});
        gameOverText.setTintFill(0xff00ff, 0xff00ff, 0x0000ff, 0x0000ff);
    }
}
