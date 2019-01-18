var Menu = (game, phaser) => {
  return {
    preload : function() {
      // Load all the needed resources for the menu.
      game.load.image('menu', './assets/images/menu.png');
    },

    create: function () {
      // Add menu screen.
      // It will act as a button to start the game.
      phaser.add.button(0, 0, 'menu', () => {
        // Change the state to the actual game.
        game.state.start('Game');
  
      }, phaser);
    }
  }
};

export { Menu };