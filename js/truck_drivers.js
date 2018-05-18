// Array to keep info for all trucks
var trucks = [{id: "101", gps: [], stops: [], routes: [], drivers_routes: []}, {id: "104", gps: [], stops: [], routes: [], drivers_routes: []}, {id: "105", gps: [], stops: [], routes: [], drivers_routes: []}, {id: "106", gps: [], stops: [], routes: [], drivers_routes: []}, {id: "107", gps: [], stops: [], routes: [], drivers_routes: []}];

// Formats for time
var gps_format = d3.timeParse('%m/%d/%Y %H:%M:%S');
var transaction_format = d3.timeParse('%m/%d/%Y %H:%M');

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
            }
        }
    }

    // Add who is driving the truck during the routes (with a check if they stop 
    // somewhere without buying anything)
    for(var i = 0; i < trucks.length; i++){
        for(var j = 0; j < trucks[i].routes.length; j++){
            trucks[i].drivers_routes.push(checkWhoDrivesTruck(trucks[i].routes[j], truckers, locations));
        }
    }

    var suspicious_routes = [];
    for(var i = 0; i < trucks.length; i++){
        for(var j = 0; j < trucks[i].drivers_routes.length; j++){
            var drivers_routes = trucks[i].drivers_routes[j];
            if(drivers_routes.length > 1 || drivers_routes[0].nrOfStopsWithoutTrans > 0){     
                suspicious_routes.push({drivers_routes: drivers_routes, routes: trucks[i].routes[j]});
            }
        }
    }
}

// Get the driver of a chosen truck during a time interval 
// or a single time (getDriver(truckID, start_time) will work as well)
function getDriver(truckID, start_time, end_time){
    if(end_time == "undefined"){
        end_time = start_time
    }

    var ind = trucks.findIndex(truck => truck.id == truckID);
    start_time = gps_format(start_time);
    end_time = gps_format(end_time);

    var drivers = []; 
    var first_stop, last_stop, stop, driver, name;
    for(var i = 0; i < trucks[ind].routes.length; i++){
        first_stop = gps_format(trucks[ind].routes[i][0].timestamp);
        last_stop = gps_format(trucks[ind].routes[i][trucks[ind].routes[i].length-1].timestamp);
        driver = trucks[ind].drivers_routes[i];
        name = driver.FirstName + " " + driver.LastName;
        
        if(start_time >= first_stop && end_time <= last_stop){ 
            if(!drivers.find(driver => driver == name)) 
                drivers.push(name);
            break;
        } else if (start_time >= first_stop && start_time <= last_stop || 
                    end_time >= first_stop && end_time <= last_stop){
            for(var j = 0; j < trucks[ind].routes[i].length; j++){ 
                stop = gps_format(trucks[ind].routes[i][j].timestamp);
                if(stop >= start_time && stop <= end_time ){
                    if(!drivers.find(driver => driver == name)) 
                        drivers.push(name)
                }
            }
        }        
    }
    return drivers;
}

// Check which driver that drivers a given route for a truck
function checkWhoDrivesTruck(route, truckers, locations){
    var places = [];
    for(var i = 0; i < route.length; i++){
        places.push({location: getLocation(route[i], locations), timestamp: route[i].timestamp, stopTime: route[i].stopTime});
    }

    var start_time = gps_format(route[0].timestamp);
    var end_time = gps_format(route[route.length-1].timestamp);

    var place_counter;
    var possible_trucker = [];
    for(var i = 0; i < truckers.length; i++){
        place_counter = 0;
        possible_trucker[i] = [];
        for(var j = 0; j < truckers[i].Transactions.length; j++){
            var time = transaction_format(truckers[i].Transactions[j].Timestamp);
            if(time > start_time && time < end_time){
                while(places[place_counter].location == -1){
                    place_counter++;
                }
                if(places[place_counter].location == truckers[i].Transactions[j].Location){
                    possible_trucker[i].push(truckers[i].Transactions[j].Location);
                    place_counter++;
                }
            }
            
        }
    }
    var empty = 0;
    for(var i = 0; i < possible_trucker.length; i++){
        if(possible_trucker[i].length == 0){
            empty++;
        } else {
            break;
        }
    }

    var most_possible_trucker = [];  

    if(empty == possible_trucker.length){
        most_possible_trucker.push({
            FirstName: -1,
            LastName: -1,
            nrOfStopsWithoutTrans: places.length,
            placesWithoutTrans: places
        });
    } else {
        var trucker_index = getBestMatch(possible_trucker, places.length);

        for(var i = 0; i < trucker_index.length; i++){
            var no_trans_places = [];
            var trans_places = [];
            for(var j = 0; j < truckers[trucker_index[i]].Transactions.length; j++){
                var t = truckers[trucker_index[i]].Transactions[j];
                var time = transaction_format(t.Timestamp);
                if(time > start_time && time < end_time ){
                    trans_places.push(t);
                }
            }

            for(var k = 0; k < places.length; k++){
                if(places[k].location != "GAStech" && !trans_places.find(place => place.Location == places[k].location)){
                    no_trans_places.push(places[k]);
                }
            }

            most_possible_trucker.push({
                FirstName: truckers[trucker_index[i]].FirstName,
                LastName: truckers[trucker_index[i]].LastName,
                nrOfStopsWithoutTrans: no_trans_places.length,
                placesWithoutTrans: no_trans_places
            }); 
        }
    }

    return most_possible_trucker;
}

// To get the best matching trucker, used to check which driver drives the trucks
function getBestMatch(trucker, totalStops){
    var max_index = 0;
    for(var i = 1; i < trucker.length; i++){
        if(trucker[i].length > trucker[max_index].length){
            max_index = i;
        }
    }
    var index = [];
    index.push(max_index);
    for(var i = 0; i < trucker.length; i++){
        if(i != max_index && trucker[i].length == trucker[max_index].length){
            index.push(i);
        }
    }

    return index;
}

// Get which location the coordinates are at, returns -1 if coordinates 
// are on a place that has not been set in "locations.csv"
function getLocation(coord, locations){
    var loc;
    for(var i = 0; i < locations.length; i++){
        loc = {lat: locations[i].lat, long: locations[i].long};
        if(getDistance(loc, coord) < 0.001){
            return locations[i].location;
        }
    }
    return "-1";
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

// Get the gps route for a given truck, v.1
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

// Get the gps route for a given truck, v.2
function getGpsOfTruckAtInterval(id, start_time, end_time){
    var ind = trucks.findIndex(truck => truck.id == id);
    start_time = gps_format(start_time);
    end_time = gps_format(end_time);

    var gps = [];
    var timestamp;
    for(var i = 0; i < trucks[ind].gps.length; i++){
        timestamp = gps_format(trucks[ind].gps[i].Timestamp);
        if(timestamp > start_time && timestamp < end_time){
            gps.push(trucks[ind].gps[i]);
        }
    }
    return gps;
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