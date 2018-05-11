function get_persons(gps_data, car_data, buy_data, locations_data){
    var persons = [];

    for(var i = 0; i < buy_data.length; i++) {
        var person_index = persons.findIndex(person => person.FirstName == buy_data[i].FirstName && person.LastName == buy_data[i].LastName);
        if(person_index != -1 ){
            persons[person_index].Transactions.push({
                Timestamp: buy_data[i].timestamp,
                Location: buy_data[i].location,
                Price: buy_data[i].price
            });
        } else {
            var car_index = car_data.findIndex(car => car.FirstName == buy_data[i].FirstName && car.LastName == buy_data[i].LastName);
            var carID, type, title;
            if(car_index == -1){
                carID = "-1";
                type = "Unknown";
                title = "Unknown";

            } else if(car_data[car_index].CarID == ""){
                carID = "-2";
                type = car_data[car_index].CurrentEmploymentType;
                title = car_data[car_index].CurrentEmploymentTitle;
            } else {
                carID = car_data[car_index].CarID;
                type = car_data[car_index].CurrentEmploymentType;
                title = car_data[car_index].CurrentEmploymentTitle;
            }

            persons.push({
                FirstName: buy_data[i].FirstName,
                LastName: buy_data[i].LastName,
                CarID: carID,
                CurrentEmploymentType: type,
                CurrentEmploymentTitle: title,
                Transactions: [{
                    Timestamp: buy_data[i].timestamp,
                    Location: buy_data[i].location,
                    Price: buy_data[i].price
                }] 
            });
        }
    }

    return persons;
}