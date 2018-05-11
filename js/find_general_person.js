// Global arrays telling what type each location is.
var types_of_locations = ["Airport", "Café", "Entertainment", "Hotel", "Restaurant", "Shop", "Other"];
var airport = ["Abila Airport"];
var cafe = ["Brew've Been Served", "Hallowed Grounds", "Coffee Cameleon", "Katerina’s Café", "Gelatogalore",
            "Bean There Done That", "Jack's Magical Beans", "Brewed Awakenings", "Coffee Shack", "Kalami Kafenion"];
var entertainment = ["Desafio Golf Course", "Ahaggo Museum"];
var hotel = ["Chostus Hotel"];
var restaurant = ["Hippokampos", "Guy's Gyros", "Ouzeri Elian"];
var shop = ["Kronos Mart", "General Grocer", "Daily Dealz", "Albert's Fine Clothing", "Octavio's Office Supplies",
            "Shoppers' Delight", "Frydos Autosupply n' More", "U-Pump", "Frank's Fuel"];
var other = ["Carlyle Chemical Inc.", "Kronos Pipe and Irrigation", "Nationwide Refinery", "Abila Zacharo",
             "Stewart and Sons Fabrication", "Roberts and Sons", "Maximum Iron and Steel", "Abila Scrapyard"];


function find_general_person(persons){
    var format = d3.timeParse('%m/%d/%Y %H:%M');
    var hour, day, transaction, name;
    var mornings = [{total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}];
    var days = [{total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}];
    var evenings = [{total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}];
    var nights = [{total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}];
    var weekends = [{total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}, {total: 0, popular: [], persons: []}];

    for(var i = 0; i < persons.length; i++){
        name = persons[i].FirstName + " " + persons[i].LastName;
        for(var j = 0; j < persons[i].Transactions.length; j++){
            transaction = persons[i].Transactions[j];
            hour = format(transaction.Timestamp).getHours();
            day = format(transaction.Timestamp).getDay();

            if(day >= 1 && day <= 5){
                if(hour >= 6 && hour < 10){
                    addToLocation(mornings, transaction.Location, name );
                } else if (hour >= 10 && hour < 18){
                    addToLocation(days, transaction.Location, name );
                } else if (hour >= 18 && hour < 22){
                    addToLocation(evenings, transaction.Location, name );
                } else {
                    addToLocation(nights, transaction.Location, name );
                }
            } else {
                addToLocation(weekends, transaction.Location, name );
            }
        
        }  
    }

    for(var i = 0; i < 7; i++){
        mornings[i].total = (((mornings[i].total/10)/persons.length)*100).toFixed(2);
        mornings[i].popular.sort(function(a, b){return b.visits - a.visits});
        days[i].total = (((days[i].total/10)/persons.length)*100).toFixed(2);
        days[i].popular.sort(function(a, b){return b.visits - a.visits});
        evenings[i].total = (((evenings[i].total/10)/persons.length)*100).toFixed(2);
        evenings[i].popular.sort(function(a, b){return b.visits - a.visits});
        nights[i].total = (((nights[i].total/10)/persons.length)*100).toFixed(2);
        nights[i].popular.sort(function(a, b){return b.visits - a.visits});
        weekends[i].total = (((weekends[i].total/10)/persons.length)*100).toFixed(2);
        weekends[i].popular.sort(function(a, b){return b.visits - a.visits});

    }

    var people_who_deviate = find_people_who_deviate(mornings, days, evenings, nights);
    var deviate_persons = [];

    for(var i = 0; i < people_who_deviate.length; i++){
        var name = people_who_deviate[i].name.split(" ");
        var index = persons.findIndex(person => person.FirstName == name[0] && person.LastName == name[1]);
        if(index != -1){
            deviate_persons.push(persons[index]);
        }
    }
    //console.log(deviate_persons)
    add_findings_to_div(mornings, days, evenings, nights, weekends);
}

function find_people_who_deviate(mornings, days, evenings, nights){
    var weird_places_mornings = find_the_types_of_places_that_differ(mornings);
    var weird_places_days = find_the_types_of_places_that_differ(days);
    var weird_places_evenings = find_the_types_of_places_that_differ(evenings);
    var weird_places_nights = find_the_types_of_places_that_differ(nights);

    var people_who_deviate = [];
    addToDeviations(people_who_deviate, mornings, weird_places_mornings);
    addToDeviations(people_who_deviate, days, weird_places_days);
    addToDeviations(people_who_deviate, evenings, weird_places_evenings);
    addToDeviations(people_who_deviate, nights, weird_places_nights);
    
    people_who_deviate.sort(function(a, b){return b.nrOfDeviations - a.nrOfDeviations});
    
    return people_who_deviate;
}

function addToDeviations(people_who_deviate, location, weird_places){
    var index;
    for(var i = 0; i < weird_places.length; i++){
        for(var j = 0; j < location[weird_places[i]].persons.length; j++){
            index = people_who_deviate.findIndex(person => person.name == location[weird_places[i]].persons[j])
            if(index == -1){
                people_who_deviate.push({
                    name: location[weird_places[i]].persons[j],
                    nrOfDeviations: 1
                });
            } else {
                people_who_deviate[index].nrOfDeviations++;
            }
        }
    }

}

