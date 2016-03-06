var clientId = null;
var socket = io.connect('http://localhost:3000');
socket.on('new user', function(data) {
    if(clientId == null) {
      clientId = data.clientId;
    }
    console.log('New player: ' + data.clientId);
});

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.script('jquery', 'js/jquery.min.js');


    game.load.image('galaxy', 'assets/galaxy.jpg');
    game.load.image('sky', 'assets/sky.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.image('chicken', 'assets/chicken.png', 24, 48);
    game.load.image('rocket', 'assets/rocket.png');

}

var player;
var cursors;

var stars;
var ships;
var shipList = {};
var score = 0;
var scoreText;


var nextFire;
var fireRate = 400;
var impulse = 20; // How hard each chicken pushes back pushes
var chickenImpulse = 80; // How hard each the ship pushes on the chickens
var turretLength = 50;
var gravitationalConstant = 1000;
var scaleFactor = .01;
var gameOver = false;

function firenoparams() {
   var xcoord =  player.body.x+player.width/2-Math.cos(player.rotation+Math.PI/2)*turretLength;
   var ycoord = player.body.y+player.height/2-Math.sin(player.rotation+Math.PI/2)*turretLength;
   var xvel = player.body.velocity.x  - Math.cos(player.rotation+Math.PI/2) * chickenImpulse;
   var yvel = player.body.velocity.y - Math.sin(player.rotation+Math.PI/2) * chickenImpulse;
   player.body.velocity.x += Math.cos(player.rotation+Math.PI/2) * impulse;
   player.body.velocity.y += Math.sin(player.rotation+Math.PI/2) * impulse;
  fire(xcoord, ycoord, xvel, yvel)
}

function fire(xcoord, ycoord, xvel, yvel) {
    if (game.time.now > nextFire && !gameOver) {
        socket.emit('fire', {
           "xcoord" : xcoord, 
           "ycoord": ycoord,
           "xvel" : xvel,
           "yvel" : yvel
           });
        nextFire = game.time.now + fireRate;
        var star = stars.create(xcoord, ycoord, 'chicken');

       //star.body.setSize(10*Math.sqrt(star.body.mass), 10*Math.sqrt(star.body.mass))
//       star.anchor.setTo(0.5, 0.5)
//       star.body.width = 10*Math.sqrt(star.body.mass);
 //      star.body.height = 10*Math.sqrt(star.body.mass);
        star.body.velocity.x = xvel; 
        star.body.velocity.y = yvel;
        star.scale.setTo(scaleFactor * Math.sqrt(star.body.mass), scaleFactor * Math.sqrt(star.body.mass))
        star.body.bounce.y = 0.9;
        star.body.bounce.x = 0.9;
        star.body.collideWorldBounds = true;
    }
}

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'galaxy');

    // The player and its settings
    player = game.add.sprite(game.world.width/2, game.world.height /2, 'rocket');
    player.scale.set(.05, .05);
    player.anchor.setTo(0.5, 0.5)

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = .9;
    player.body.bounce.x = .9;
    player.body.gravity.y = 0;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
//    player.animations.add('left', [0, 1, 2, 3], 10, true);
//    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();
    ships = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;
    ships.enableBody = true;

    /*var otherShip = ships.create(10, 20, 'rocket');
    otherShip.body.velocity.x = 5;
    otherShip.body.velocity.y = 10;
    otherShip.scale.set(.05, .05);
//    otherShip.anchor.setTo(0.5, 0.5)
//    */

    var star = stars.create(70, 10, 'chicken');
    star.body.velocity.x = 2; 
    star.body.velocity.y = 4;
    star.scale.setTo(scaleFactor * Math.sqrt(star.body.mass), scaleFactor * Math.sqrt(star.body.mass))
    star.body.bounce.y = 0.9;
    star.body.bounce.x = 0.9;
    star.body.collideWorldBounds = true;

    //  Here we'll create 12 of them evenly spaced apart
/*    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'chicken');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
    */

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    nextFire = game.time.now;

    // Create a sync event that repeats every 2 seconds
    game.time.events.loop(Phaser.Timer.SECOND * 4, sync, this);    
    sync();
}

function update() {

    game.physics.arcade.overlap(stars, stars, coalesce, null, this);
    game.physics.arcade.overlap(ships, stars, explode, null, this);
    game.physics.arcade.overlap(ships, player, explode, null, this);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, destroyPlayer, null, this);

    //  Reset the players velocity (movement)
 //   player.body.velocity.x = 0;

    player.rotation = game.physics.arcade.angleToPointer(player) + Math.PI/2;

    if (game.input.activePointer.isDown)
    {
        //  Boom!
        firenoparams();
    }

    if (game.input.activePointer.isUp)
    {
        if (nextFire > game.time.now) {
            nextFire = game.time.now;
        }
    }

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x -= impulse;

