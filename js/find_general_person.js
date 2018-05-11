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
    var hour, day, transaction;
    var mornings = [{total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}];
    var days = [{total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}];
    var evenings = [{total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}];
    var nights = [{total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}];
    var weekends = [{total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}, {total: 0, popular: []}];

    for(var i = 0; i < persons.length; i++){
        for(var j = 0; j < persons[i].Transactions.length; j++){
            transaction = persons[i].Transactions[j];
            hour = format(transaction.Timestamp).getHours();
            day = format(transaction.Timestamp).getDay();

            if(day >= 1 && day <= 5){
                if(hour >= 6 && hour < 10){
                    addToLocation(mornings, transaction.Location );
                } else if (hour >= 10 && hour < 18){
                    addToLocation(days, transaction.Location );
                } else if (hour >= 18 && hour < 22){
                    addToLocation(evenings, transaction.Location );
                } else {
                    addToLocation(nights, transaction.Location );
                }
            } else {
                addToLocation(weekends, transaction.Location );
            }
        
        }  
    }

    for(var i = 0; i < 7; i++){
        mornings[i].total = Math.floor(((mornings[i].total/10)/persons.length)*100);
        mornings[i].popular.sort(function(a, b){return b.visits - a.visits});
        days[i].total = Math.floor(((days[i].total/10)/persons.length)*100);
        days[i].popular.sort(function(a, b){return b.visits - a.visits});
        evenings[i].total = Math.floor(((evenings[i].total/10)/persons.length)*100);
        evenings[i].popular.sort(function(a, b){return b.visits - a.visits});
        nights[i].total = Math.floor(((nights[i].total/10)/persons.length)*100);
        nights[i].popular.sort(function(a, b){return b.visits - a.visits});
        weekends[i].total = Math.floor(((weekends[i].total/10)/persons.length)*100);
        weekends[i].popular.sort(function(a, b){return b.visits - a.visits});

    }

    add_findings_to_div(mornings, days, evenings, nights, weekends);
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

function addToLocation(timeInterval, location ){
    var typeIndex = get_type_of_location(location);
    var popIndex = (timeInterval[typeIndex].popular).findIndex(loc => loc.name == location);

    timeInterval[typeIndex].total++;

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