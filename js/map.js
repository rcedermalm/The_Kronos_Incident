
function getMap(gps, locationData, ccData, carAssign ){
  var projection = d3
  .geoMercator()
  .scale(300000)
  .rotate([0.0, 0.0, 0])
  .center([24.86, 36.06]);

  var path = d3.geoPath().projection(projection);　

  var map = d3.select("#map")
  .append("svg")
  .attr("width", 800)
  .attr("height", 500);

  // tooltip
  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  d3.json("data/Abila.geojson", drawMaps);

  function drawMaps(geojson) {
    map.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "green")
    .attr("fill-opacity", 0)
    .attr("stroke", "#000000");

    var startD = "01/6/2014 07:09:01";
    var endD = "01/19/2014 20:56:55";

    var carID = 1;
    var d = getData(gps);
    var idRoute = getCarRoute(carID, d[carID-1], 1, startD,endD);
    //var stops = findStops(idRoute);
    var stops = getAllStops(d);

    //stops = periodOfTimeRoute(carID, stops, 20, 05);
    //var destinations = findDestinations(stops, ccData, carAssign);
    //plotGps(d[carID-1], 1);
    plotGps(idRoute, 1);
    plotStops(stops[carID-1]);


    var first = getFirstname(carID, carAssign);
    var last = getLastname(carID, carAssign);

    var tra = getTransactions(first,last, ccData, startD,  endD);

    var shoping = stopAndTransaction(stops[carID-1], tra);
    //plotLocations(shoping);
    var noShoping = stopAndNoTransaction(stops[carID-1], tra);
    //plotLocations(noShoping);
    var shopname = "Daily Dealz";
    //var shops = getAllShopLocation(gps, carAssign, shopname);
    //plotLocations(shops);
    //var av = avLocation(shops);

  }

  function findDestinations(stops, ccData, carAssign){
    var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
    var formatCC = d3.timeParse('%m/%d/%Y %H:%M'); // 1/6/2014 7:28
    var carId = stops[0].id;
    var carAssignId = carAssign.findIndex(car => car.CarID==carId);
    var person = {
      FirstName : carAssign[carAssignId].FirstName,
      LastName : carAssign[carAssignId].LastName,
      id : carId
    };

    var destinations = [];
    var ind = -1;

    for (var i = 0; i < ccData.length; i++) {
      if (ccData[i].FirstName == person.FirstName && ccData[i].LastName == person.LastName ) {

        ind = stops.findIndex(stop => Math.abs(d3.timeMinute.count( format(stop.Timestamp), formatCC(ccData[i].timestamp))) <= stop.stopTime);

        if (ind != -1) {
          var destination = {
            location : ccData[i].location,
            lat : stops[ind].lat,
            long : stops[ind].long
          }
          destinations.push(destination)
        }
      }
    }
    return destinations;

  }

  function plotGps(gps , res){
    var data = [];
    if (res != 1) {
      for (var i = 0; i < gps.length; i+=2) {
        data.push(gps[i]);
      }
    }
    else {
      data = gps;
    }


    // add circles to svg
    map.selectAll("circles")
    .data(data).enter()
    .append("circle")
    .attr("cx", function (d) { return projection([d.long, d.lat])[0]; })
    .attr("cy", function (d) { return projection([d.long, d.lat])[1]; })
    .attr("r", "1px")
    .attr("fill", "red");
  }

  function getData(gps){
    var ind;
    var a = [];
    for (var i = 0; i < 35; i++) {
      a.push([]);
    }

    for (var i = 0; i < gps.length; i++) {
      if (parseInt(gps[i].id) < 36) {
        ind = parseInt(gps[i].id)-1;

        a[ind].push(gps[i])
      }
    }
    return a;
  }

  function getCarRoute(id, data, res, start, end){
    var a =[];
    var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
    var time = format(start);
    end = format(end);
    start = format(start);
    for (var i = 0; i < data.length; i++) {
      if (data[i].id == id && format(data[i].Timestamp) > start && format(data[i].Timestamp) < end) {
        a.push(data[i]);
      }
    }

return a;
}

