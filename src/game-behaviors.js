// Separate out some of the functions used in the game to make it easier to read code.

// A bunch of constants

var chickenSize = 0.01; // How much should we scale default chickens?
var featherSize = 0.04; // How much should we scale default chickens?
var eggSize = 0.01; // How much should we scale default chickens?
var playerSize = 0.05; // How big is the player
var strainPeriod = 150; // How fast should the strain rotate
var universeEdgeBounciness = .8; //Allow the universe to 'cool' by objects hitting the edge
var speedOfGraviton = 500;
var maxStrain = .8; // Don't make the oscillations too big!
var nextFire = 0; // Used to prevent 100Hz fire rate, limits to 1 chicken per second when holding mouse down. You can break physics, but not by that much.
var fireRate = 400; // How many milliseconds between shots?
var turretLength = 100; // How far away from ship anchor should a chicken be created? If it is too close, then it will create a collision upon creation
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

addStrain = function(collisionPoint, collisionStrength) {
    playerBody = topPointer.player.body;
    distanceSquared = Math.pow(collisionPoint.x - playerBody.x,2) + Math.pow(collisionPoint.y - playerBody.y,2);
    timeOffset = Math.sqrt(distanceSquared) / speedOfGraviton
//    topPointer.game.time.events.add(Phaser.Timer.SECOND * timeOffset, function() {
        playerBody.strainAmplitudeGain = collisionStrength / distanceSquared
 //   }, this);
    topPointer.chickens.forEachAlive(function(chicken){
        distanceSquared = Math.pow(collisionPoint.x - chicken.body.x,2) + Math.pow(collisionPoint.y - chicken.body.y,2);
        timeOffset = Math.sqrt(distanceSquared) / speedOfGraviton
  //      topPointer.game.time.events.add(Phaser.Timer.SECOND * timeOffset, function() {
            chicken.body.strainAmplitudeGain = collisionStrength / distanceSquared
   //     }, this);
    })
}

addStrain2 = function(strainedObject, graviton) {
    strainedObject.body.strainAmplitudeGain = graviton.strength
}

strainObjects = function() {
    strainSingleObject(topPointer.player, playerSize);
    topPointer.chickens.forEachAlive(function(chicken) {
        strainSingleObject(chicken, chickenSize);
    })
}

strainSingleObject = function(sprite, scale) {
    body = sprite.body;
    body.strainAmplitude += body.strainAmplitudeGain;
    if (body.strainAmplitudeGain > 0) {
        body.strainAmplitudeGain -= .01
    } else {
        body.strainAmplitudeGain = 0;
    }
    body.strainAmplitude *= .99;
    if (body.strainAmplitude > maxStrain) body.strainAmplitude = maxStrain;

    time = topPointer.game.time.now;
    xstrain = body.scaleFactor * (1 + body.strainAmplitude * Math.cos(body.strainAngle + time/strainPeriod))
    ystrain = body.scaleFactor * (1 - body.strainAmplitude * Math.cos(body.strainAngle + time/strainPeriod)); 
    sprite.scale.set(xstrain, ystrain)
}

createChicken = function(xpos, ypos, xvel, yvel) {
    xpos = xpos - 16
    ypos = ypos - 16
//   xpos = 1000 + xpos
//       ypos = 1000  + ypos
//    var chicken_little = topPointer.game.add.sprite(xpos, ypos, 'chicken');
    var chicken_little = topPointer.chickens.create(xpos, ypos, 'chicken');
//    var chicken_little = topPointer.chickens.create(xpos, ypos, 'chicken');
//    chicken_little.deadly = false;
//    chicken_little.anchor.setTo(0.5, 0.5);// = .5;
    topPointer.game.physics.arcade.enable(chicken_little);
    chicken_little.body.coreCollapse = 1;
    chicken_little.moves = false;
    chicken_little.body.scaleFactor = chickenSize * Math.sqrt(chicken_little.body.mass) * chicken_little.body.coreCollapse;
    chicken_little.scale.set(chicken_little.body.scaleFactor, chicken_little.body.scaleFactor)
    chicken_little.body.velocity.x = xvel;
    chicken_little.body.velocity.y = yvel;
    chicken_little.body.bounce.x = universeEdgeBounciness;
    chicken_little.body.bounce.y = universeEdgeBounciness;
    chicken_little.body.collideWorldBounds = true; // Chickens should not leave the universe

    // Gravitational wave stuff
    chicken_little.body.strainAmplitudeGain = 0;
    chicken_little.body.strainAmplitude = 0;
    chicken_little.body.strainAngle = 2 * Math.random() * Math.PI;
//    topPointer.chickens.add(chicken_little);
    /*
    */
}

createEgg = function(xpos, ypos, xvel, yvel) {
    myEgg = topPointer.eggs.create(xpos, ypos, 'egg');
    var scaleFactor = eggSize * Math.sqrt(myEgg.body.mass);
    myEgg.scale.set(scaleFactor, scaleFactor);
    myEgg.body.velocity.x = xvel;
    myEgg.body.velocity.y = yvel;
    myEgg.body.collideWorldBounds = false;
    myEgg.name = "Egg";
    myEgg.events.onOutOfBounds.add(goodbye, this);
}

