// Separate out some of the functions used in the game to make it easier to read code.

// A bunch of constants

var chickenSize = 0.1; // How much should we scale default chickens?
var featherSize = 0.08; // How much should we scale default chickens?
var eggSize = 0.1 // How much should we scale default chickens?
var playerSize = 0.05; // How big is the player
var strainPeriod = 150; // How fast should the strain rotate
var universeEdgeBounciness = .8; //Allow the universe to 'cool' by objects hitting the edge
var speedOfGraviton = 500;
var maxStrain = .8; // Don't make the oscillations too big!
var nextFire = 0; // Used to prevent 100Hz fire rate, limits to 1 chicken per second when holding mouse down. You can break physics, but not by that much.
var fireRate = 400; // How many milliseconds between shots?
var turretLength = 100; // How far away from ship anchor should a chicken be created? If it is too close, then it will create a collision upon creation
var chickenImpulse = 100; // How hard does a chicken get shot out?
var gravitationalConstant = 300000; // What is the pull between our chickens?
var dragCoefficient = 100; // Cause some drag when objects get really close to each other. GR!

/**
 * Call this when somebody fires a chicken by clicking the mouse
 */ 
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

/**
 * Depricated. Once upon a time used for adding strain to objects. Now refer to addStrain2 
 */
addStrain = function(collisionPoint, collisionStrength) {
    playerBody = topPointer.player.body;
    distanceSquared = Math.pow(collisionPoint.x - playerBody.x,2) + Math.pow(collisionPoint.y - playerBody.y,2);
    timeOffset = Math.sqrt(distanceSquared) / speedOfGraviton;
    playerBody.strainAmplitudeGain = collisionStrength / distanceSquared;

    topPointer.chickens.forEachAlive(function(chicken){
        distanceSquared = Math.pow(collisionPoint.x - chicken.body.x,2) + Math.pow(collisionPoint.y - chicken.body.y,2);
        timeOffset = Math.sqrt(distanceSquared) / speedOfGraviton;
        chicken.body.strainAmplitudeGain = collisionStrength / distanceSquared;
    })
}

/**
 * Adds strain to an object when a graviton passes through it.
 */
addStrain2 = function(strainedObject, graviton) {
    strainedObject.body.strainAmplitudeGain = graviton.strength/10;
}

/**
 * Let the objects wobble every timestep
 */
strainObjects = function() {
    strainSingleObject(topPointer.player, playerSize);

    topPointer.chickens.forEachAlive(function(chicken) {
        strainSingleObject(chicken, chickenSize);
    })
}


/**
 * Depricated. Now use addStrain2 when a graviton collides with an object
 */
strainSingleObject = function(sprite, scale) {
    body = sprite.body;
    body.strainAmplitude += body.strainAmplitudeGain;

    if (body.strainAmplitudeGain > 0) {
        body.strainAmplitudeGain -= .01
    } else {
        body.strainAmplitudeGain = 0;
    }

    body.strainAmplitude *= .99;
    if (body.strainAmplitude > maxStrain){
      body.strainAmplitude = maxStrain;
    } 

    time = topPointer.game.time.now;
    xstrain = body.scaleFactor * (1 + body.strainAmplitude * Math.cos(body.strainAngle + time/strainPeriod));
    ystrain = body.scaleFactor * (1 - body.strainAmplitude * Math.cos(body.strainAngle + time/strainPeriod)); 
    sprite.scale.set(xstrain, ystrain)
}

/**
 * Create a chicken. Useful when using the `fire' command
 */
createChicken = function(xpos, ypos, xvel, yvel) {
    // These two lines are a little tricky. Ideally I would like to set the anchor for the chickens to .5, .5,
    // However, when I try to do this, they all spawn in the bottom-right corner. Spent more time debugging this
    // than is practical. Compromised with the following two lines
    xpos = xpos - 16;
    ypos = ypos - 16;

    var chicken = topPointer.chickens.create(xpos, ypos, 'chicken');
    topPointer.game.physics.arcade.enable(chicken);
    chicken.body.coreCollapse = 1;
    chicken.body.maxVelocity = 100
    chicken.moves = false;
    chicken.body.scaleFactor = chickenSize * Math.sqrt(chicken.body.mass) * chicken.body.coreCollapse;
    chicken.scale.set(chicken.body.scaleFactor, chicken.body.scaleFactor);
    chicken.body.velocity.x = xvel;
    chicken.body.velocity.y = yvel;
    chicken.body.bounce.x = universeEdgeBounciness;
    chicken.body.bounce.y = universeEdgeBounciness;
    chicken.body.collideWorldBounds = true; // Chickens should not leave the universe

    // Gravitational wave stuff
    chicken.body.strainAmplitudeGain = 0;
    chicken.body.strainAmplitude = 0;
    chicken.body.strainAngle = 2 * Math.random() * Math.PI;
}