//        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x += impulse;

//        player.animations.play('right');
    }
    else
    {
        //  Stand still
//        player.animations.stop();

        player.frame = 4;
    }
    
    if (cursors.up.isDown) 
    {
        player.body.velocity.y -= impulse;
    } else if (cursors.down.isDown) {
        player.body.velocity.y += impulse;
    } else {
       // player.body.velocity.y = 0;
    }
    gravitate();
}

function render() {
    game.debug.text("Time until event: " + game.time.events.duration.toFixed(0), 32, 32);
//  stars.forEachAlive(function(member) {
//     game.debug.body(member)
//  })
}

function gravitate() {
    stars.forEachAlive(function(member) {
      stars.forEachAlive(function(other) {
        if (member != other)
        {
           var distance = Math.sqrt(Math.pow(member.body.x - other.body.x,2) + Math.pow(member.body.y-other.body.y,2))
           var xaccel = gravitationalConstant * other.body.mass / Math.pow(distance,3) * (other.body.x - member.body.x);
           var yaccel = gravitationalConstant * other.body.mass / Math.pow(distance,3) * (other.body.y - member.body.y);
           member.body.velocity.x += xaccel;
           member.body.velocity.y += yaccel;
        }
      })
    })
}

function explode (object1, object2) {
    object1.kill();
    object2.kill();
    console.log('Boom!');
    // TODO add explosion graphics
}

function destroyPlayer (object1, object2) {
    object1.kill();
    object2.kill();
    console.log('GameOver!');
    gameOver = true;
    $.ajax({
        type: 'DELETE',
        contentType: 'application/json',
        url: 'http://localhost:3000/ship/'+clientId,
        })
    // TODO add explosion graphics
}

function coalesce (star, other) {
  // Remove other star
    if (star != other) {
      star.body.velocity.x = (star.body.mass * star.body.velocity.x + other.body.mass * other.body.velocity.x) / (star.body.mass + other.body.mass)
      star.body.velocity.y = (star.body.mass * star.body.velocity.y + other.body.mass * other.body.velocity.y) / (star.body.mass + other.body.mass)
      star.body.mass = star.body.mass + other.body.mass
//      star.body.setSize(10*Math.sqrt(star.body.mass), 10*Math.sqrt(star.body.mass));
//      star.body.width=10*Math.sqrt(star.body.mass)
//      star.body.height=10*Math.sqrt(star.body.mass);
      star.scale.set(scaleFactor * Math.sqrt(star.body.mass),Math.sqrt(star.body.mass) * scaleFactor);
      other.kill();
      score += 10;
      scoreText.text = 'Collision: ' + score;
    }
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

sync = function() {
    var xcoord, ycoord;
    jQuery.ajax({
        url: 'http://localhost:3000'
    })
    .done(function (results) {
        console.log(results);

        xcoord = results.x*game.world.width;
        ycoord = results.y*game.world.height;
        console.log(xcoord + " " + ycoord);
//        fire(xcoord, ycoord, 1, 1);
    })
    .fail(function() {
        console.log('failed');
    });

    //Show ships
    data = {
        "clientId": clientId,
        "xcoord": player.x,
        "ycoord": player.y,
        "xvel": player.body.velocity.x,
        "yvel": player.body.velocity.y
    }
    data = JSON.stringify(data)
    jQuery.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:3000/ship',
        data: data
        })
    .done(function (results) {
        console.log(results);
        for (var ship in results) {
            if (results.hasOwnProperty(ship)) {
                console.log(results[ship]);
                if (!(ship in shipList)){
                    var xcoord = results[ship].xcoord;
                    var ycoord = results[ship].ycoord;
                    shipList[ship] = ships.create(xcoord, ycoord, 'rocket');
                    shipList[ship].body.velocity.x = results[ship].xvel;
                    shipList[ship].body.velocity.y = results[ship].yvel;
                    shipList[ship].scale.set(.05, .05);
                } else {
    //                shipList[ship.clientId].body.velocity.x = ship.xvel;
    //                shipList[ship.clientId].body.velocity.y = ship.yvel;
    //                shipList[ship.clientId].x = ship.xcoord;
                    shipList[ship].reset(results[ship].xcoord, results[ship].ycoord, 1);
                    shipList[ship].body.velocity.y = results[ship].yvel;
                    shipList[ship].body.velocity.x = results[ship].xvel;
                }
            }
//        otherShip.anchor.setTo(0.5, 0.5)
        }
    })
    .fail(function() {
        console.log('failed');
    });
}