createFeather = function(xpos, ypos, xvel, yvel) {
    myFeather = topPointer.feathers.create(xpos, ypos, 'feather');
    var scaleFactor = featherSize * Math.sqrt(myFeather.body.mass);
    myFeather.scale.set(scaleFactor, scaleFactor);
    myFeather.body.velocity.x = xvel;
    myFeather.body.velocity.y = yvel;
    myFeather.body.collideWorldBounds = false;
    myFeather.events.onOutOfBounds.add(goodbye, this);
    myFeather.ripe = 10
}

createGraviton = function(passedStrength, xpos, ypos, xvel, yvel) {
    var myGraviton = topPointer.gravitons.create(xpos, ypos, 'graviton');
    myGraviton.body.velocity.x = xvel;
    myGraviton.body.velocity.y = yvel;
    myGraviton.body.collideWorldBounds = false;
    myGraviton.strength = passedStrength;
    myGraviton.alpha = 0
    myGraviton.checkWorldBounds = true;
    myGraviton.events.onOutOfBounds.add(goodbye, this);
}

goodbye = function (object) {
    object.kill();
}

recoil = function (player) {
   
    player.body.velocity.x += Math.cos(player.rotation-Math.PI/2) * chickenImpulse;
    player.body.velocity.y += Math.sin(player.rotation-Math.PI/2) * chickenImpulse;

}

setupExplosion = function(explosion) {
    explosion.anchor.x = .5;
    explosion.anchor.y = .5;
    explosion.animations.add('explode');
}

destroyPlayer = function (object1, object2) {
    console.log(object2)
    explosion = topPointer.explosions.getFirstExists(false);
    explosion.reset(object1.x, object1.y)
    explosion.play('explode', 10, false, true);
    object1.kill();
    object2.kill();
    topPointer.game.time.events.add(Phaser.Timer.SECOND * 3, quit, this);
}

quit = function () {
    topPointer.state.start('MainMenu');
    if (loadMusic) {
        topPointer.music.stop()
    }
}


// Combine two objects
coalesce = function (body1, body2) {
  if (body1 != body2) {
      console.log(body1)
      console.log(body2)
      body1.body.velocity.x = (body1.body.mass * body1.body.velocity.x + body2.body.mass * body2.body.velocity.x) / (body1.body.mass + body2.body.mass)
      body1.body.velocity.y = (body1.body.mass * body1.body.velocity.y + body2.body.mass * body2.body.velocity.y) / (body1.body.mass + body2.body.mass)
      body1.body.mass = body1.body.mass + body2.body.mass
      body1.body.scaleFactor = chickenSize * Math.sqrt(body1.body.mass) * body1.body.coreCollapse;
      body1.scale.set(body1.body.scaleFactor, body1.body.scaleFactor)
      body2.kill();
      collisionPoint = new Phaser.Point(body1.x, body1.y)
      collisionStrength = 10000
      for (i = 0; i < 40; i++) {
          angle1 = Math.random() * 2 * Math.PI;
          createGraviton(Math.sqrt(body1.body.mass)/100, body1.x-128, body1.y-128, speedOfGraviton*Math.cos(angle1), speedOfGraviton*Math.sin(angle1));
      }
      angle1 = Math.random() * 2 * Math.PI
      angle2 = Math.random() * 2 * Math.PI
      angle3 = Math.random() * 2 * Math.PI
      angle4 = Math.random() * 2 * Math.PI
      angle5 = Math.random() * 2 * Math.PI
//              createEgg(body1.x, body1.y, 100*Math.cos(angle1), 100*Math.sin(angle1));
      createFeather(body1.x, body1.y, 200*Math.cos(angle2), 200*Math.sin(angle2));
      createFeather(body1.x, body1.y, 200*Math.cos(angle3), 200*Math.sin(angle3));
      createFeather(body1.x, body1.y, 200*Math.cos(angle4), 200*Math.sin(angle4));
      createFeather(body1.x, body1.y, 200*Math.cos(angle5), 200*Math.sin(angle5));
      //addStrain(collisionPoint, collisionStrength);
  }
}

coalesceBlackHoles = function (body1, blackHole) {
    blackHole.body.mass = blackHole.body.mass + body1.body.mass;
    body1.kill();
}

gravitatePlayer = function(player) {

}

ripenFeathers = function() {
    feathers = topPointer.feathers;
    feathers.forEachAlive(function(feather){
        if (feather.ripe > 0) {
            feather.ripe = feather.ripe - 1
        console.log(feather.ripe)
        }
    })
}

gravitateEggs = function(eggs, chickens, blackHoles) {
    eggs.forEachAlive(function(egg) {
        var acceleration = new Phaser.Point(0, 0);
        blackHoles.forEachAlive(function(blackHole){
            var distance = Math.sqrt(Math.pow(blackHole.body.x - egg.body.x,2) + Math.pow(blackHole.body.y-egg.body.y,2));
            var xaccel = gravitationalConstant * egg.body.mass / Math.pow(distance,3) * (egg.body.x - blackHole.body.x);
            var yaccel = gravitationalConstant * egg.body.mass / Math.pow(distance,3) * (egg.body.y - blackHole.body.y);
            acceleration.x += xaccel
            acceleration.y += yaccel
        })
        egg.body.acceleration = acceleration;
    })
}