/**
 * This makes an egg, which can collide with a player to destroy them. Analog of heavy metals or asteroids, etc...
 */
createEgg = function(xpos, ypos, xvel, yvel) {
    myEgg = topPointer.eggs.create(xpos, ypos, 'egg');
    var scaleFactor = eggSize * Math.sqrt(myEgg.body.mass);
    myEgg.scale.set(scaleFactor, scaleFactor);
    myEgg.body.velocity.x = xvel;
    myEgg.body.velocity.y = yvel;
    myEgg.body.collideWorldBounds = false;
    myEgg.name = "Egg";
    myEgg.events.onOutOfBounds.add(goodbye, this);

    // The ripe property tells the engine whether this is deadly or not. I had problems with objects spending their first frame
    // somewhere else on the game map, and then when they updated they moved through the player. This was an easier way to fix
    // the behavior than hours of debugging and documentation, especially for a simple game like this.
    myEgg.ripe = 10; 
}

/**
 * This is where the feathers are made, which give players points.
 */
createFeather = function(xpos, ypos, xvel, yvel) {
    myFeather = topPointer.feathers.create(xpos, ypos, 'feather');
    var scaleFactor = featherSize * Math.sqrt(myFeather.body.mass);
    myFeather.scale.set(scaleFactor, scaleFactor);
    myFeather.body.velocity.x = xvel;
    myFeather.body.velocity.y = yvel;
    myFeather.body.collideWorldBounds = false;
    myFeather.events.onOutOfBounds.add(goodbye, this);

    // See the note in `createEgg'
    myFeather.ripe = 10
}

/**
 * These are etherial objects that move very quickly and cause the player to wobble. Chickens too!
 */
createGraviton = function(passedStrength, xpos, ypos, xvel, yvel) {
    var myGraviton = topPointer.gravitons.create(xpos, ypos, 'graviton');
    myGraviton.body.velocity.x = xvel;
    myGraviton.body.velocity.y = yvel;
    myGraviton.body.collideWorldBounds = false;
    myGraviton.strength = passedStrength;
    myGraviton.alpha = 0.1;
    myGraviton.checkWorldBounds = true;
    myGraviton.events.onOutOfBounds.add(goodbye, this);
}

/**
 * Remove the object
 */
goodbye = function (object) {
    object.kill();
}

/**
 * Make the player that fired this egg recoil backwards
 */
recoil = function (player) {
   
    player.body.velocity.x += Math.cos(player.rotation-Math.PI/2) * chickenImpulse;
    player.body.velocity.y += Math.sin(player.rotation-Math.PI/2) * chickenImpulse;

}

/**
 * Called at initialization, so that when the player explodes, we can watch the glory!
 */
setupExplosion = function(explosion) {
    explosion.anchor.x = .5;
    explosion.anchor.y = .5;
    explosion.animations.add('explode');
}

/**
 * Make the player go away if he hits something
 */
destroyPlayer = function (object1, object2) {

    // See note in createEgg on ripeness
    if (object2.ripe > 0) {
      // Do nothing   
    } else {
        explosion = topPointer.explosions.getFirstExists(false);
        explosion.reset(object1.x, object1.y)
        explosion.play('explode', 10, false, true);
        object1.kill();
        object2.kill();
        topPointer.game.time.events.add(Phaser.Timer.SECOND * 3, quit, this);
    }
}

/* Return to the main menu */
quit = function () {
    topPointer.state.start('MainMenu');
    if (loadMusic) {
        topPointer.music.stop()
    }
    timer.stop()
}


