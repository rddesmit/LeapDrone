/**
 * Created by Rudie on 4-10-2014.
 */
require('./libs/leapjs/template/entry');
var arDrone = require('./libs/ar-drone');

var drone = arDrone.createClient();
var controller = new Leap.Controller({enableGestures: true});

var flying = false;

//frame
controller.on('frame', function (frame) {
    var hands = frame.hands;

    hands.forEach(function (hand) {

        //land
        if (hand.grabStrength > 0.9 && flying) {
            flying = false;
            drone.stop();
            drone.land();
            console.log('landing');
        }

        //takeoff
        if (hand.grabStrength < 0.1 && !flying) {
            drone.takeoff();
            flying = true;
            console.log('taking off');
        }

        //fly
        if (flying) {
            var pitch = (hand.pitch() / 3.14159265) + 0.5;
            var roll = (hand.roll() / 3.14159265) + 0.5;

            //backward
            if (pitch > 0.5) {
                drone.back(pitch - 0.5);
                console.log('backward speed: ' + (pitch - 0.5));
            }
            //forward
            else {
                drone.front(0.5 - pitch);
                console.log('forward speed: ' + (0.5 - pitch));
            }

            //left
            if (roll > 0.5) {
                drone.left(roll - 0.5);
                console.log('left speed: ' + (roll - 0.5));
            }
            //right
            else {
                drone.right(0.5 - roll);
                console.log('right speed: ' + (0.5 - roll));
            }

            //height
            if (frame.valid && frame.gestures.length > 0) {
                frame.gestures.forEach(function (gesture) {
                    if (gesture.type == 'circle') {
                        var pointableID = gesture.pointableIds[0];
                        var direction = frame.pointable(pointableID).direction;
                        var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                        //up
                        if (dotProduct > 0) {
                            drone.up(0.6);
                            console.log('up');
                        }
                        //down
                        else {
                            drone.down(0.6);
                            console.log('down');
                        }
                    }
                });
            }
        }
    });

    //hover
    if (hands.length == 0 && flying) {
        drone.stop();
        console.log('hovering');
    }

});

controller.connect();
console.log("\nReady to take off");