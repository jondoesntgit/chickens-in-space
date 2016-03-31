BasicGame = {
    loadMusic : false,
    /* Here we've just got some global level vars that persist regardless of State swaps */
    score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
    music: null,

    /* Your game can check BasicGame.orientated in internal loops to know if it should pause or not */
    orientated: false

};

BasicGame.Boot = function (game) {
};

BasicGame.Boot.prototype = {

    init: function () {

        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            // Set some boundaries for the window
            this.scale.minWidth = 480;
            this.scale.minHeight = 260;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 768;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            // Set some boundaries for the window
            this.scale.minWidth = 480;
            this.scale.minHeight = 260;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 768;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }

    },

    preload: function () {

        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        this.load.image('preloaderBar', 'images/preloader_bar.png');
        this.load.image('noButton', 'images/no-80-40.png');
        this.load.image('yesButton', 'images/yes-80-40.png');
        this.load.image('musicSprite', 'images/music-80-40.png');

    },

    create: function () {
       var topPointer = this;
       var height = window.innerHeight;
       var width = window.innerWidth;

       yesButtonClick = function (){
           loadMusic = true
           topPointer.state.start('Preloader');
       }
       
       noButtonClick = function () {
           loadMusic = false
           topPointer.state.start('Preloader');
       }

       this.game.add.sprite((width-80)/2, height/4 - 50, 'musicSprite')
       yesButton = this.game.add.button((width - 80 - 80)/2, height/4, 'yesButton', yesButtonClick, this)
       noButton  = this.game.add.button((width - 80 + 80)/2, height/4, 'noButton', noButtonClick, this)
    },

    gameResized: function (width, height) {

        //  This could be handy if you need to do any extra processing if the game resizes.
        //  A resize could happen if for example swapping orientation on a device or resizing the browser window.
        //  Note that this callback is only really useful if you use a ScaleMode of RESIZE and place it inside your main game state.

    },

    enterIncorrectOrientation: function () {

        BasicGame.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },

    leaveIncorrectOrientation: function () {

        BasicGame.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }

};
