var map;
var bartStationsUrl = 'http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V&json=y';

// ajax request for bart station data

function getBartData() {
    var result = null;
    $.ajax({
            async: false,
            url: bartStationsUrl,
            dataType: "json",
            success: function(data){
            result = data.root.stations.station;
            //alert('Bart stations data found');
            },
            error: function(e) {
            alert('Bart stations could not be found');
            }
        })
        return result;
    };

// ajax request for bart realtime departure data

function getDeparture(abbr) {
    var result = [];
    bartDepartureUrl = 'http://api.bart.gov/api/etd.aspx?cmd=etd&orig='+abbr+'&key=MW9S-E7SL-26DU-VV8V&json=y';
    $.ajax({
            async: false,
            url: bartDepartureUrl,
            dataType: "json",
            success: function(data){
            result = data.root.station;
            //alert('departure data found');
            },
            error: function(e) {
            alert('departure data could not be found');
            }
        })
        return result[0].etd;
    };


// store the json results of bart api call into a variable
var stations = getBartData();

//parse the bart station json data to set it in the right format to pass to google maps api
function setLocations(){
    result = [];
    for ( var i=0; i < stations.length; i++) {
        var station = stations[i];
        //console.log(stations[i]);
        var positions = {};
        var location = {};
        positions['lat'] = parseFloat(station.gtfs_latitude);
        positions['lng'] = parseFloat(station.gtfs_longitude);
        location['abbr'] = station.abbr;
        location['location_name'] = station.name;
        location['location'] = positions;
        location['description'] = station.address + ' , '+station.city;
        location['departures'] = getDeparture(station.abbr);
        result.push(location);
        }
    return result ;
}

// assign the bart stations data to a locations array
var locations = setLocations()


var Location = function(data) {
    this.location_name = data.location_name;
    this.location = data.location;
    this.description = data.description;
    this.departures = data.departures;
    this.marker = data.marker;
    this.showMarker = ko.observable(true);
};


// ViewModel //

var ViewModel = function() {
    var self = this;

    // Variable for Google Mapss
    this.stationList = ko.observableArray([]);

    this.Query = ko.observable('');

    locations.forEach(function(location){
        self.stationList.push(new Location(location) );
    });

    filteredLocations = ko.computed(function() {
        self.stationList().forEach(function(location) {
            if (self.Query()) {
                var match = location.location_name.toLowerCase().indexOf(self.Query().toLowerCase()) != -1;
                location.showMarker(match);
                location.marker.setVisible(match);
            } else {
                location.showMarker(true);
            }
        });
    });

    self.openInfoWindow = function(location) {
            google.maps.event.trigger(location.marker, 'click');
        };
};

// Error message handling for Google Maps
function googleError() {
    alert('Error loading Google Maps, please try again later.');
}

stationView = new ViewModel();
ko.applyBindings(stationView);

// code for generating google maps
// this code is referenced from the Google Maps API course
// modifed for this usecase

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        // Set map default location showing New York.
        center: {lat: 37.7899, lng: -122.3969},
        zoom: 8,
        mapTypeControl: true
    });

    var largeInfowindow = new google.maps.InfoWindow({
        maxWidth:80
    });

    var bounds = new google.maps.LatLngBounds();

    // Following section uses the location array to create a set of markers.
    locations.forEach(function(location, i) {
        // Get position from location array.
        var position = location.location;
        var location_name = location.location_name;
        var description = location.description;
        var departures = location.departures;
        //console.log(position);
        // Create one marker per location and place in markers array.
        var marker = new google.maps.Marker({
            position: position,
            location_name: location_name,
            description: description,
            departures: departures,
            animation: google.maps.Animation.DROP,
            id: i,
            map: map
        });
        // Call function to trigger marker bounce on click.
        marker.addListener('click', toggleBounce);

        // Add marker as a property of each Location.
        location.marker = marker;

        stationView.stationList()[i].marker = marker;

        // Create onclick event that opens an infowindow at each marker.
        marker.addListener('click', function() {
        // console.log(this.location_name, 'clicked');
            populateInfoWindow(this, largeInfowindow);
        });

        function toggleBounce() {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                stopBounceAnimation(marker);
            }
        }

        function stopBounceAnimation() {
            setTimeout(function () {
                marker.setAnimation(null);
            }, 800);
        }
    });


    // This function creates the html for departures data
    function departHTML(inputMarker) {
        var departures = inputMarker.departures;
        departHtml = '';
        for(i=0;i<departures.length;i++){
            if(departures[i].estimate[0].minutes === 'Leaving'){
                departTime = departures[i].estimate[0].minutes;
            } else {
                departTime = departures[i].estimate[0].minutes + ' mins';
            }
            departHtml = departHtml+ departures[i].destination + ' : ' + departTime + '<br>';
        }
        return departHtml;
    };



    // This function populates the infowindow when marker is clicked.
    // Only one infowindow is allowed to be open at a time and it's
    // contents are populated based upon that markers location.
    function populateInfoWindow(marker, infowindow) {
        // Ensure infowindow isn't already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('');
            infowindow.open(map, marker);
            // Ensure marker property is cleared if infowindow is closed.
            infowindow.addListener('closeclick',function(){
                infowindow.setMarker = null;
            });
            var departureHTML= departHTML(marker);
            //console.log(departureHTML);
            var streetViewService = new google.maps.StreetViewService();
            var radius = 30;
            // If the status is ok, compute streetview position,
            // calculate heading, get panorama and apply settings
            var getStreetView = function(data, status) {
                if (status == 'OK') {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                        infowindow.setContent('<h5>' + marker.description + '</h5>' +
                                                '<div id="pano"></div>' +
                                                '<h5>Departures</h5>'+
                                                '<p>'+departureHTML+'</p>'
                                                 );
                        var panoramaOptions = {
                            position: nearStreetViewLocation,
                            scrollwheel: false,
                            pov: {
                                heading: heading,
                                pitch: 20
                            }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('<h5>' + marker.description + '</h5>' +
                                                '<i>No Street View Available</i>' +
                                                '<div id="pano"></div>' +
                                                '<h5>Departures</h5>'+
                                                '<p>'+departureHTML+'</p>');
                    }
                };
                // Find nearest streetview available within 50 meters of marker
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                // Open infowindow on relevant marker.
                infowindow.open(map, marker);
                }
            }


}