/* Combine two objects */
coalesce = function (body1, body2) {

  if (body1 != body2) {
    body1.body.velocity.x = (body1.body.mass * body1.body.velocity.x + body2.body.mass * body2.body.velocity.x) / (body1.body.mass + body2.body.mass)
    body1.body.velocity.y = (body1.body.mass * body1.body.velocity.y + body2.body.mass * body2.body.velocity.y) / (body1.body.mass + body2.body.mass)
    body1.body.mass = body1.body.mass + body2.body.mass
    body1.body.scaleFactor = chickenSize * Math.sqrt(body1.body.mass) * body1.body.coreCollapse;
    body1.scale.set(body1.body.scaleFactor, body1.body.scaleFactor)
    body2.kill();
    collisionPoint = new Phaser.Point(body1.x, body1.y)
    collisionStrength = 10000 // Could be tuned. Usually the more things that happen, the more the strain anyway
    numGraviton = 40; // How many gravitons should we make

    for (i = 0; i < numGraviton; i++) {
        angle1 = 2 * i * Math.PI/numGraviton;
        createGraviton(Math.sqrt(body1.body.mass)/100, body1.x-128, body1.y-128, speedOfGraviton*Math.cos(angle1), speedOfGraviton*Math.sin(angle1));
    }

    for (i = 0; i < body1.body.mass; i++) {
        angle1 = Math.random() * 2 * Math.PI
        createFeather(body1.x, body1.y, 200*Math.cos(angle1), 200*Math.sin(angle1));
    }

    for (i = 0; i < Math.sqrt(body1.body.mass)/2; i++) {

        angle1 = Math.random() * 2 * Math.PI

        if (body1.body.mass < 20) {
            createEgg(body1.x, body1.y, 100*Math.cos(angle1), 100*Math.sin(angle1));
        }
    }
  }
}

/* This is called when two black holes combine, but there are no black holes in this game, only really condensed chickens */
coalesceBlackHoles = function (body1, blackHole) {
    blackHole.body.mass = blackHole.body.mass + body1.body.mass;
    body1.kill();
}

/* This is where the player falls towards objects with mass */
gravitatePlayer = function(player) {
  var game = topPointer.game;

  // Near identical code to the regular gravitate method, so I use the same variables
  chicken1 = topPointer.player;
  var acceleration = new Phaser.Point(0, 0);

  topPointer.chickens.forEachAlive(function(chicken2) {
      if (chicken1 != chicken2) {
         var distance = Math.sqrt(Math.pow(chicken1.body.x - chicken2.body.x,2) + Math.pow(chicken1.body.y-chicken2.body.y,2));
         var xaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.x - chicken1.body.x);
         var yaccel = gravitationalConstant * chicken2.body.mass / Math.pow(distance,3) * (chicken2.body.y - chicken1.body.y);
         acceleration.x += xaccel
         acceleration.y += yaccel
      }
  })

  topPointer.blackHoles.forEachAlive(function(chicken2) {
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

}

/* Age the feathers and eggs a bit. When they're old enough, they can do stuff */
ripenFeathers = function() {

    feathers = topPointer.feathers;
    feathers.forEachAlive(function(feather){
        if (feather.ripe > 0) {
            feather.ripe = feather.ripe - 1
        }
    })

    topPointer.eggs.forEachAlive(function(egg){
        if (egg.ripe > 0) {
            egg.ripe = egg.ripe - 1
        }
    })

}

/* If black holes are ever in the game, they'll affect the trajectory of eggs */
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

/* If anybody is too heavy, make them collapse into a black hole */
checkCoreCollapse = function(chickens) {
    chickens.forEachAlive(function(chicken) {
        if (chicken.body.mass > 10) {
            // Core collapse!
            if (chicken.body.coreCollapse >= .1) {
                chicken.body.coreCollapse -= .01;
                chicken.body.scaleFactor = chickenSize * Math.sqrt(chicken.body.mass) * chicken.body.coreCollapse;
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
                // Become a black hole, but that's not in this version
            }
        }
    })
}

/* Get points. Yay! */
collectFeather = function(player, feather) {
    if (feather.ripe <= 0) {
        topPointer.score += 10;
        if (loadMusic) {
            topPointer.collectCoin.play()

        }
        feather.kill()
    }
}

/* Cause objects on the screen to fall towards eachother */
gravitate = function(chickens, blackHoles) {
  var game = topPointer.game;
  try {
    // Make all the chickens fall into each other
    chickens.forEachAlive(function(chicken1) {
      if (chicken1.body.velocity.x > 1000 || chicken1.body.velocity.y>1000) {
        chicken1.kill();
      } else {
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
      }
    })
  } catch (err) {
      console.log('Gravity problems');
      console.log(group1)
  }

  // Make all the black holes fall towards each other
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

