/**
 * Created by Rudie on 4-10-2014.
 */
require('./libs/leapjs/template/entry');
var arDrone = require('./libs/ar-drone');

var drone = arDrone.createClient();
var controller = new Leap.Controller({enableGestures: true});

var flying = false;

//config
drone.config('control:outdoor', 'TRUE');
drone.config('control:altitude_max', 100000);
console.log('Drone configured');

//frame
controller.on('frame', function (frame) {
    var hands = frame.hands;
    var gestures = frame.gestures;

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
    });

    if(flying){
        //x, z axis movement
        hands.forEach(function (hand) {
            var pitch = (hand.pitch() / 3.14159265) + 0.5;
            var roll = (hand.roll() / 3.14159265) + 0.5;
            var yaw = (hand.yaw() / 3.14159265) + 0.5;

            //backward
            if (pitch > 0.5) {
                drone.back(pitch - 0.5);
                //console.info('backward speed: ' + (pitch - 0.5));
            }
            //forward
            else {
                drone.front(0.5 - pitch);
                //console.info('forward speed: ' + (0.5 - pitch));
            }

            //left
            if (roll > 0.5) {
                drone.left(roll - 0.5);
                //console.info('left speed: ' + (roll - 0.5));
            }
            //right
            else {
                drone.right(0.5 - roll);
                //console.info('right speed: ' + (0.5 - roll));
            }

            //rotate left
            if(yaw > 0.5){
                drone.clockwise(yaw - 0.5);
                //console.info("rotate left: " + (yaw - 0.5));
            }
            //rotate right
            else {
                drone.counterClockwise(0.5 - yaw);
                //console.info("rotate right: " + (0.5 - yaw));
            }
        });

        //y axis movement
        gestures.forEach(function (gesture) {
            if (gesture.type == 'circle') {
                var pointableID = gesture.pointableIds[0];
                var direction = frame.pointable(pointableID).direction;
                var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                //up
                if (dotProduct > 0) {
                    drone.up(0.5);
                    console.info('up');
                }
                //down
                else {
                    drone.down(0.5);
                    console.info('down');
                }
            }
        });

        //lock x, y, z axis movements
        if (hands.length == 0) {
            drone.stop();
            console.info('hovering');
        }

        //lock y axis movements
        if(gestures.length == 0) {
            drone.up(0);
            console.info('steady');
        }
    }
});

controller.connect();
console.log("Ready to take off");