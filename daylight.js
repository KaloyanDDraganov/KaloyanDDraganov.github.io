// start at KIT
var latitude = 49.01192691636735;
var longitude = 8.41713758689686;
var sunrise;
var sunset;
var daylight;
var timeZone = "Europe/Berlin";

// html
var locationDisplay = document.getElementById("userLocation");
var daylightDisplay = document.getElementById("daylight");

// map
var mapOptions;
var map;
var layer;
var marker;

getTimeZone();
initMap();
displayLocationData();
calculateDaylight();

map.on('click', function(e) {
    latitude = e.latlng.lat;
    longitude = e.latlng.lng;
    getTimeZone(displayLocationData);
    refreshMap();
    calculateDaylight();
  });

function initMap() {
    mapOptions = {
        center:[latitude, longitude],
        zoom:10
    }
    map = new L.map('map' , mapOptions);
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    marker = new L.Marker([latitude, longitude]);
    map.addLayer(layer);
    marker.addTo(map);

}

function refreshMap() {
    map.setView([latitude, longitude]);
    marker.removeFrom(map);
    marker = new L.Marker([latitude, longitude]);
    marker.addTo(map);
}

function getTimeZone(callback = () => {}) {
    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=18447d8b08524c9c858f60e10d64856d`)
    .then(resp => resp.json())
    .then((result) => {
    if (result.results.length) {
        timeZone = result.results[0].timezone.name;
    } else {
        console.log("No location found");
    }
    callback();
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(writeLocationData);
    } else { 
        locationDisplay.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function writeLocationData(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    getTimeZone(displayLocationData);
    refreshMap();
    calculateDaylight();
}

function displayLocationData() {
    locationDisplay.innerHTML = "Latitude: " + latitude + 
    "<br>Longitude: " + longitude +
    "<br>Time zone: " + timeZone;
}

function calculateDaylight() {
    // Making our connection
    var url = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&timezone=${timeZone}&date=today`;
    // Making our request 
    fetch(url, { method: 'GET' })
        .then(Result => Result.json())
        .then(string => {
            sunrise = string.results.sunrise;
            sunset = string.results.sunset;
            daylight = string.results.day_length;
            timeZone = string.results.timezone;
            const duration = daylight.split(":");
            const hours = duration[0];
            const minutes = duration[1];
            const seconds = duration[2];

            daylightDisplay.innerHTML = "Sunrise: " + sunrise +
            "<br>Sunset: " + sunset +
            "<br>Daylight: " + hours + "h " + minutes + "m " + seconds + "s";
        })
        .catch(errorMsg => { console.log(errorMsg); });
    }
