// Separate out some of the functions used in the game to make it easier to read code.

// A bunch of constants

var chickenSize = 0.01; // How much should we scale default chickens?
var universeEdgeBounciness = .8; //Allow the universe to 'cool' by objects hitting the edge
var nextFire = 0; // Used to prevent 100Hz fire rate, limits to 1 chicken per second when holding mouse down. You can break physics, but not by that much.
var fireRate = 400; // How many milliseconds between shots?
var turretLength = 50; // How far away from ship anchor should a chicken be created? If it is too close, then it will create a collision upon creation
var chickenImpulse = 100; // How hard does a chicken get shot out?
var gravitationalConstant = 100000; // What is the pull between our chickens?
var dragCoefficient = 1000; // Cause some drag when objects get really close to each other. GR!

fire = function(player) {
    var xpos = player.body.x+player.width/2+Math.cos(player.rotation+Math.PI/2)*turretLength;
    var ypos = player.body.y+player.height/2+Math.sin(player.rotation+Math.PI/2)*turretLength;
    var xvel = player.body.velocity.x + Math.cos(player.rotation+Math.PI/2) * chickenImpulse;
    var yvel = player.body.velocity.y + Math.sin(player.rotation+Math.PI/2) * chickenImpulse;
    if (topPointer.game.time.now > nextFire && player.visible) {
        nextFire = topPointer.game.time.now + fireRate;
        createChicken(xpos, ypos, xvel, yvel);
        recoil(player);
    }
}

createChicken = function(xpos, ypos, xvel, yvel) {
    // Need to adjust anchor
    xpos = xpos -16;
    ypos = ypos -16;

    var chicken_little = topPointer.chickens.create(xpos, ypos, 'chicken');
    var scaleFactor = chickenSize * Math.sqrt(chicken_little.body.mass);
    chicken_little.scale.set(scaleFactor, scaleFactor)
// TODO    chicken_little.anchor.setTo(0.5,0.5)
    chicken_little.body.velocity.x = xvel;
    chicken_little.body.velocity.y = yvel;
    chicken_little.body.bounce.x = universeEdgeBounciness;
    chicken_little.body.bounce.y = universeEdgeBounciness;
    chicken_little.body.collideWorldBounds = true; // Chickens should not leave the universe
}

recoil = function (player) {
   
    player.body.velocity.x += Math.cos(player.rotation-Math.PI/2) * chickenImpulse;
    player.body.velocity.y += Math.sin(player.rotation-Math.PI/2) * chickenImpulse;

}

destroyPlayer = function (object1, object2) {
    object1.kill();
    object2.kill();
    topPointer.game.time.events.add(Phaser.Timer.SECOND * 3, quit, this);
}

quit = function () {
    topPointer.state.start('MainMenu');
}


// Combine two objects
coalesce = function (body1, body2) {
  if (body1 != body2) {
      body1.body.velocity.x = (body1.body.mass * body1.body.velocity.x + body2.body.mass * body2.body.velocity.x) / (body1.body.mass + body2.body.mass)
      body1.body.velocity.y = (body1.body.mass * body1.body.velocity.y + body2.body.mass * body2.body.velocity.y) / (body1.body.mass + body2.body.mass)
      body1.body.mass = body1.body.mass + body2.body.mass
      var scaleFactor = chickenSize * Math.sqrt(body1.body.mass);
      body1.scale.set(scaleFactor, scaleFactor)
      body2.kill();
  }
}

gravitate = function(group1, group2) {
    var game = topPointer.game;
    group1.forEachAlive(function(chicken1) {
        var acceleration = new Phaser.Point(0, 0);
        group2.forEachAlive(function(chicken2) {
            if (chicken1 != chicken2) {
               var distance = Math.sqrt(Math.pow(chicken1.body.x - chicken2.body.x,2) + Math.pow(chicken1.body.y-chicken2.body.y,2));
               var xaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.x - chicken1.body.x);
               var yaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.y - chicken1.body.y);
               acceleration.x += xaccel
               acceleration.y += yaccel
//               chicken1.body.velocity.x += xaccel;
//               chicken1.body.velocity.y += yaccel;
            }
        })
       var dragCoefficient = (1/(1+.00001*Phaser.Point.distance(acceleration, new Phaser.Point(0,0))))
       chicken1.body.acceleration = acceleration;
           chicken1.body.velocity.x *= dragCoefficient;
           chicken1.body.velocity.y *= dragCoefficient;
     //   var dragVector = Phaser.Point.projectUnit(chicken1.body.velocity,acceleration);
     //   chicken1.body.velocity.x = dragVector.x
      //     chicken1.body.velocity.y = dragVector.y 
    })
}
