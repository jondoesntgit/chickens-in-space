BasicGame.Game = function (game) {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    preload: function() {

        this.game.load.image('galaxy', 'assets/galaxy.jpg');
        this.game.load.image('rocket', 'assets/rocket.png');
        this.game.load.image('chicken', 'assets/chicken.png', 24, 48);
    },

	create: function () {

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.add.sprite(0, 0, 'galaxy');
        
        this.player = this.game.add.sprite(this.game.world.width/2, this.game.world.height/2, 'rocket');
        this.player.scale.set(.05, .05); // The sprite is really big
        this.player.anchor.setTo(0.5, 0.5); // Swivel around the middle
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true; // Break space physics by bouncing off edge of universe (gasp!)

        // Create a group to hold all of our chickens!

        chickens = this.game.add.group();
        chickens.enableBody = true; // It's no fun if the chickens don't interact with other matter!

        var chicken_little = chickens.create(70, 10, 'chicken');
        var scaleFactor = chickenSize * Math.sqrt(chicken_little.body.mass);
        chicken_little.scale.setTo(scaleFactor, scaleFactor)
        chicken_little.body.velocity.x = -100;
        chicken_little.body.velocity.y = -10;
        chicken_little.body.bounce.x = universeEdgeBounciness;
        chicken_little.body.bounce.y = universeEdgeBounciness;
        chicken_little.body.collideWorldBounds = true; // Chickens should not leave the universe

        // Enable inputs
        this.cursors = this.game.input.keyboard.createCursorKeys();

	},

	update: function () {

        this.player.rotation = this.game.physics.arcade.angleToPointer(this.player) - Math.PI/2; // Phaser recons angle from vertical, not from horizontal.

        // Handle input

        if (this.game.input.activePointer.isDown) {
            // Emit chicken (most exciting thing in the entire game)!
            fire(this.player);
        }



	},

	quitGame: function (pointer) {

		//	Here you should destroy anything you no longer need.
		//	Stop music, delete sprites, purge caches, free resources, all that good stuff.

		//	Then's go back to the main menu.
		this.state.start('MainMenu');

	}

};
