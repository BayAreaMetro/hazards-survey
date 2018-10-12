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
    }

    $onInit() {
        this.$http.get('/api/things')
            .then(response => {
                this.awesomeThings = response.data;
            });
        this.geocoder = new google.maps.Geocoder();


        this.initializeMap();


    }

    initializeMap() {
        var $scope = this.$scope;
        //Create initial map object


        var styledMapType = new google.maps.StyledMapType(
            [{
                    "featureType": "administrative",
                    "elementType": "all",
                    "stylers": [{
                        "saturation": "-100"
                    }]
                },
                {
                    "featureType": "administrative.province",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{
                            "saturation": -100
                        },
                        {
                            "lightness": 65
                        },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{
                            "saturation": -100
                        },
                        {
                            "lightness": "50"
                        },
                        {
                            "visibility": "simplified"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{
                        "saturation": "-100"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "simplified"
                    }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "all",
                    "stylers": [{
                        "lightness": "30"
                    }]
                },
                {
                    "featureType": "road.local",
                    "elementType": "all",
                    "stylers": [{
                        "lightness": "40"
                    }]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{
                            "saturation": -100
                        },
                        {
                            "visibility": "simplified"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                            "hue": "#ffff00"
                        },
                        {
                            "lightness": -25
                        },
                        {
                            "saturation": -97
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels",
                    "stylers": [{
                            "lightness": -25
                        },
                        {
                            "saturation": -100
                        }
                    ]
                }
            ]
        );

        var gmap = new google.maps.Map(document.getElementById('canvas'), {
            center: new google.maps.LatLng(37.796966, -122.275051),
            defaults: {
                //icon: '/assets/images/GenericBlueStop16.png',
                //shadow: 'dot_shadow.png',                    
                editable: false,
                strokeColor: 'red',
                fillColor: '#2196f3',
                fillOpacity: 0.6,
                strokeWeight: 7

            },
            disableDefaultUI: true,
            // mapTypeControl: true,
            // mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                // position: google.maps.ControlPosition.TOP_LEFT,
                // style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'styled_map'
                ]
            },

            panControl: true,
            streetViewControl: true,
            zoom: 10,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP,
                style: google.maps.ZoomControlStyle.SMALL
            }
        });

        gmap.mapTypes.set('styled_map', styledMapType);
        gmap.setMapTypeId('styled_map');

        //Layer Toggle
        var layerToggle = document.getElementById("layerToggleDiv");
        gmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerToggle);

        //Add toggle layer functions for Fault zones
        $('#faultZoneToggle').change(function() {
            $('#faultZoneSpinner').addClass('fa-spinner fa-spin');
            var status = ($(this).prop('checked'));
            if (status) {
                // console.log('add pdas');
                var getfaultZoneLayer = function() {
                    var faultZoneLayer = new google.maps.Data();
                    $.getJSON("/assets/js/spatial/AlquistPriolozones.json", function(data) {
                        // console.log(data);
                        var geoJsonObject;
                        geoJsonObject = topojson.feature(data, data.objects.AlquistPriolozones);
                        faultZoneLayer.addGeoJson(geoJsonObject);
                        faultZoneLayer.setStyle(function(feature) {

                            return {
                                fillColor: 'red',
                                strokeWeight: 0

                            };
                        });
                        $('#faultZoneSpinner').removeClass('fa-spinner fa-spin');
                    });

                    return faultZoneLayer;
                };

                this.faultZoneLayer = getfaultZoneLayer();
                this.faultZoneLayer.setMap(gmap);
            } else if (!status) {
                // console.log('remove pdas');
                this.faultZoneLayer.setMap(null);
                $('#faultZoneSpinner').removeClass('fa-spinner fa-spin');
            }
        });

        //Add toggle layer functions for Landslide
        $('#landslideToggle').change(function() {
            $('#landslideSpinner').addClass('fa-spinner fa-spin');
            var status = ($(this).prop('checked'));
            if (status) {
                // console.log('add pdas');
                var getlandslideLayer = function() {
                    var landslideLayer = new google.maps.Data();
                    $.getJSON("/assets/js/spatial/parcels_in_hazards/parcels_in_landslide.json", function(data) {
                        // console.log(data);
                        var geoJsonObject;
                        geoJsonObject = topojson.feature(data, data.objects.parcels_in_landslide);
                        landslideLayer.addGeoJson(geoJsonObject);
                        landslideLayer.setStyle(function(feature) {

                            return {
                                fillColor: 'yellow',
                                strokeWeight: 0

                            };
                        });
                        $('#landslideSpinner').removeClass('fa-spinner fa-spin');
                    });

                    return landslideLayer;
                };

                this.landslideLayer = getlandslideLayer();
                this.landslideLayer.setMap(gmap);
            } else if (!status) {
                // console.log('remove pdas');
                this.landslideLayer.setMap(null);
                $('#landslideSpinner').removeClass('fa-spinner fa-spin');
            }
        });

        //Add toggle layer functions for Liquefaction
        $('#liquefactionToggle').change(function() {
            $('#liquefactionSpinner').addClass('fa-spinner fa-spin');
            var status = ($(this).prop('checked'));
            if (status) {
                // console.log('add pdas');
                var getliquefactionLayer = function() {
                    var liquefactionLayer = new google.maps.Data();
                    $.getJSON("/assets/js/spatial/parcels_in_hazards/parcels_in_liquefaction.json", function(data) {
                        // console.log(data);
                        var geoJsonObject;
                        geoJsonObject = topojson.feature(data, data.objects.parcels_in_liquefaction);
                        liquefactionLayer.addGeoJson(geoJsonObject);
                        liquefactionLayer.setStyle(function(feature) {

                            return {
                                fillColor: 'green',
                                strokeWeight: 0

                            };
                        });
                        $('#liquefactionSpinner').removeClass('fa-spinner fa-spin');
                    });

                    return liquefactionLayer;
                };

                this.liquefactionLayer = getliquefactionLayer();
                this.liquefactionLayer.setMap(gmap);
            } else if (!status) {
                // console.log('remove pdas');
                this.liquefactionLayer.setMap(null);
                $('#liquefactionSpinner').removeClass('fa-spinner fa-spin');
            }
        });

        //Add toggle layer functions for TPAs
        // $('#tpaToggle').change(function() {
        //     $('#tpaSpinner').addClass('fa-spinner fa-spin');
        //     var status = ($(this).prop('checked'));
        //     if (status) {
        //         // console.log('add pdas');
        //         var getPDALayer = function() {
        //             var pdaLayer = new google.maps.Data();
        //             $.getJSON("/assets/js/tpas_dissolved.json", function(data) {
        //                 // console.log(data);
        //                 var geoJsonObject;
        //                 geoJsonObject = topojson.feature(data, data.objects.tpas_dissolved);
        //                 pdaLayer.addGeoJson(geoJsonObject);
        //                 pdaLayer.setStyle(function(feature) {

        //                     return {
        //                         fillColor: 'purple',
        //                         strokeColor: 'purple',
        //                         fillOpacity: 0.1,
        //                         strokeWeight: 1,
        //                         strokeOpacity: 0.6,

        //                     };
        //                 });

        //             });
        //             $('#tpaSpinner').removeClass('fa-spinner fa-spin');
        //             return pdaLayer;
        //         };

        //         this.pdaLayer = getPDALayer();
        //         this.pdaLayer.setMap(gmap);
        //     } else if (!status) {
        //         // console.log('remove pdas');
        //         this.pdaLayer.setMap(null);
        //         $('#tpaSpinner').removeClass('fa-spinner fa-spin');
        //     }
        // });

        //Add toggle layer functions for COCs
        // $('#cocToggle').change(function() {
        //     $('#cocSpinner').addClass('fa-spinner fa-spin');
        //     var status = ($(this).prop('checked'));
        //     if (status) {
        //         // console.log('add pdas');
        //         var getPDALayer = function() {
        //             var pdaLayer = new google.maps.Data();
        //             $.getJSON("/assets/js/cocs_dissolved.json", function(data) {
        //                 // console.log(data);
        //                 var geoJsonObject;
        //                 geoJsonObject = topojson.feature(data, data.objects.cocs_dissolved);
        //                 pdaLayer.addGeoJson(geoJsonObject);
        //                 pdaLayer.setStyle(function(feature) {

        //                     return {
        //                         fillColor: 'pink',
        //                         strokeColor: 'pink',
        //                         fillOpacity: 0.2,
        //                         strokeWeight: 1,
        //                         strokeOpacity: 0.9
        //                     };
        //                 });

        //             });
        //             $('#cocSpinner').removeClass('fa-spinner fa-spin');
        //             return pdaLayer;
        //         };

        //         this.pdaLayer = getPDALayer();
        //         this.pdaLayer.setMap(gmap);
        //         // $('#cocSpinner').removeClass('fa-spinner fa-spin');
        //     } else if (!status) {
        //         // console.log('remove pdas');
        //         this.pdaLayer.setMap(null);
        //         $('#cocSpinner').removeClass('fa-spinner fa-spin');
        //     }
        // });

        //End Layer Toggle

        // GOOGLE AUTOCOMPLETE
        // Autocomplete directions
        var searchAddress = document.getElementById('searchAddress');
        var marker1;

        var autocomplete = new google.maps.places.Autocomplete(searchAddress);

        autocomplete.bindTo('bounds', gmap);

        //From Address Autocomplete
        autocomplete.addListener('place_changed', function() {
            // infowindow.close();
            // marker1 = new google.maps.Marker({
            //     map: gmap,
            //     anchorPoint: new google.maps.Point(0, -29)
            // });
            // marker1.setVisible(false);

            var place = autocomplete.getPlace();
            // if (!place.geometry) {
            //     // User entered the name of a Place that was not suggested and
            //     // pressed the Enter key, or the Place Details request failed.
            //     window.alert("No details available for input: '" + place.name + "'");
            //     return;
            // }

            // // If the place has a geometry, then present it on a map.
            // if (place.geometry.viewport) {
            //     gmap.fitBounds(place.geometry.viewport);
            // } else {
            //     gmap.setCenter(place.geometry.location);
            //     gmap.setZoom(17); // Why 17? Because it looks good.
            // }
            // marker1.setPosition(place.geometry.location);
            // marker1.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }

            // infowindowContent.children['place-icon'].src = place.icon;
            // infowindowContent.children['place-name'].textContent = place.name;
            // infowindowContent.children['place-address'].textContent = address;
            console.log(address);
            $scope.address = address;

            // infowindow.open(map, marker);
        });

        // this.gmap = gmap;
        var lzsGeojson, liqsGeojson, liqzGeojson, apzGeojson;
        var apzLayer = new google.maps.Data({ map: gmap });
        var lszLayer = new google.maps.Data({ map: gmap });
        var liqsLayer = new google.maps.Data({ map: gmap });
        var liqzLayer = new google.maps.Data({ map: gmap });


        // $.getJSON("/assets/js/spatial/parcels_in_hazards/parcels_in_liquefaction.json", function(data) {
        //     console.log(data);
        //     liqzGeojson = topojson.feature(data, data.objects.parcels_in_liquefaction);
        //     liqzLayer.addGeoJson(liqzGeojson);
        //     liqzLayer.setStyle({
        //         fillColor: 'green',
        //         strokeWeight: 0
        //     });


        // });



        // $.getJSON("/assets/js/spatial/LandslideZones.json", function(data) {
        //     console.log(data);
        //     lzsGeojson = topojson.feature(data, data.objects.LandslideZones);
        //     lszLayer.addGeoJson(lzsGeojson);
        //     lszLayer.setStyle({
        //         fillColor: 'blue',
        //         strokeWeight: 0
        //     });


        // });



        // $.getJSON("/assets/js/spatial/parcels_in_hazards/parcels_in_landslide.json", function(data) {
        //     console.log(data);
        //     liqsGeojson = topojson.feature(data, data.objects.parcels_in_landslide);
        //     liqsLayer.addGeoJson(liqsGeojson);
        //     liqsLayer.setStyle({
        //         fillColor: 'yellow',
        //         strokeWeight: 0
        //     });


        // });

        // $.getJSON("/assets/js/spatial/AlquistPriolozones.json", function(data) {
        //     console.log(data);
        //     apzGeojson = topojson.feature(data, data.objects.AlquistPriolozones);
        //     apzLayer.addGeoJson(apzGeojson);
        //     apzLayer.setStyle({
        //         fillColor: 'red',
        //         strokeWeight: 0
        //     });


        // });

        this.gmap = gmap;

        // $.getJSON("/assets/js/spatial/LandslideZones.json", function(data) {
        //     console.log(data);
        //     geoJsonObject = topojson.feature(data, data.objects.LandslideZones)
        //     gmap.data.addGeoJson(geoJsonObject);
        //     gmap.data.setStyle({
        //         fillColor: 'purple',
        //         strokeWeight: 0
        //     });
        // });

    }

    getResults() {
        this.$scope.loading = true;
        var address = this.address;
        this.results = this.codeAddress(address);
        console.log(this.results);
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