$(function () {
    console.log("loading addresses");

    function loadAddresses() {
        $.getJSON("/api/students/", function (addresses) {
            console.log(addresses);
            var message = "No Addresses is here";
            if (addresses.length > 0) {
                message = addresses[0].address + " " + addresses[0].areacode + " " + addresses[0].city;
            }
            $(".display-4").text(message);
        });
    };

    loadAddresses();
    setInterval(loadAddresses, 2000);
});