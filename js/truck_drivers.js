
// Om de inte använder kundkortet ^
// Kolla vart de åker efter de gjort ett inköp, åker de till ett ställe utan att köpa något nytt som inte är GAStech är det märkligt
var gps_format = d3.timeParse('%m/%d/%Y %H:%M:%S');

function check_truckers(gps, persons, locations){
    var startTime = "01/06/2014 00:00:00";
    var endTime = "01/20/2014 23:59:59";

    // Create array with all the truckers.
    var truckers = [];
    for(var i = 0; i < persons.length; i++){
        if(persons[i].CarID == "-2"){
            truckers.push(persons[i]);
        }
    }

    // Array to keep info for all trucks
    var trucks = [{id: "101", gps: [], stops: [], routes: []}, {id: "104", gps: [], stops: [], routes: []}, {id: "105", gps: [], stops: [], routes: []}, {id: "106", gps: [], stops: [], routes: []}, {id: "107", gps: [], stops: [], routes: []}];

    // Add gps coordinates to the different trucks
    var index;
    for(var i = 0; i < gps.length; i++){
        if(parseInt(gps[i].id) > 35) {
            index = trucks.findIndex(truck => truck.id == gps[i].id);
            trucks[index].gps.push(gps[i]);
        }
    }

    // Add stops and the different routes to the different trucks
    var truckRoutes;
    for(var i = 0; i < trucks.length; i++){ // Go through all the trucks
        // Divide the truck routes into smaller routes where GAStech is the divider
        // (since the truck should return there after every route)
        trucks[i].stops = findStops(trucks[i].gps);
        truckRoutes = getTruckStopsRoute(trucks[i].stops, startTime, endTime, locations);
        for(var k = 0; k < truckRoutes.length; k++){ // Go through all the smaller routes
            if(truckRoutes[k].length > 0){
                trucks[i].routes.push(truckRoutes[k]);
                routes.push(truckRoutes[k]);
            }
        }
    }

    //testMap(locations, routes[routes.length-1])

}


// Get the routes for a truck between two dates
function getTruckStopsRoute(stops, start, end, locations){
    end = gps_format(end);
    start = gps_format(start);
    var counter = 0;
    var truckStops = [];
    truckStops[counter] = [];

    for (var i = 0; i < stops.length; i++) {
        if (gps_format(stops[i].timestamp) > start && gps_format(stops[i].timestamp) < end) {
            if(i != 0){
                var coords = {lat: stops[i-1].lat, long: stops[i-1].long};
                if(atLocation("GAStech", coords, locations)){
                    counter++;
                    truckStops[counter] = [];
                }
            }
            truckStops[counter].push(stops[i]);
        }
    }
    return truckStops;
}

// Get the gps route for a given truck
function getTruckGPSRoute(id, data, res, start, end){
    var a =[];
    var time = gps_format(start);
    end = gps_format(end);
    start = gps_format(start);
    for (var i = 0; i < data.length; i++) {
        if (data[i].id == id && gps_format(data[i].Timestamp) > start && gps_format(data[i].Timestamp) < end) {
            a.push(data[i]);
        }
    }
    return a;
}

// Get the distance between two gps coords
function getDistance(gps1, gps2){
    return Math.sqrt(Math.pow(gps1.long - gps2.long, 2) + Math.pow(gps1.lat - gps2.lat, 2));
}

// Check if a gps coord is at a given location
function atLocation(location, gps_coords, locations){
    var index = locations.findIndex(loc => loc.location == location);
    if(index == -1) {
        return false;
    } else {
        diffSpace = getDistance(locations[index], gps_coords);
        if(diffSpace < 0.001){
            return true;
        } 
    }
    return false;
}

// Find the stops done from the gps data
function findStops(gpsData){
    var stops = [];
    var diffTime, diffSpace;
    var sameStopAsBefore = false;

    for (var i = 0; i < gpsData.length-1; i++) {
        diffTime = d3.timeMinute.count( gps_format(gpsData[i].Timestamp), gps_format(gpsData[i+1].Timestamp));
        if ( diffTime >= 3) {
            sameStopAsBefore = false;
            if(stops.length > 0){
                diffSpace = getDistance(gpsData[i], stops[stops.length-1]);
                if(diffSpace < 0.001){
                    sameStopAsBefore = true;
                    stops[stops.length-1].stopTime = stops[stops.length-1].stopTime + diffTime;
                }
            }
            if(!sameStopAsBefore){
                var stop = {
                    timestamp : gpsData[i].Timestamp,
                    id : gpsData[i].id,
                    lat : gpsData[i].lat,
                    long : gpsData[i].long,
                    stopTime : diffTime
                }
                stops.push(stop);
            }
        }

    }

    var i = gpsData.length-1;
    var diffTime = d3.timeMinute.count( gps_format(gpsData[i].Timestamp), gps_format("01/20/2014 23:59:59"));
    var stop = {
        timestamp : gpsData[i].Timestamp,
        id : gpsData[i].id,
        lat : gpsData[i].lat,
        long : gpsData[i].long,
        stopTime : diffTime
    }

    stops.push(stop)
    return stops;
}