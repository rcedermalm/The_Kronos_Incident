
function check_truckers(gps, persons, locations){
    var truckers = [];
    for(var i = 0; i < persons.length; i++){
        if(persons[i].CarID == "-2"){
            truckers.push(persons[i]);
        }
    }

    var index;
    var trucks_gps = [{id: "101", gps: [], stops: []}, {id: "104", gps: [], stops: []}, {id: "105", gps: [], stops: []}, {id: "106", gps: [], stops: []}, {id: "107", gps: [], stops: []}];
    for(var i = 0; i < gps.length; i++){
        if(parseInt(gps[i].id) > 35) {
            index = trucks_gps.findIndex(truck => truck.id == gps[i].id);
            trucks_gps[index].gps.push(gps[i]);
        }
    }

    for(var i = 0; i < trucks_gps.length; i++){
        trucks_gps[i].stops = findStops(trucks_gps[i].gps);
    }
/*    var t_format = d3.timeParse('%m/%d/%Y %H:%M');
    var gps_format = d3.timeParse('%m/%d/%Y %H:%M:%S');

    //for(var i = 0; i < 1; i++){//truckers.length; i++){

        //for(var j = 0; j < truckers[2].Transactions.length; j++){
            var jek = getTruckInUse(trucks_gps, truckers[2].Transactions[2], locations )
        //}
    //}

    var stoper = [];
    //stoper.push({lat: "36.04805407", long: "24.87957629"}); // Gastech?
    //stoper.push({lat: "36.05094715", long: "24.82592775"});
    stoper.push({lat: "36.0480278", long: "24.8795769"})

    var stoop = []
    for(var i = 7; i < 8; i++){
        stoop.push(trucks_gps[0].stops[i]);
    }

    return jek;*/
}

function getTruckInUse(trucks, transaction, locations){
    var t_format = d3.timeParse('%m/%d/%Y %H:%M');
    var gps_format = d3.timeParse('%m/%d/%Y %H:%M:%S');
    var t_time = t_format(transaction.Timestamp);
    var t_location = transaction.Location;
    var index = locations.findIndex(loc => loc.location == t_location);
    var t_gps = {long: locations[index].long, lat: locations[index].lat};
    var first_stops = [];
    var diffTime, diffSpace;
    for(var i = 0; i < trucks.length; i++){
        for(var j = 0; j < trucks[i].stops.length; j++){
            diffTime = d3.timeMinute.count( t_time, gps_format(trucks[i].stops[j].timestamp))
            if(diffTime > 0 && diffTime < trucks[i].stops[j].stopTime){
                diffSpace = Math.sqrt(Math.pow(trucks[i].stops[j].long - t_gps.long, 2) + Math.pow(trucks[i].stops[j].lat - t_gps.lat, 2));
                if(diffSpace < 0.001){
                    //console.log("time [stop, trans]", gps_format(trucks[i].stops[j].timestamp),t_time,  "diff", diffTime);
                    //console.log(trucks[i])
                    //console.log(trucks[i].stops[j])
                    first_stops.push(trucks[i].stops[j]);
                }
            }
        }
    }
    console.log("=====================================")
    return first_stops;

    // -------------------------------------------------------------- CHECK GPS COORDINATE FOR THE PLACES AND COMPARE IT AND TIMESTAMP WITH TRUCKS

}

function findStops(gpsData){
    var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
    var stops = [];
    var diffTime, diffSpace;
    var sameStopAsBefore = false;

    for (var i = 0; i < gpsData.length-1; i++) {
        diffTime = d3.timeMinute.count( format(gpsData[i].Timestamp), format(gpsData[i+1].Timestamp));
        if ( diffTime >= 5 ) {
            sameStopAsBefore = false;

            if(stops.length > 0){
                diffSpace = Math.sqrt(Math.pow(gpsData[i].long - stops[stops.length-1].long, 2) + Math.pow(gpsData[i].lat - stops[stops.length-1].lat, 2));
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
    return stops;
}