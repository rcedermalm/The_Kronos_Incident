
function getMap(gps, locationData, ccData ){
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

        var idRoute = getCarRoute(1, gps, 1, gps[0].Timestamp, "01/06/2014 22:00:00");//,gps[gps.length-1].Timestamp);
        var stops = findStops(idRoute);
        //var destinations = findDestinations(stops, ccData, carAssign);
        plotGps(idRoute, 5);
        plotStops(stops);
        plotLocations(locationData);

        var tra = getTransactions("Lucas", "Alcazar", ccData, gps[0].Timestamp,  "01/06/2014 22:00:00");
        var shoping = stopAndTransaction(stops, tra);
        //plotLocations(shoping);
        var noShoping = stopAndNoTransaction(stops, tra);
        plotLocations(noShoping);

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

    function getCarRoute(id, data, res, start, end){
        var a =[];
        var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
        var time = format(start);
        end = format(end);
        var i = 0;

        while (time < end ) {
            if (data[i].id == id) {
                var b = data[i];
                a.push(b);
            }
            i+=res;
            time = format(data[i].Timestamp);
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

    function plotStops(stops){
        map.selectAll("circles")
        .data(stops).enter()
        .append("circle")
        .attr("cx", function (d) { return projection([d.long, d.lat])[0]; })
        .attr("cy", function (d) { return projection([d.long, d.lat])[1]; })
        .attr("r", "4px")
        .attr("fill", "blue");
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
       div.html(d.location /*+ "<br/>" + d.close*/)
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
        console.log(locations);

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
  		console.log(positions);
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
  		console.log(positions);
  		return positions ;
  	}

    function getTransactions(FirstName, LastName ,ccData, startDate, endDate){

  		var format = d3.timeParse('%m/%d/%Y %H:%M:%S');
  		var formatCC = d3.timeParse('%m/%d/%Y %H:%M'); // 1/6/2014 7:28
  		transactions = [];
  		for (var i = 0; i < ccData.length; i++) {
  			//console.log(  d3.timeMinute.count( format(startDate), formatCC(ccData[i].timestamp)));
  			if ( d3.timeMinute.count( format(startDate), formatCC(ccData[i].timestamp)) >= 0 && d3.timeMinute.count(formatCC(ccData[i].timestamp), format(endDate)) >= 0) {
  				if (ccData[i].FirstName == FirstName && ccData[i].LastName == LastName) {
  					transactions.push(ccData[i]);
  				}
  			}
  			else {
  				break;
  			}
  		}
  		return transactions;
  	}
}
