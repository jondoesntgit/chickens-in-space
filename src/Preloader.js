
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
//		this.background = this.add.sprite(0, 0, 'preloaderBackground');
        height = window.innerHeight;
        width = window.innerWidth;


		this.preloadBar = this.add.sprite((width-384)/2, (height-38)/2, 'preloaderBar');

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, the lines below won't work as the files themselves will 404, they are just an example of use.
		this.load.image('titlepage', 'images/title.jpg');
//		this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json'); 
        this.load.image('playButton', 'images/play.jpg');
        this.game.load.image('galaxy', 'assets/hubble.jpg');
        // http://images.forwallpaper.com/files/images/2/2b73/2b737d44/152527/hubble-hubble-space-telescope-nasa-esa-view-star-forming-region-region-s-106-star-dust.jpg
        this.game.load.image('rocket', 'assets/rocket.png');
        this.game.load.image('chicken', 'assets/chicken.png');
        this.game.load.image('feather', 'images/feather.png');
        this.game.load.image('graviton', 'images/graviton.png');
        this.game.load.image('egg', 'images/egg.png');
        this.game.load.spritesheet('explode', 'images/explode.png', 128, 128)

        if (loadMusic) {
            this.load.audio('titleMusic', ['audio/Defense Line.mp3']);
            this.load.audio('gameMusic', 'audio/Bobber Loop.wav', 0.5, true);
        }
//		this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
//		this.preloadBar.cropEnabled = false;
//
        if (!loadMusic) {
            this.ready = true;
			this.state.start('MainMenu');
        }

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}

};
