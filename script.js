// Initial function to render map. Calls other functions that enable user to interact with map.
function renderMap() {
    var punkAve = { lat: 39.934, lng: -75.158 };
    var displayMap = $("#map").get(0);
    var searchBtn = $("#search");

    var geocoder = new google.maps.Geocoder();
    var map = new google.maps.Map(displayMap, {
        zoom: 16,
        center: punkAve,
        mapTypeControl: false,
        fullscreenControl: false
    });

    function searchMap() {
        geocodeAddr(geocoder, map)
    }
    searchBtn.on("click", searchMap);
    $("#address").keydown(function(e) {
        if (e.keyCode == 13) {
            searchMap()
        }
    })
}

// Geocoder function locates lat and long for given location and calls weather function, passing in lat and long, to return weather data for given location.
function geocodeAddr(geocoder, map) {
    var address = $("#address").val().trim();
    geocoder.geocode({ "address": address }, function (results, status) {
        if (status === "OK") {
            var lat = results[0].geometry.location.lat();
            var lng = results[0].geometry.location.lng();
            var location = { lat: lat, lng: lng }

            map.setCenter(results[0].geometry.location);

            // Creates marker for geocode address
            var marker = new google.maps.Marker({
                map: map,
                position: location
            });

            getWeather(lat, lng);
        } else {
            console.log("Error: " + status);
        }
        $("#address").val("");
    });

    // Adds Indego stations as data layer to map
    map.data.loadGeoJson(
        'https://www.rideindego.com/stations/json/');

    map.data.setStyle(function(feature) {
        var icon;
        if (feature.getProperty("bikesAvailable") < 3) {
            icon = "assets/images/bike-icon-low.png";
        } else if (feature.getProperty("bikesAvailable") === 0 ) {
            icon = "assets/images/bike-icon-empty.png";
        } else {
            icon = "assets/images/bike-icon.png";
        }
        return ({
            icon: icon
        });
    });

    // Displays bike station information
    map.data.addListener('click', function (event) {
        var stationInfo = $("#station-info-wrapper");
        var stationAddr = $("#station-address");
        var bikes = $("#bikes-available");
        var currentBikes = event.feature.getProperty("bikesAvailable");
        var bikeStreet = event.feature.getProperty("addressStreet");
        var bikeCity = event.feature.getProperty("addressCity");
        var bikeState = event.feature.getProperty("addressState");
        var bikeZip = event.feature.getProperty("addressZipCode");

        stationAddr.html(bikeStreet + "<br>" + bikeCity + ", " + bikeState + " " + bikeZip);
        bikes.html("Available Bikes: " + currentBikes);
        stationInfo.removeClass("hide");
    });

    $("#close").on("click", function () {
        $("#station-info-wrapper").addClass("hide");
    });

}

// Uses location latitude and longitude to get weather data for given location.
function getWeather(lat, lng) {

    var apiKey = "4ab72bec89322fad122f8cd475d25439"
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&units=imperial&appid=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var temp = Math.floor(response.main.temp);
        var id = response.weather[0].id;
        var message;
        var displayTemp = $("#temp");
        var displayMessage = $("#weather-message");
        if (id >= 800 && id <= 804 && temp >= 55) {
            message = "It's a great day for a bike ride. Have fun!"
        } else if (id >= 800 && id <= 804 && temp < 55) {
            message = "It's a little cold, but enjoy your ride!"
        } else {
            message = "Use caution. Inclement weather expected.";
        }
        displayTemp.html(temp + "&deg; F");
        displayMessage.html(message);
        displayMessage.addClass("message-style")

    })

}