function find_the_types_of_places_that_differ(location){
    var weird_places = [];

    for(var i = 0; i < location.length; i++){
        if(location[i].total > 0 && location[i].total < 5){
            weird_places.push(i);
        }
    }
    return weird_places;
}

function add_findings_to_div(morning, day, evening, night, weekend){
    var maxMorning = findIndexOfMax(morning, 1);
    var maxDay = findIndexOfMax(day, 1);
    var maxEvening = findIndexOfMax(evening, 1);
    var maxNight = findIndexOfMax(night, 1);
    var maxWeekend = findIndexOfMax(weekend, 1);
    var maxMorningNext = findIndexOfMax(morning, 2);
    var maxDayNext = findIndexOfMax(day, 2);
    var maxEveningNext = findIndexOfMax(evening, 2);
    var maxNightNext = findIndexOfMax(night, 2);
    var maxWeekendNext = findIndexOfMax(weekend, 2);
    
    var arr = [];
    arr.push("==============================================================");
    arr.push("GENERAL PERSON");
    arr.push("Morning (Mon-Fri 06:00 - 09:59)");
    arr.push("* " + morning[maxMorning].total + "% goes to a " + types_of_locations[maxMorning] + ", ex. " + getTopThree(morning[maxMorning].popular));
    arr.push("* " + morning[maxMorningNext].total + "% goes to a " + types_of_locations[maxMorningNext] + ", ex. " + getTopThree(morning[maxMorningNext].popular));
    arr.push("Day (Mon-Fri 10:00 - 17:59)");
    arr.push("* " + day[maxDay].total + "% goes to a " + types_of_locations[maxDay] + ", ex. " + getTopThree(day[maxDay].popular));
    arr.push("* " + day[maxDayNext].total + "% goes to a " + types_of_locations[maxDayNext] + ", ex. " + getTopThree(day[maxDayNext].popular));
    arr.push("Evening (Mon-Fri 18:00 - 21:59)");
    arr.push("* " + evening[maxEvening].total + "% goes to a " + types_of_locations[maxEvening] + ", ex. " + getTopThree(evening[maxEvening].popular));
    arr.push("* " + evening[maxEveningNext].total + "% goes to a " + types_of_locations[maxEveningNext] + ", ex. " + getTopThree(evening[maxEveningNext].popular));
    arr.push("Night (Mon-Fri 22:00 - 05:59)");
    arr.push("* " + night[maxNight].total + "% goes to a " + types_of_locations[maxNight] + ", ex. " + getTopThree(night[maxNight].popular));
    arr.push("* " + night[maxNightNext].total + "% goes to a " + types_of_locations[maxNightNext] + ", ex. " + getTopThree(night[maxNightNext].popular));
    arr.push("Weekend (Saturday - Sunday)");
    arr.push("* " + weekend[maxWeekend].total + "% goes to a " + types_of_locations[maxWeekend] + ", ex. " + getTopThree(weekend[maxWeekend].popular));
    arr.push("* " + weekend[maxWeekendNext].total + "% goes to a " + types_of_locations[maxWeekendNext] + ", ex. " + getTopThree(weekend[maxWeekendNext].popular));
    arr.push("==============================================================");

    d3.select('#general-person')
    .append('div')
    .html(arr.join('<br/>'));
}

function getTopThree(locations){
    var theTop = "";
    var end = 3;
    if(locations.length < 3){
        end = locations.length;
    }
    
    for(var i = 0; i < end; i++){
        theTop = theTop + locations[i].name;
        if(i != end-1){
            theTop = theTop + ", ";
        }
    }
    return theTop;
}

function findIndexOfMax(timeInterval, degree){
    var index = 0;
    for(var i = 1; i < timeInterval.length; i++){
        if(timeInterval[i].total > timeInterval[index].total){
            index = i;
        }
    }
    if(degree == 1)
        return index;
    
    var index2 = 0;
    if(index == 0){
        index2 = 1;
    }

    for(var i = 1; i < timeInterval.length; i++){
        if(i != index && timeInterval[i].total > timeInterval[index2].total){
            index2 = i;
        }
    }
    return index2;
    
} 

function addToLocation(timeInterval, location, nameOfPerson ){
    var typeIndex = get_type_of_location(location);
    var popIndex = (timeInterval[typeIndex].popular).findIndex(loc => loc.name == location);

    timeInterval[typeIndex].total++;
    timeInterval[typeIndex].persons.push(nameOfPerson);

    if(popIndex == -1){
        timeInterval[typeIndex].popular.push({
            name: location,
            visits: 1
        });
    } else {
        timeInterval[typeIndex].popular[popIndex].visits++;
    }
}

function get_type_of_location(location){
    if(airport.findIndex(loc => loc == location) != -1){ // Airport
        return 0;
    } else if(cafe.findIndex(loc => loc == location) != -1){ // Cafe
        return 1;
    } else if(entertainment.findIndex(loc => loc == location) != -1){ // Entertainment
        return 2;
    } else if(hotel.findIndex(loc => loc == location) != -1){ // Hotel
        return 3;
    } else if(restaurant.findIndex(loc => loc == location) != -1){ // Restaurant
        return 4;
    } else if(shop.findIndex(loc => loc == location) != -1){ // shop
        return 5;
    } else if(other.findIndex(loc => loc == location) != -1){ // other
        return 6;
    } else {
        return 7;
    }

}