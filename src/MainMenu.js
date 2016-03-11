
BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		this.music = this.add.audio('titleMusic');
		this.music.play();
        width = window.innerWidth;
        height = window.innerHeight;
		this.add.sprite((width-640)/2, (height-400)/4, 'titlepage');

		this.playButton = this.add.button((width-40)/2, (height-400)/2+400, 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	}

};
