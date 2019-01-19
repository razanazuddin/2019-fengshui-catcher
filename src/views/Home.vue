<template>
  <div>
    <div id="gameframe"></div>
    <div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
  </div>
</template>

<script>
import Phaser from 'phaser'
export default {
  name: 'game',
  props: {
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    }
  },
  mounted () {
    let self = this
    if (this.game == null) {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        width: this.width,
        height: this.height,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 300 },
            debug: false
          }
        }
      })

      this.startScreen = {
        preload: function preload () {
          self.startScreenPreload(this)
        },

        create: function create () {
          self.startScreenCreate(this)
        }
      }
      this.gameScreen = {
        preload: function preload () {
          self.preload(this)
        },
        create: function create () {
          self.create(this)
        },
        update: function update () {
          self.update(this)
        }
      }
      this.endScreen = {
        preload: function preload () {
          self.endScreenPreload(this)
        },

        create: function create () {
          self.endScreenCreate(this)
        }
      }

      this.game.scene.add('Start', this.startScreen);
      this.game.scene.add('Game', this.gameScreen);
      this.game.scene.add('End', this.endScreen);

      this.game.scene.start('Start');
    }
  },
  methods: {
    startScreenPreload (phaser) {
      let camera = phaser.cameras.add(0, 0, this.width, this.height)
      camera.setBackgroundColor('#ffd700');
      phaser.load.image('tangerine', './img/tangerine.png');
      for(var i = 0; i < this.zodiacAssets.length; i++){
        phaser.load.image('zodiac'+i.toString(), this.zodiacAssets[i]);
      }
    },
    startScreenCreate (phaser) {
      phaser.add.text(this.width/2, 40, "Select your zodiac", {font: "18px Arial", fill: "#000"}).setOrigin(0.5);
      // phaser.scrollingMap = phaser.add.tileSprite(0, 0, this.width/2+this.zodiacAssets.length*64+128, this.height, "transp");
      // phaser.scrollingMap.inputEnabled = true;
      // phaser.scrollingMap.input.enableDrag(false);
      // phaser.scrollingMap.savedPosition = new Phaser.Point(phaser.scrollingMap.x, phaser.scrollingMap.y);
      // phaser.scrollingMap.isBeingDragged = false; 
      // phaser.scrollingMap.movingSpeed = 0; 
      // phaser.scrollingMap.input.allowVerticalDrag = false;
      // phaser.scrollingMap.input.boundsRect = new Phaser.Rectangle(this.width - phaser.scrollingMap.width, this.height - phaser.scrollingMap.height, phaser.scrollingMap.width * 2 - this.width, phaser.scrollingMap.height * 2 - this.height);
      for(var i = 0; i < this.zodiacAssets.length; i++){
            var zodiac = phaser.add.image(this.width/2, this.height/2, 'zodiac'+i.toString()).setOrigin(0.5);
            phaser.scrollingMap.addChild(zodiac)
      }
      phaser.scrollingMap.events.onDragStart.add(() => {
            phaser.scrollingMap.isBeingDragged = true;
            phaser.scrollingMap.movingSpeed = 0;
      });
      phaser.scrollingMap.events.onDragStop.add(() => {
            phaser.scrollingMap.isBeingDragged = false;
      });
          
      var startText = phaser.add.text(0, 60, 'Click anywhere to start', { fontSize: '18px', fill: '#000', align: 'center' }).setOrigin(0.5)
      var startButton = phaser.add.image(0, 0, 'tangerine');
      phaser.add.container(400, 300, [startButton, startText]);

      startButton.setInteractive();

      phaser.input.once('pointerup', () => {
        this.game.scene.start('Game')
      });
    },
    preload (phaser) {
      phaser.load.image('sky', './img/sky.png')
      phaser.load.image('ground', './img/platform.png')
      phaser.load.image('star', './img/star.png')
      phaser.load.image('bomb', './img/bomb.png')
      phaser.load.spritesheet('dude', './img/dude.png', { frameWidth: 32, frameHeight: 48 })
    },
    create (phaser) {
      // Create background image
      phaser.add.image(400, 300, 'sky')

      // Create platforms
      this.platforms = phaser.physics.add.staticGroup()

      this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()

      this.platforms.create(600, 400, 'ground')
      this.platforms.create(50, 250, 'ground')
      this.platforms.create(750, 220, 'ground')

      // Create player
      this.player = phaser.physics.add.sprite(100, 450, 'dude')

      this.player.setBounce(0.2)
      this.player.setCollideWorldBounds(true)

      phaser.anims.create({
          key: 'left',
          frames: phaser.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
      })

      phaser.anims.create({
          key: 'turn',
          frames: [ { key: 'dude', frame: 4 } ],
          frameRate: 20
      })

      phaser.anims.create({
          key: 'right',
          frames: phaser.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
          frameRate: 10,
          repeat: -1
      })

      // Create cursor
      this.cursors = phaser.input.keyboard.createCursorKeys()

      // Create stars
      this.stars = phaser.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
      })

      this.stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
      })

      // Create bombs
      this.bombs = phaser.physics.add.group()

      this.scoreText = phaser.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

      phaser.physics.add.collider(this.stars, this.platforms)
      phaser.physics.add.collider(this.bombs, this.platforms)
      phaser.physics.add.collider(this.player, this.platforms)

      phaser.physics.add.overlap(this.player, this.stars, this.collectStar, null, phaser)
      phaser.physics.add.collider(this.player, this.bombs, () => {
      // eslint-disable-next-line
      phaser.physics.pause()
      this.player.setTint(0xff0000)
      this.player.anims.play('turn')

      this.gameOver = true
      this.game.scene.start('End')
    }, null, phaser)
    },
    update () {
      if (this.gameOver) {
        return
      }

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160)
        this.player.anims.play('left', true)
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160)
        this.player.anims.play('right', true)
      } else {
        this.player.setVelocityX(0)
        this.player.anims.play('turn')
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330)
      }
    },
    collectStar (player, star) {
      star.disableBody(true, true)

      this.score += 10
      this.scoreText.setText('Score: ' + this.score)

      if (this.stars.countActive(true) === 0)
      {
        this.stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
        })

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

        var bomb = this.bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
        bomb.allowGravity = false
      }
    },
    hitBomb (player)
    {
      // eslint-disable-next-line
      phaser.physics.pause()
      player.setTint(0xff0000)
      player.anims.play('turn')

      this.gameOver = true
      this.game.scene.start('End')
    },
    endScreenPreload (phaser) {
      phaser.load.image('menu', './img/menu.png');
    },
    endScreenCreate (phaser) {
      // Add startScreen screen.
      // It will act as a button to start the game.
      phaser.add.text(16, 16, 'game over', { fontSize: '32px', fill: '#fff' })
      phaser.add.text(16, 16, 'click anywhere to restart', { fontSize: '32px', fill: '#fff' })

      phaser.input.once('pointerup', () => {
            this.game.scene.start('Game')
        });
    },
  },
  data () {
    return {
      zodiacAssets: [
        './img/zodiac/001-boar.png',
        './img/zodiac/002-rat.png',
        './img/zodiac/003-ox.png',
        './img/zodiac/004-tiger.png',
        './img/zodiac/005-rabbit.png',
        './img/zodiac/006-dragon.png',
        './img/zodiac/007-snake.png',
        './img/zodiac/008-horse.png',
        './img/zodiac/009-goat.png',
        './img/zodiac/010-monkey.png',
        './img/zodiac/011-rooster.png',
        './img/zodiac/012-dog.png',
      ],
      game: null,
      startScreen: null,
      gameScreen: null,
      endScreen: null,
      platforms: null,
      player: null,
      stars: null,
      bombs: null,
      cursors: null,
      gameOver: false,
      score: 0,
      scoreText: ''
    }
  }
}
</script>

<style>
  #gameframe {
    margin: 0 auto
  }
</style>
