// Separate out some of the functions used in the game to make it easier to read code.

// A bunch of constants

var chickenSize = 0.01; // How much should we scale default chickens?
var universeEdgeBounciness = .8; //Allow the universe to 'cool' by objects hitting the edge
var nextFire; // Used to prevent 100Hz fire rate, limits to 1 chicken per second when holding mouse down. You can break physics, but not by that much.
var turretLength = 50; // How far away from ship anchor should a chicken be created? If it is too close, then it will create a collision upon creation
var chickenImpulse = 10; // How hard does a chicken get shot out?

fire = function(player) {
     var xpos = player.body.x+player.width/2+Math.cos(player.rotation+Math.PI/2)*turretLength;
     var ypos = player.body.y+player.height/2+Math.sin(player.rotation+Math.PI/2)*turretLength;
     var xvel = player.body.velocity.x + Math.cos(player.rotation+Math.PI/2) * chickenImpulse;
     var yvel = player.body.velocity.y + Math.sin(player.rotation+Math.PI/2) * chickenImpulse;
    createChicken(xpos, ypos, xvel, yvel);
    recoil();
}

createChicken = function(xpos, ypos, xvel, yvel) {
    // Need to adjust anchor
    xpos = xpos -16;
    ypos = ypos -16;

    var chicken_little = chickens.create(xpos, ypos, 'chicken');
    var scaleFactor = chickenSize * Math.sqrt(chicken_little.body.mass);
    chicken_little.scale.set(scaleFactor, scaleFactor)
// TODO    chicken_little.anchor.setTo(0.5,0.5)
    chicken_little.body.velocity.x = xvel;
    chicken_little.body.velocity.y = yvel;
    chicken_little.body.bounce.x = universeEdgeBounciness;
    chicken_little.body.bounce.y = universeEdgeBounciness;
    chicken_little.body.collideWorldBounds = true; // Chickens should not leave the universe
}

recoil = function () {

}
