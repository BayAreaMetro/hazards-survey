import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
    $http;

    awesomeThings = [];
    newThing = '';

    /*@ngInject*/
    constructor($http, $scope) {
        this.$http = $http;
        this.markers = [];
        this.lat;
        this.long;
        this.results;
        this.loading = false;
        this.$scope = $scope;
        this.geocodeResults = [];
        this.marker = new mapboxgl.Marker();
    }

    $onInit() {

        this.initializeMap();


    }

    initializeMap() {
        var $scope = this.$scope;
        var geocodeResults = this.geocodeResults;
        //Create initial map object


        mapboxgl.accessToken = 'pk.eyJ1IjoibXppeWFtYmkiLCJhIjoid3dLMWFSWSJ9.hnKFXmWmSwyhsSJp6vucig';
        const map = new mapboxgl.Map({
            container: 'map',
            // style: 'mapbox://styles/mziyambi/cjn3uhc4w07o02sp5b9dck5z6',
            style: 'mapbox://styles/mapbox/light-v9',
            center: [-122.424100, 37.780000],
            zoom: 9.0

        });



        var geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            country: 'us',
            bbox: [-123.497314, 36.941111, -120.709534, 38.749799]
        });

        // document.getElementById('searchAddress').appendChild(geocoder.onAdd(map));
        document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

        geocoder.on('results', function(data) {
            // console.log(data);
            geocodeResults.push(data);
            console.log(geocodeResults);
        });


        // map.addControl(geocoder);

        map.on('load', function() {


            map.addLayer({
                "id": "landslides",
                "type": "fill",
                "source": {
                    type: 'vector',
                    url: 'mapbox://mziyambi.dhu5tlrb'
                },
                "source-layer": "parcels_in_landslide",
                "layout": {

                },
                "paint": {
                    "fill-color": "orange",
                    "fill-opacity": 0.3
                }
            });

            map.addLayer({
                "id": "liquefaction",
                "type": "fill",
                "source": {
                    type: 'vector',
                    url: 'mapbox://mziyambi.50gtsv5l'
                },
                "source-layer": "parcels_in_liquefaction",
                "layout": {

                },
                "paint": {
                    "fill-color": "lightgreen",
                    "fill-opacity": 0.4
                }
            });


            map.addLayer({
                "id": "faultzones",
                "type": "fill",
                "source": {
                    type: 'vector',
                    url: 'mapbox://mziyambi.93u23bui'
                },
                "source-layer": "fault_zones",
                "layout": {

                },
                "paint": {
                    "fill-color": "red"
                }
            });
        });


        this.map = map;



    }

    getResults() {
        this.$scope.loading = true;
        var geocodeResult = (_.last(this.geocodeResults));
        var center = geocodeResult.features[0].center;
        this.$scope.inputAddress = geocodeResult.features[0].place_name;
        console.log(geocodeResult);
        // console.log(this.map);
        this.marker.remove();
        this.marker.setLngLat(center)
            .addTo(this.map);

        var latLng = {
            lat: center[1],
            lng: center[0]
        };

        this.$http.post('api/data/getResults', latLng)
            .then(result => {
                console.log(result);
                this.$scope.results = result;
                this.$scope.landslide = result.data.recordset[0].landslide;
                this.$scope.faultzone = result.data.recordset[0].faultzone;
                this.$scope.liquefaction = result.data.recordset[0].liquefaction;

                console.log(this.$scope);
                this.$scope.loading = false;


            })
            .catch(err => {
                console.log(err);
                this.$scope.loading = false;
            });

        // var address = this.address;
        // this.results = this.codeAddress(address);
        // console.log(this.results);
    }
    codeAddress(address) {
        // address = document.getElementById('searchAddress').value;
        console.log(address);
        var gmap = this.gmap;
        var markers = this.markers;
        var lat = this.lat;
        var lng = this.lng;
        var $http = this.$http;
        var results = this.results;
        var loading = this.loading;

        var $scope = this.$scope;
        var geo;

        $scope.inputAddress = $scope.address;



        console.log(markers.length);

        if (markers.length == 1) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            console.log(markers);

            this.geocoder.geocode({ 'address': $scope.address }, function(results, status) {
                markers.pop();
                console.log(markers);
                if (status == 'OK') {
                    geo = results[0].geometry.location;
                    gmap.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({

                        position: results[0].geometry.location
                    });
                    lat = geo.lat();
                    lng = geo.lng();
                    console.log(lat);
                    console.log(lng);
                    markers.push(marker);
                    markers[0].setMap(gmap);
                    var latLng = {
                        lat: lat,
                        lng: lng
                    };

                    $http.post('api/data/getResults', latLng)
                        .then(result => {
                            console.log(result);
                            $scope.results = result;
                            $scope.landslide = result.data.recordset[0].landslide;
                            $scope.faultzone = result.data.recordset[0].faultzone;
                            $scope.liquefaction = result.data.recordset[0].liquefaction;

                            console.log($scope);
                            $scope.loading = false;


                        })
                        .catch(err => {
                            console.log(err);
                            $scope.loading = false;
                        });


                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                    $scope.loading = false;
                }
            });
        } else {
            this.geocoder.geocode({ 'address': $scope.address }, function(results, status) {
                if (status == 'OK') {
                    geo = results[0].geometry.location;
                    gmap.setCenter(results[0].geometry.location);
                    console.log(results[0].geometry.location.lat());
                    var marker = new google.maps.Marker({

                        position: results[0].geometry.location
                    });
                    lat = geo.lat();
                    lng = geo.lng();
                    console.log(lat);
                    console.log(lng);
                    markers.push(marker);
                    markers[0].setMap(gmap);
                    var latLng = {
                        lat: lat,
                        lng: lng
                    };

                    $http.post('api/data/getResults', latLng)
                        .then(result => {
                            console.log(result);
                            $scope.results = result;
                            $scope.landslide = result.data.recordset[0].landslide;
                            $scope.faultzone = result.data.recordset[0].faultzone;
                            $scope.liquefaction = result.data.recordset[0].liquefaction;
                            console.log($scope);
                            $scope.loading = false;


                        })
                        .catch(err => {
                            console.log(err);
                        });


                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                    $scope.loading = false;
                }


            });
        }




    }

    addThing() {
        if (this.newThing) {
            this.$http.post('/api/things', {
                name: this.newThing
            });
            this.newThing = '';
        }
    }

    deleteThing(thing) {
        this.$http.delete(`/api/things/${thing._id}`);
    }
}

export default angular.module('hazardSurveyApp.main', [uiRouter])
    .config(routing)
    .component('main', {
        template: require('./main.html'),
        controller: MainController
    })
    .name;