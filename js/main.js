d3.queue()
	.defer(d3.csv, "data/gps.csv")
	.defer(d3.csv, "data/cc_data.csv")
	.defer(d3.csv, "data/car-assignments.csv")
	.defer(d3.csv, "data/loyalty_data.csv")
	.defer(d3.csv, "data/location.csv")
    .await(analyze);

// Kolla upp om folk är på samma ställe. 
// Har någon lånat ut sitt loyalty card till någon? (De kan vara på samma ställe)

function analyze(error, gps, ccData, carAssign, loyalty, locationData){
    if (error) {
        console.log(error);
    }

    var persons = get_persons(gps, carAssign, ccData, locationData);
    find_general_person(persons);
    //check_truckers(gps, persons, locationData)

    getMap(gps, locationData, ccData, carAssign);
}
