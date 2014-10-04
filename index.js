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

            //forward
            if (pitch > 0.65) {
                drone.front((pitch - 0.5) * 2);
                console.log('forward speed: ' + ((pitch - 0.5) * 2));
            }
            //backward
            else if (pitch < 0.35) {
                drone.back((0.5 - pitch) * 2);
                console.log('backward speed: ' + ((0.5 - pitch) * 2));
            }
            else {
                drone.front(0);
                drone.back(0);
            }

            //left
            if (roll > 0.65) {
                drone.left((roll - 0.5) * 2);
                console.log('left speed: ' + ((roll - 0.5) * 2));
            }
            //right
            else if (roll < 0.35) {
                drone.right((0.5 - roll) * 2);
                console.log('right speed: ' + ((0.5 - roll) * 2));
            }
            else {
                drone.left(0);
                drone.right(0);
            }
        }
    });

});

controller.connect();
console.log("\nWaiting for device to connect...");