checkCoreCollapse = function(chickens) {
    chickens.forEachAlive(function(chicken) {
        if (chicken.body.mass > 10) {
            // Core collapse!
            if (chicken.body.coreCollapse >= .1) {
                chicken.body.coreCollapse -= .01;
                angle1 = Math.random() * 2 * Math.PI
                angle2 = Math.random() * 2 * Math.PI
                angle3 = Math.random() * 2 * Math.PI
                angle4 = Math.random() * 2 * Math.PI
                angle5 = Math.random() * 2 * Math.PI
                createEgg(chicken.x, chicken.y, 100*Math.cos(angle1), 100*Math.sin(angle1));
                createFeather(chicken.x, chicken.y, 200*Math.cos(angle2), 200*Math.sin(angle2));
                createFeather(chicken.x, chicken.y, 200*Math.cos(angle3), 200*Math.sin(angle3));
                createFeather(chicken.x, chicken.y, 200*Math.cos(angle4), 200*Math.sin(angle4));
                createFeather(chicken.x, chicken.y, 200*Math.cos(angle5), 200*Math.sin(angle5));
            } else {
                // Become a black hole
            }
        }
    })
}

collectFeather = function(player, feather) {
    if (feather.ripe <= 0) {
        topPointer.score += 10;
        if (loadMusic) {
            topPointer.collectCoin.play()

        }
        feather.kill()
    }
}

gravitate = function(chickens, blackHoles) {
    var game = topPointer.game;
    try {
        chickens.forEachAlive(function(chicken1) {
//            chicken1.anchor.setTo(0.5, 0.5);// = .5;
            var acceleration = new Phaser.Point(0, 0);
            chickens.forEachAlive(function(chicken2) {
                if (chicken1 != chicken2) {
                   var distance = Math.sqrt(Math.pow(chicken1.body.x - chicken2.body.x,2) + Math.pow(chicken1.body.y-chicken2.body.y,2));
                   var xaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.x - chicken1.body.x);
                   var yaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.y - chicken1.body.y);
                   acceleration.x += xaccel
                   acceleration.y += yaccel
                }
            })
            blackHoles.forEachAlive(function(chicken2) {
                if (chicken1 != chicken2) {
                   var distance = Math.sqrt(Math.pow(chicken1.body.x - chicken2.body.x,2) + Math.pow(chicken1.body.y-chicken2.body.y,2));
                   var xaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.x - chicken1.body.x);
                   var yaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.y - chicken1.body.y);
                   acceleration.x += xaccel
                   acceleration.y += yaccel
                }
            })
           var dragCoefficient = (1/(1+.00001*Phaser.Point.distance(acceleration, new Phaser.Point(0,0))))
           chicken1.body.acceleration = acceleration;
           chicken1.body.velocity.x *= dragCoefficient;
           chicken1.body.velocity.y *= dragCoefficient;
        })
    } catch (err) {
        console.log('Gravity problems');
        console.log(group1)
    }
    blackHoles.forEachAlive(function(blackHole1) {
        var acceleration = new Phaser.Point(0, 0);
        blackHoles.forEachAlive(function(blackHole2) {
            if (blackHole1 != blackHole2) {
               var distance = Math.sqrt(Math.pow(blackHole1.body.x - blackHole2.body.x,2) + Math.pow(blackHole1.body.y-blackHole2.body.y,2));
               var xaccel = gravitationalConstant * blackHole2.body.mass / Math.pow(distance,3) * (blackHole2.body.x - blackHole1.body.x);
               var yaccel = gravitationalConstant * blackHole2.body.mass / Math.pow(distance,3) * (blackHole2.body.y - blackHole1.body.y);
               acceleration.x += xaccel
               acceleration.y += yaccel
            }
        })
        blackHoles.forEachAlive(function(blackHole2) {
            if (blackHole1 != blackHole2) {
               var distance = Math.sqrt(Math.pow(blackHole1.body.x - blackHole2.body.x,2) + Math.pow(blackHole1.body.y-blackHole2.body.y,2));
               var xaccel = gravitationalConstant * blackHole2.body.mass / Math.pow(distance,3) * (blackHole2.body.x - blackHole1.body.x);
               var yaccel = gravitationalConstant * blackHole2.body.mass / Math.pow(distance,3) * (blackHole2.body.y - blackHole1.body.y);
               acceleration.x += xaccel
               acceleration.y += yaccel
            }
        })
       var dragCoefficient = (1/(1+.00001*Phaser.Point.distance(acceleration, new Phaser.Point(0,0))))
       blackHole1.body.acceleration = acceleration;
       blackHole1.body.velocity.x *= dragCoefficient;
       blackHole1.body.velocity.y *= dragCoefficient;
    })
}