function periodOfTimeRoute(id, stops, startHour, endHour){
  var a =[];
  if (startHour>endHour) {
    a = periodOfTimeRoute(id, stops, startHour, 23)
    startHour=0;
  }


  var format = d3.timeParse('%m/%d/%Y %H:%M:%S');

  var i = 0;
  var hour;

  for (var i = 0; i < stops.length; i++) {
    hour = format(stops[i].Timestamp).getHours();
    if ( startHour <= hour && hour <= endHour && stops[i].id == id ) {
      a.push(stops[i]);
    }
  }

  return a;
}


function findStops(gpsData){
  var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
  var stops = [];
  var dif = 0;
  for (var i = 0; i < gpsData.length-1; i++) {

    dif = d3.timeMinute.count( format(gpsData[i].Timestamp), format(gpsData[i+1].Timestamp));

    if ( dif >= 5  ) {
      var stop = {
        Timestamp : gpsData[i].Timestamp,
        id : gpsData[i].id,
        lat : gpsData[i].lat,
        long : gpsData[i].long,
        stopTime : dif
      }
      stops.push(stop);
    }

  }
  return stops;
}
function getAllStops(gps){
  var ind;
  var a = [];
  for (var i = 0; i < gps.length; i++) {
    a.push(findStops(gps[i]));
  }
  return a;
}

function plotStops(stops){
  map.selectAll("circles")
  .data(stops).enter()
  .append("circle")
  .attr("cx", function (d) { return projection([d.long, d.lat])[0]; })
  .attr("cy", function (d) { return projection([d.long, d.lat])[1]; })
  .attr("r", "4px")
  .attr("fill", "blue");
}

function plotLocation(location){
  // add circles to svg
  map.selectAll("circles")
  .data(location)
  .append("circle")
  .attr("cx", function (d) { return projection([d.long, d.lat])[0]; })
  .attr("cy", function (d) { return projection([d.long, d.lat])[1]; })
  .attr("r", "3px")
  .attr("fill", "yellow")
  .on("mouseover", function(d) {
    console.log(d.location);
    div.transition()
    .duration(200)
    .style("opacity", .9);
    div.html(d.lat /*+ "<br/>" + d.close*/)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
    div.transition()
    .duration(500)
    .style("opacity", 0);
  });
}

function plotLocations(locations){
  // add circles to svg
  map.selectAll("circles")
  .data(locations).enter()
  .append("circle")
  .attr("cx", function (d) { return projection([d.long, d.lat])[0]; })
  .attr("cy", function (d) { return projection([d.long, d.lat])[1]; })
  .attr("r", "3px")
  .attr("fill", "green")
  .on("mouseover", function(d) {
    console.log(d.location);
    div.transition()
    .duration(200)
    .style("opacity", .9);
    div.html(d.lat /*+ "<br/>" + d.close*/)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
    div.transition()
    .duration(500)
    .style("opacity", 0);
  });
}

function avLocation(locations){
  var la = 0;
  var lon = 0;
  for (var i = 0; i < locations.length; i++) {
    la = la + parseFloat(locations[i].lat);
    lon = lon + parseFloat(locations[i].long);
  }

  la = la/locations.length;
  lon = lon/locations.length;


  var location = {
    location : locations[0].location,
    lat : la.toString(),
    long : lon.toString()
  }
  console.log(location);
  return location;

}

function stopAndTransaction(stops, transactions){
  var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
  var formatCC = d3.timeParse('%m/%d/%Y %H:%M'); // 1/6/2014 7:28


  var cc =[];
  var positions = [];
  var ind = -1;

  for (var i = 0; i < stops.length; i++) {
    ind = transactions.findIndex(transaction => (d3.timeMinute.count( format(stops[i].Timestamp), formatCC(transaction.timestamp))) <= stops[i].stopTime && (d3.timeMinute.count( format(stops[i].Timestamp), formatCC(transaction.timestamp))) >=0 );
    if (ind != -1) {
      cc.push(transactions[ind]);
      positions.push(stops[i]);
    }

  }

  return positions ;
}

