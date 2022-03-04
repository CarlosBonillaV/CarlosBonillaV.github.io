HF.map = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elMapWrap, elMap, elPop, elLegend, elHideMap;



	/*
	 *  Private cached data
	 */

	var elMapData, _cc, elPopData = [];



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('resultsReady', function(src) {
		$.when(
			_cleanMap()
		).then(function (cleaned) {
			if (cleaned) {
				elMapData = src;
				_updateSource(elMapData);
			}
		});
	});

	events.on('countryChanged', function(value) {
		_goToCountry(value);
	});

	events.on('cleanMap', function() {
		if (elMap && elMapData) {
			// Hide legend
			elHideMap.off('click',  _hideMapView);
			elLegend.off('click', '.toggle-btn', _toggleLegend);
			elLegend.attr('class', 'legend hidden');
			_cleanMap();
		}
	});



	/*
	 *  Public methods
	 */

	function init(el) {
		// Get main map wrapper
		elMapWrap = (!el) ? $('#alt') : $('#' + el);
		elLegend = $('#map-legend');
		elHideMap = elMapWrap.children('.toggle-map');
		// Prepare map wrapper
		elMapWrap.append('<div id="map"></div>');

		$.when(
			_renderMapBox()
		).then(function(rendered) {
			if (rendered) {
				console.log('Map Module => Loaded');
				elMapWrap.removeClass('loading');
			} else {
				console.log('Map Module => Error loading');

				elMapWrap
					.html(
						'<div class="module-error-msg">' +
						'There was an error loading the map module' +
						'</div>')
					.removeClass('loading');
			}
		});
	}


	function unload() {
		$.when(
			_cleanMap()
		).then(function (cleaned) {
			if (cleaned) {
				elHideMap.off('click',  _hideMapView);
				elLegend.off('click', '.toggle-btn', _toggleLegend);
				elLegend.attr('class', 'legend hidden');
				elMap.remove();
				elHideMap = null;
				elLegend = null;
				elMapWrap = null;
				elMap = null;
				elPop = null;
			}
		});

		console.log('Map destroyed');
	}


	function _renderMapBox() {
		var isLoaded = $.Deferred();

		mapboxgl.accessToken = 'pk.eyJ1IjoibWFwdXBqdHciLCJhIjoiY2lmbW9kM3MxMDE4ZHVlbHl3bDN2a2dsOSJ9.Mea9-MfQVZ_6XJM9bjuVMQ';

		elMap = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/light-v9',
			center: [-1, 53],
			minZoom: 1,
			zoom: 2,
			attributionControl: false,
			preserveDrawingBuffer: true
		});

		elMap.on('load', function() {
			isLoaded.resolve(true);

			_goToCountry('uk');

			elMap.addControl(new mapboxgl.NavigationControl(), 'top-left');

			elPop = new mapboxgl.Popup({
				closeButton: false
			});
		});

		return isLoaded.promise();
	}


	function _updateSource(mapData) {
		console.log('Map Data: ', mapData);

		var results = $.extend(true, {}, HF.results.list.getCached(mapData)),
			searchData = HF.results.list.getData('searchData'),
			geoBound = new mapboxgl.LngLatBounds(),
			filterID = ['in', 'id'],
			geoPoint = [],
			stopsArr = [],
			hasGeometry = (!results.overview.mapType) ? true : false,
			mapID = (mapData === 'level2') ? _mapID[mapData] : _mapID[searchData.geo[1] + '_level3'],
			layerSrc = (mapData === 'level2') ? results.overview.locationId + '_' + mapData : results.overview.locationId + '_level3',
			maxCount;

		// Check if there regions within the results
		if ( !HF.utils.isEmptyObj(results.regions) ) {
			// Iterate results to build region data
			for (var loc in results.regions) {
				// Assign first region candidates count if no maxCount available
				if (!maxCount) {
					maxCount = results.regions[loc].candidates;
				}

				var region = results.regions[loc],
					ratio = ( region.candidates / (maxCount * 10) ) * 6;

				// Create geojson with points if no geometry source exists
				if ( !hasGeometry ) {
					var geoFeat = {
						"type": "Feature",
						"properties": {
							"id": region.locationId,
							"displayName": region.location
						},
						"geometry": {
							"type": "Point",
							"coordinates": region.mapType
						}
					};

					geoPoint.push(geoFeat);
					geoBound.extend(region.mapType);
				}

				// Populate data array for location popups
				elPopData[region.locationId] = {
					"candidates": HF.utils.addCommas(region.candidates),
					"jobposts": HF.utils.addCommas(region.jobposts),
					"salary": (!region.salary.avg) ? 0 : HF.utils.addCommas(region.salary.avg, results.overview.currency),
					"level": region.levelOpts,
					"geoPath": region.locationPath
				};

				// Populate filter and stops arrays
				filterID.push(region.locationId);
				stopsArr.push([region.locationId, _setColor(ratio)]);
			}

			// If geometry source is available
			if ( hasGeometry ) {
				// Get json coordinates ( [sw, ne] ) file and extend bounds
				$.when(
					_getBounds(mapData, searchData.geo[1], results.overview.locationId)
				).then(function(data) {
					for (var key in data.bounds) {
						if ( data.bounds.hasOwnProperty(key) && ( filterID.indexOf(key) > -1 ) ) {
							var templl = new mapboxgl.LngLatBounds(data.bounds[key][0], data.bounds[key][1]);
							geoBound.extend(templl);
						}
					}

					// Fit map to results
					elMap.fitBounds(geoBound, {
						padding: 20
					});
				});

				// Add source to map
				elMap.addSource('regions', {
					'type': 'vector',
					'url': 'mapbox://mapupjtw.' + mapID
				});

				// Add map fill layers
				_addLayerFill('region', layerSrc, filterID, stopsArr);
				_addLayerFill('region-hover', layerSrc, filterID, stopsArr);
			} else {
				var geoJson = {
					"type": "FeatureCollection",
					"features": geoPoint
				};

				// Fit map to results
				elMap.fitBounds(geoBound, {
					padding: 60,
					maxZoom: 11
				});

				// Add source to map
				elMap.addSource('regions', {
					'type': 'geojson',
					'data': geoJson
				});

				// Add map circle layers
				_addLayerCircle('region', filterID, stopsArr);
				_addLayerCircle('region-hover', filterID, stopsArr);
			}

			// Show legend
			if ( elLegend.hasClass('hidden') ) {
				elLegend.on('click', '.toggle-btn', _toggleLegend);
				elLegend.removeClass('hidden').addClass('open');
			}

			// Bind hide map view button (mobile)
			elHideMap.on('click',  _hideMapView);

			// Bind map events
			elMap.on('mousemove', 'region', _popMove);
			elMap.on('mouseleave', 'region', _popLeave);
			elMap.on('click', 'region', _popClick);
		}
	}


	function _setColor(ratio) {
		var val	= (ratio > 0.6) ? 0.6 : ratio, hsl;

		if (val <= 0.10) {
			hsl = 'hsl(' +
				Math.ceil( val * 320 ) + ', ' +
				Math.ceil( 90 ) + '%, ' +
				Math.ceil( 50 ) + '%)';
		} else if (val > 0.10 && val <= 0.35) {
			hsl = 'hsl(' +
				Math.ceil( 23 + (val * 120) ) + ', ' +
				Math.ceil( 90 ) + '%, ' +
				Math.ceil( 50 ) + '%)';
		} else {
			hsl = 'hsl(' +
				Math.ceil( 4 + (val * 180) ) + ', ' +
				Math.ceil( 100 - (val * (val * 80)) ) + '%, ' +
				Math.ceil( 67 - (val * 48) ) + '%)';
		}

		return hsl;
	}


	function _addLayerFill(layerId, layerSrc, filter, stops) {
		elMap.addLayer({
			'id': layerId,
			'type': 'fill',
			'source': 'regions',
			'source-layer': layerSrc,
			'paint': {
				'fill-color': {
					'property': 'id',
					'type': 'categorical',
					'stops': stops,
					'default': 'rgba(0, 0, 0, 0)'
				},
				'fill-outline-color': (layerId === 'region') ? '#282828' : '#000000',
				'fill-opacity': (layerId === 'region') ? 0.8 : 0.9
			},
			'filter': (layerId === 'region') ? filter : ['==', 'id', '']
		}, 'bridge-motorway-2');
	}


	function _addLayerCircle(layerId, filter, stops) {
		elMap.addLayer({
			'id': layerId,
			'type': 'circle',
			'source': 'regions',
			'paint': {
				'circle-color': {
					'property': 'id',
					'type': 'categorical',
					'stops': stops,
					'default': 'rgba(0, 0, 0, 0)'
				},
				'circle-radius': {
					'type': 'exponential',
					'stops': [[1, 10], [22, 4]]
				},
				'circle-opacity': (layerId === 'region') ? 0.8 : 0.9
			},
			'filter': (layerId === 'region') ? filter : ['==', 'id', '']
		}, 'bridge-motorway-2');
	}


	function _popMove(e) {
		var feat = e.features[0].properties,
			salary = (elPopData[feat.id].salary) ? '<li>Avg. Salary: ' + elPopData[feat.id].salary + '</li>' : '',
			drillMsg = (elPopData[feat.id].level === 'goDeep') ? '<span>Click to drill down</span>' : '';

		elMap.getCanvas().style.cursor = 'pointer';
		elMap.setFilter('region-hover', ['==', 'id', feat.id]);

		elPop.setLngLat(e.lngLat)
			.setHTML('<div id=\'popup\' class=\'popup\' style=\'z-index: 10;\'>' +
			'<h5>' + feat.displayName + '</h5>' +
			'<ul><li>Candidates: ' + elPopData[feat.id].candidates + '</li>' +
			'<li>Adverts: ' + elPopData[feat.id].jobposts + '</li>' +
			salary + '</ul>' + drillMsg + '</div>')
			.addTo(elMap);
	}


	function _popLeave() {
		elMap.getCanvas().style.cursor = '';
		elPop.remove();
		elMap.setFilter('region-hover', ['==', 'id', '']);
	}


	function _popClick(e) {
		var feat = e.features[0].properties,
			name = (feat.displayName).toLowerCase(),
			lvl = elPopData[feat.id].level,
			geo = elPopData[feat.id].geoPath;

		if (lvl === 'goDeep') {
			events.emit('mapDrilled', [name, geo]);
		}
	}


	function _toggleLegend(e) {
		e.preventDefault();
		e.stopPropagation();

		var $this = $(e.target).closest('.legend');

		$this.toggleClass('open');
	}


	function _hideMapView(e) {
		e.preventDefault();
		e.stopPropagation();

		elMapWrap.removeClass('showing');
	}


	function _goToCountry(code) {
		// Store current country
		_cc = code;

		// Remove max bounds restriction
		elMap.setMaxBounds( null );

		// Fit map to selected country
		elMap.fitBounds(_ccBound[code], {
			padding: 20
		});

		elMap.once('moveend', function(e) {
			// Get map bounds after padding
			var tmp = elMap.getBounds(),
				max = [
					[tmp._sw.lng, tmp._sw.lat],
					[tmp._ne.lng, tmp._ne.lat]
				];

			// Set max bounds restriction
			// elMap.setMaxBounds( max );
		});
	}


	function _getBounds(level, country, locId) {
		var pathUrl = (level === 'level2') ? '/level2/' + locId + '.json' : '/level3/' + country + '/' + locId + '.json';

		return $.ajax({
			type: 'GET',
			// url: pathAws + 'bounds' + pathUrl,
			url: 'https://s3.eu-west-2.amazonaws.com/horsefly-dev/bounds' + pathUrl,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _cleanMap() {
		var isClean = $.Deferred();

		var mapSource = elMap.getSource('regions');

		if ( !elMapData || !mapSource ) {
			isClean.resolve(true);
		} else {
			elMap.off('mousemove', 'region', _popMove);
			elMap.off('mouseleave', 'region', _popLeave);
			elMap.off('click', 'region', _popClick);
			elMap.removeLayer('region');
			elMap.removeLayer('region-hover');
			elMap.removeSource('regions');
			elPopData.length = 0;
			elMapData = null;

			isClean.resolve(true);
		}

		return isClean.promise();
	}



	/*
	 *  Geometry source id
	 */

	var _mapID = {
		'level2': '69e5402c',
		'uk_level3': 'c8708372',
		'us_level3': 'b5294f92'
	};

	var _ccBound = {
		"ae": [[51.56934655000006,22.62094594300011],[56.383636915000096,26.074791972000142]],
		"ar": [[-73.58803584899991,-55.05201588299981],[-53.66155187999993,-21.786937763999916]],
		"au": [[112.911057,-54.770634],[159.111282,-9.222043]],
		"be": [[2.544855,49.496982],[6.408097,51.505114]],
		"bg": [[22.3805257504,41.2344859889],[28.5580814959,44.2349230007]],
		"br": [[-73.990238,-33.751358],[-32.390875,5.270972]],
		"ca": [[-140.99778,41.6751050889],[-52.6480987209,72.098075]],
		"ch": [[5.958,45.819],[10.493,47.81]],
		"cl": [[-109.45372473899987,-55.91850422299979],[-66.42080644399994,-17.506588197999974]],
		"cn": [[73.451005,18.163247],[134.976798,53.531943]],
		"cz": [[12.0901107788,48.55218276675],[18.8592338562,51.0555310416]],
		"de": [[5.871619,47.269859],[15.038112,55.056526]],
		"dk": [[8.08997684086,54.8000145534],[12.6900061378,57.730016588]],
		"es": [[-18.167225715,27.642238674],[4.337087436,43.79344310]],
		"fi": [[20.62316451,59.811224677],[31.56952478,70.075310364]],
		"fr": [[-4.788050159229584,41.362165],[9.56001631027,51.1485061713]],
		"gt": [[-92.229249,13.735338],[-88.225023,17.819326]],
		"hk": [[113.837331576,22.177069403],[114.40129642,22.56394603]],
		"hu": [[16.094035278,45.741343486],[22.877600546,48.56923289]],
		"ie": [[-10.66285,51.419897],[-5.996284,55.446575]],
		"in": [[68.1766451354,7.96553477623],[97.4025614766,35.4940095078]],
		"it": [[6.627731,35.494864],[18.521147,47.09264]],
		"jp": [[122.938161655,24.212103583],[153.985606316,45.520412502]],
		"mx": [[-118.40765,14.532098],[-86.710405,32.718654]],
		"my": [[99.64522806,0.851370341],[119.278086785,7.355780341]],
		"nl": [[3.307937,50.750367],[7.227498,53.576423]],
		"no": [[-9.11742102799991,-54.46249765399993],[33.64039147200011,80.7700869810]],
		"nz": [[166.4258270,-47.2871319],[178.5504760,-34.1439329]],
		"pe": [[-81.33755752899992,-18.33774620693788],[-68.68425248299991,-0.029092711999866]],
		"ph": [[116.928337,4.58694],[126.605347,21.070141]],
		"pl": [[14.12127,49.00613],[24.153276,54.835693]],
		"pt": [[-9.549835,36.959879],[-6.189159,42.154311]],
		"ro": [[20.242825969,43.650049948],[29.699554884,48.274832256]],
		"ru": [[19.66064,41.151416],[180,81.2504]],
		"sa": [[34.632336,16.347891],[55.666659,32.161009]],
		"se": [[11.10816491,55.342678127],[24.163413534,69.036355693]],
		"sg": [[103.605694535,1.15869869159],[104.4064174364,1.4720660897]],
		"sv": [[-90.095555,13.149017],[-87.723503,14.424133]],
		"ua": [[22.1328277588,44.3810424805],[40.1595153809,52.368927001]],
		"uk": [[-8.179851160822153,49.959999905],[1.768912,60.845474]],
		"us": [[-171.791110603,18.91619],[-66.96466,71.3577635769]],
		"za": [[16.45194,-34.83417],[32.891697,-22.12503]]
	};



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		unload: unload
	};
})();