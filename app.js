var lat = 51.9606649;
var lon = 7.6261347;

function initMap() {
    // Create a map object and specify the DOM element for display.
    window.gmap = new google.maps.Map(document.getElementById('gmap'), {
		center: { lat: lat, lng: lon },
		scrollwheel: false,
		zoom: 15
    });

    bootstrap();
}

function initMapError() {
	console.log(err);
	alert('Sorry, an error occured on Google Maps. Please check your network connection.');
}

/*global ko, Router */
function bootstrap() {
	'use strict';

	window.infoWindow = new google.maps.InfoWindow();
	var Venue = function(data) {
		var self = this;
		this.venue = data.venue;
		this.photo = data.photo;

		this.drawMarker = function() {
			// Create a marker and set its position.
		    return new google.maps.Marker({
				map: gmap,
				position: {
					lat: this.venue.location.lat,
					lng: this.venue.location.lng
				},
				title: this.venue.name
		    });
		};

		this.hideMarker = function() {
			this.marker.setMap(null);
		}.bind(this);

		this.showMarker = function() {
			this.marker.setMap(gmap);
		}.bind(this);

		this.showInfowindow = function() {
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				self.marker.setAnimation(null);
			}, 1400);

			var name = self.venue ? self.venue.name : 'No name available';
			var rating = self.venue ? self.venue.rating : 'No rating available';

			var w = window.infoWindow;
			w.setContent(
				'<div class="content">'+
				'<img src="'+self.photo.prefix+'150x70'+self.photo.suffix+'"/>' +
				'<div class="name">Name: '+name+'</div>' +
				'<div class="rating">Rating: '+rating+'</div>' +
				'</div>'
				);
			w.open(gmap, self.marker);
		}

		this.marker = this.drawMarker();
		this.marker.addListener('click', self.showInfowindow);
	}

	// our main view model
	var ViewModel = function(venues) {
		// map array of passed in todos to an observableArray of Todo objects
		this.venues = ko.observableArray(venues.map(function (venue) {
			return new Venue(venue);
		}));

		this.current = ko.observable();
		this.showMode = ko.observable('all');

		this.searchQuery = ko.observable('');

		this.filteredVenues = ko.computed(function() {
			var q = this.searchQuery().toLowerCase();
			if ( q.length < 2 ) {
				// Show all markers
				_.each(this.venues(), function(v) {
					v.showMarker();
				});
				return this.venues();
			}

			var filtered = _.filter(this.venues(), function(venue) {
				return venue.venue.name.toLowerCase().indexOf(q) >= 0;
			});

			// Remove all markers
			_.each(this.venues(), function(v) {
				v.hideMarker();
			});
			
			// Show filtered markers
			_.each(filtered, function(venue) {
				venue.showMarker();
			});

			return filtered;
		}.bind(this));

		this.showVenue = function(venue) {
			venue.showInfowindow();
			if ( window.outerWidth <= 800 ) {
				$('#sidebar').hide();
			}
		}.bind(this);

		this.showMenu = function() {
			if ( $('#sidebar').is(':visible') ) {
				$('#sidebar').hide();
			} else {
				$('#sidebar').show();
			}
		}
	};

	/*
	 * Foursquare
	 */
	var foursquare_client_id = 'RZQQ0120AG1OX5IVBJWCPLCD5TCJOIT1XGXYNGAHY3ZEUUYE';
	var foursquare_client_secret = 'BTNSUX2GHJSBOEM5ZEJIB0WHZVB3OLZQIGVSIGRUCJ1JYMXB';

	function getVenuesByLocation(next) {
		$.ajax({
			method: 'GET',
			url: 'https://api.foursquare.com/v2/venues/categories',
			data: {
				ll: lat+','+lon,
				client_id: foursquare_client_id,
				client_secret: foursquare_client_secret,
				v: '20161010'
			}
		})
		.done(function(results) {
			next(null, results.response.venues);
		})
		.fail(function(err) {
			next(err);
		});
	}

	function getVenuesByList(list_id, next) {
		$.ajax({
			method: 'GET',
			url: 'https://api.foursquare.com/v2/lists/' + list_id,
			data: {
				client_id: foursquare_client_id,
				client_secret: foursquare_client_secret,
				v: '20161010'
			}
		})
		.done(function(results) {
			next(null, results.response.list.listItems.items);
		})
		.fail(function(err) {
			next(err);
		});
	}

	getVenuesByList('58244f93133863578b9acb55', function(err, venues) {
		if ( err ) {
			console.log(err);
			return alert('Sorry, an error occured on loading venues. Please check your network connection.');
		}

		// bind a new instance of our view model to the page
		var viewModel = new ViewModel(venues || []);
		ko.applyBindings(viewModel);
	});
};