function stopAndNoTransaction(stops, transactions){
  var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
  var formatCC = d3.timeParse('%m/%d/%Y %H:%M'); // 1/6/2014 7:28


  var x =[];
  var positions = [];
  var ind = -1;

  for (var i = 0; i < stops.length; i++) {
    ind = transactions.findIndex(transaction => (d3.timeMinute.count( format(stops[i].Timestamp), formatCC(transaction.timestamp))) <= stops[i].stopTime && (d3.timeMinute.count( format(stops[i].Timestamp), formatCC(transaction.timestamp))) >=0 );
    if (ind == -1) {
      //x.push(transactions[ind]);
      positions.push(stops[i]);
    }

  }

  return positions ;
}

function getTransactions(FirstName, LastName ,ccData, startDate, endDate){
  var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
  var formatCC = d3.timeParse('%m/%d/%Y %H:%M'); // 1/6/2014 7:28
  transactions = [];
  for (var i = 0; i < ccData.length; i++) {
    if ( d3.timeMinute.count( format(startDate), formatCC(ccData[i].timestamp)) >= 0 && d3.timeMinute.count(formatCC(ccData[i].timestamp), format(endDate)) >= 0) {
      if (ccData[i].FirstName == FirstName && ccData[i].LastName == LastName) {
        transactions.push(ccData[i]);
      }
    }
  }
  return transactions;
}

function getFirstname(id, carAssign){
  var ind = carAssign.findIndex(name => name.CarID == id);
  if (ind != -1) {
    return carAssign[ind].FirstName;
  }
}

function getLastname(id, carAssign){
  var ind = carAssign.findIndex(name => name.CarID == id);
  if (ind != -1) {
    return carAssign[ind].LastName;
  }
}

function getAllShopLocation(gps, carAssign, shop){
  var locations = [];
  var startD = gps[0].Timestamp;
  var endD = gps[gps.length-1].Timestamp;
  for (var id = 0; id < 35; id++) {
    var idRoute = getCarRoute(id, gps, 1, startD,endD);
    var stops = findStops(idRoute);
    var tra = getTransactions(getFirstname(id,carAssign),getLastname(id,carAssign), ccData, startD,  endD);
    var loc = transactionsAt(stops, tra, shop);
    if (loc.length >0) {
      for (var i = 0; i < loc.length; i++) {
        locations.push(loc[i]);
      }
    }

  }
  return locations;
}

function transactionsAt(stops, transactions, shop){
  var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
  var formatCC = d3.timeParse('%m/%d/%Y %H:%M'); // 1/6/2014 7:28


  var cc =[];
  var positions = [];
  var ind = -1;

  for (var i = 0; i < stops.length; i++) {
    ind = transactions.findIndex(transaction => (d3.timeMinute.count( format(stops[i].Timestamp), formatCC(transaction.timestamp))) <= stops[i].stopTime && (d3.timeMinute.count( format(stops[i].Timestamp), formatCC(transaction.timestamp))) >=0 );
    if (ind != -1 && transactions[ind].location == shop) {
      cc.push(transactions[ind]);
      positions.push(stops[i]);
    }

  }
  return positions ;
}

function atAPosition(stops, lat, long, radius){
  var xd;
  var yd;
  var dist;
  var s = [];
  for (var i = 0; i < stops.length; i++) {
    for (var z = 0; z < stops[i].length; z++) {
    xd = stops[i][z].lat - lat;
    yd = stops[i][z].long - long;
    dist = Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2));
    if (dist < radius) {
      s.push(stops[i][z])

    }
  }
  }
  console.log(s);
  return s;
}
}
