var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);


// State veriables
var scores = {};        // Stores the scores for all beacons in the format {"beacon10":8,"beacon5":23, ... ,"beacon1":22}
var foraging = false;   // Boolean variables that indicates if we are foraging or not
var stats = {};         // Statistics for all students, served to the interface that visualizes them
var timers = {};        // Stores the timers used to calculate the score


// Handles the starting of the foraging bot
nutella.net.subscribe('start_foraging_bout', function(message, from) {
    foraging = true;
});


// Handles the end of the foraging bot
nutella.net.subscribe('stop_foraging_bout', function(message, from) {
    foraging = false;
    stats = scores;
});


// Subscribes to all enter and exit events for all beacons and 
// register callbacks for these events
nutella.location.ready(function() {
    var patches = nutella.location.resources.filter(function(el){
        return el.type==='STATIC';
    }).map(function(el){
        return el.rid;
    }).forEach(function(rid) {
        nutella.location.resource[rid].notifyEnter = true;
        nutella.location.resource[rid].notifyExit = true;
    });
    nutella.location.resourceEntered(beaconEntered);
    nutella.location.resourceExited(beaconExited);
});


// Fired whenever a beacon enters a patch
function beaconEntered(beacon, patch) {
    if (foraging) {
        timers[beacon.rid] = setInterval(function() {
            if (scores[beacon.rid]===undefined)
                scores[beacon.rid] = 1;
            else
                scores[beacon.rid] = scores[beacon.rid] + 1;
        },1000);
    }
}


// Fired whenever a beacon exists a patch
function beaconExited(beacon, patch) {
    if (foraging) {
        clearInterval(timers[beacon.rid]);
    }
}


//  Handles the requests for the stats of all students
nutella.net.handle_requests('complete_stats', function(message, from) {
    return stats;
});

