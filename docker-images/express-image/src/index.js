var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/',function(req,res){
	res.send(generateAddresses());
});

app.listen(3000, function() {
	console.log('accepting HTTP requests on port 3000');
});

function generateAddresses(){
    var numberOfAdresses = chance.integer({
        min: 0,
        max: 10
    });
    console.log(numberOfAdresses);
    var addresses = [];
    for(var i = 0; i < numberOfAdresses; i++){
        var areacode = chance.areacode({
            min:1000,
            max: 9999,
        });
        var address = chance.address();
        var city = chance.city();
        addresses.push({
            address: address,
            areacode: areacode,
            city: city,
        });
    }
    console.log(addresses);
    return addresses;
}