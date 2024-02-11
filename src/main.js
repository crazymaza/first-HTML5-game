import Phaser from 'phaser'

import HelloWorldScene from './HelloWorldScene'

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200},
            debug: false,
        },
    },
    scene: [HelloWorldScene],
}

export default new Phaser.Game(config)
