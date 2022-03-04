HF.results.list = (function () {

	/*
	 *  Constants
	 */

	var apiListSearch = pathApi + 'horsefly/list/search/';



	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, elItem, elList, elGeoItem, elCardItem, elGeoList, elSalaryOpt;



	/*
	 *  Private cached data
	 */

	var _config = {
			searchId: 0,
			wammeeCount: 0,
			locations: 0,
			searchData: {}
		};

	var _cached = {};

	var _tempMax = 0;



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('searchSetup', function(searchObj) {
		_config.searchData = searchObj;

		// Get locations from payload
		var locs = JSON.parse(_config.searchData.payload.locations);
		// Reset geo obj key if just 1 location is found
		_config.searchData.geo = ( locs.length === 1 ) ? [locs[0].subContinent, locs[0].country, locs[0].region, locs[0].city] : [0,0,0,0];
		_config.locations = locs.length;
		// Get current geo position level
		var level = _getLevel();
		// Set results view with current level
		HF.views.set('results', 'level' + level, 'key');
	});

	events.on('mapDrilled', function(data) {
		// Get clicked location name
		var geoName = data[0];
		var geoArray = data[1].split('/');
		var level = geoArray.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;

		_config.searchData.geo = geoArray;
		// Set results view with next level
		HF.views.set('results', 'level' + level, elViewWrap);
	});


	// Bind
	function _eventsBind() {
		elItem.on('click', 'a.backbtn', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var target = $(this).data('target');

			if (extNow.length > 0) {
				var prevView = extNow[0];
				HF[prevView].unload();
			}

			if ( target === 'results' ) {
				// Going back => Get previous level (current - 1)
				var levelTarget = 0;
				var levelCurrent = _getLevel();

				if ( levelCurrent === 4 ) {
					// If this is a microregion result
					if ( _config.searchData.geo[3] === 'micro' ) {
						// Set previous target level
						levelTarget = levelCurrent - 3;
						// Reset previous geo position
						_config.searchData.geo = [0, 0, 0, 0];
					} else {
						// Set previous target level
						levelTarget = levelCurrent - 1;
						// Reset previous geo position
						_config.searchData.geo[levelTarget] = 0;
					}
				} else {
					// Set previous target level
					levelTarget = levelCurrent - 1;
					// Reset previous geo position
					_config.searchData.geo[levelTarget] = 0;
				}

				// Set results view with previous level
				HF.views.set('results', 'level' + levelTarget, elViewWrap);
			}

			if ( target === 'search' ) {
				events.emit('cleanMap');
				HF.views.set('search', 'build');
			}
		});

		elItem.on('click', 'a.toggle-map', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#alt').addClass('showing');
		});

		elGeoItem.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var parentLi = $(this).parent(),
				parentUl = parentLi.parent(),
				viewType = parentLi.attr('class'),
				geoPoint = parentUl.data('geopoint'),
				geoName = parentUl.data('geoname');

			console.log('GeoItem clicked: ', viewType);

			HF.views.setDetails(viewType, geoPoint, geoName, 'parent', 'ext');
		});

		elCardItem.on('click', 'a.geopoint', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var geoName = $(this).text();
			var geoPath = $(this).next('ul').data('geopoint');
			var geoArray = geoPath.split('/');
			// Going forth => Get next level (current + 1)
			// var level = _getLevel() + 1;
			var level = geoArray.filter(function(val) {
				return (val !== 0 && val !== '0');
			}).length;

			// Set current geo position with clicked name
			_config.searchData.geo = geoArray;
			// Set results view with next level
			HF.views.set('results', 'level' + level, elViewWrap);
		});

		elCardItem.on('click', 'small.help', function(e) {
			HF.views.modal({modalurl: 'sourcing', bgclose: false, isinfo: true});
		});

		elGeoList.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var parentLi = $(this).parent(),
				parentUl = parentLi.parent(),
				// Trigger profiles panel
				// viewType = (parentLi.attr('class') === 'candidates') ? 'profiles' : parentLi.attr('class'),
				viewType = parentLi.attr('class'),
				geoPoint = parentUl.data('geopoint'),
				geoName = parentUl.data('geoname');

			console.log('GeoList clicked: ', viewType);

			HF.views.setDetails(viewType, geoPoint, geoName, 'child', 'ext');
		});

		elSalaryOpt.on('change', function(e) {
			var isChecked = this.checked;

			$('#base-contents').toggleClass('show-rate', isChecked);
		});

		if ( $('#base-contents').hasClass('show-rate') ) {
			elSalaryOpt.prop('checked', true);
		}

		console.log('Events successfully binded');

		return true;
	}


	// Unbind
	function _eventsUnbind() {
		elItem.off('click');
		elGeoItem.off('click');
		elCardItem.off('click');
		elGeoList.off('click');
		elSalaryOpt.off('change');

		elViewWrap = null;
		elItem = null;
		elList = null;
		elGeoItem = null;
		elCardItem = null;
		elGeoList = null;
		elSalaryOpt = null;

		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | results level');

		elViewWrap = el;

		elItem = $('#' + el).find('#result-item');
		elList = $('#' + el).find('#result-list');

		elGeoItem = elItem.find('li > a');

		elCardItem = elList.find('.card-item');
		elGeoList = elCardItem.find('li > a');

		elSalaryOpt = $('#switch');

		$.when(
			HF.dropdownList.init('nav-wrapper', 'searchOpt'),
			_eventsBind()
		).then(function(added, binded) {
			if ( added, binded ) {
				events.emit('doneLoading', elViewWrap);
				console.groupEnd();
			}
		});
	}


	function getData(type, subtype) {
		if (!type) {
			return _getContext();
		} else {
			return (!subtype) ? _config[type] : _config[type][subtype];
		}
	}


	function unload(type) {
		var isUnload = $.Deferred();

		console.log('Unload view');

		_eventsUnbind();

		$.when(
			HF.dropdownList.unload('nav-wrapper'),
			_resolveCacheClean(type)
		).then(function(unloaded, cleaned) {
			if (unloaded && cleaned) {
				if (type === 'all') {
					_config.searchId = 0;
					_config.wammeeCount = 0;

					for (var key in _config.searchData) {
						if ( _config.searchData.hasOwnProperty(key)) {
							delete _config.searchData[key];
						}
					}

					isUnload.resolve(true);
				} else {
					isUnload.resolve(true);
				}
			}
		});

		return isUnload.promise();
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		var ctxReady = $.Deferred();
		_tempMax = 0;

		$.when(
			_fetchResults()
		).then(function (data) {
			ctxReady.resolve(data);
		});

		return ctxReady.promise();
	}


	// Get Geo Level Name
	function _getGeoData(geoArray) {
		var searchData = (!geoArray) ? _config.searchData.geo : geoArray,
			len = searchData.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;

		console.log('_getGeoData | searchData : ', searchData);
		console.log('_getGeoData | len : ', len);

		var name, code;

		if ( len === 0 ) {
			// Always use level 1 as minimum
			name = 'Worldwide';
			code = 'world';
			len = 1;
		} else if ( len === 2 ) {
			code = searchData[len - 1];
			name = HF.utils.codeToName( code );
		} else if ( len === 3 && searchData[len - 1] === 'all') {
			code = searchData[len - 2];
			name = HF.utils.codeToName( code );
		} else {
			code = searchData[len - 1];
			name = HF.utils.capAll( code );
		}

		return [len, name, code];
	}


	function _fetchResults() {
		console.log('Fetching Results: ', _config.searchData.payload);
		var isFirst = ( _config.searchId ) ? false : true,
			geoJson = [{subContinent: _config.searchData.geo[0], country: _config.searchData.geo[1], region: _config.searchData.geo[2], city: _config.searchData.geo[3], locationId: 0, radius: ""}],
			geoPath = ( isFirst ) ? _config.searchData.payload.locations : JSON.stringify(geoJson),
			geoCur  = _config.searchData.cur,
			payload = ( isFirst ) ? _config.searchData.payload : {searchId: _config.searchId, tags: _config.searchData.payload.tags, locations: geoPath, currency: geoCur, filters: _config.searchData.payload.filters, token: 'xtempx'},
			geoData = _getGeoData(),
			geoLevel = 'level' + geoData[0],
			geoName = _config.locations > 1 ? null : geoData[1];

		console.log('_fetchResults | geoData : ', geoData);
		console.log('_fetchResults | geoLevel : ', geoLevel);

		if ( !HF.utils.isEmptyObj(geoLevel) && _cached.hasOwnProperty(geoLevel) ) {
			console.log('Cached data found -> Reusing');
			events.emit('resultsReady', geoLevel);
			return _cached[geoLevel];
		} else {
			console.log('No cached data found -> Fetching');

			return $.ajax({
				type: 'POST',
				url: apiListSearch + 'demand',
				data: payload,
				dataType: 'json',
				crossDomain: true,
				dataFilter: function (data) {
					console.log('Data: ', data);
					var parsed = JSON.parse(data);

					if ( !HF.utils.isEmptyObj(parsed) ) {
						if ( isFirst ) {
							_config.searchId = parsed.searchId;
							_config.wammeeCount = parsed.wammeeCandidatesCount;
						}

						if ( parsed.multiCountry ) {
							if ( parsed.countryCount > 1 ) {
								geoName = 'Multiple Locations';
							} else {
								geoName = HF.utils.codeToName(parsed.countryCollection[0]);
							}
						}

						// Create new key and contents in cached global object
						_cached[geoLevel] = {
							overview: {},
							regions: {},
							maxTotal: 0
						};

						var regions = parsed.regions;

						for (var key in regions) {
							if ( regions.hasOwnProperty(key) ) {
								if ( !geoName ) {
									var tmpGeoArray = regions[key].originalLocation.geoPath.split('/');
									var tmpGeoTemp = _getGeoData(tmpGeoArray);
									geoName = tmpGeoTemp[1];
								}

								var regionOpt = (regions[key].focusLevel === 'city') ? 'deepest' : 'goDeep';

								if ( key.indexOf(' Plus ') > -1 ) {
									console.log('Result with radius');
									var tmpKey = regions[key].regionName;
									_cached[geoLevel].regions[tmpKey] = _mapResults(key, regions[key], geoCur, regionOpt, true);
								} else {
									_cached[geoLevel].regions[key] = _mapResults(key, regions[key], geoCur, regionOpt, false);
								}
							}
						}

						delete parsed.regions;

						// var overviewOpt	= ( isFirst ) ? 'isFirst' : _cached['level' + (geoData[0] - 1)].overview.location,
						var overviewOpt	= ( isFirst ) ? 'isFirst' : 'subsequent',
							geoFormated	= ( isFirst && _config.searchData.rad )
							? geoName + ' (' + _config.searchData.rad + ' mi. radius)'
							: geoName;

						_cached[geoLevel].overview = _mapResults(geoFormated, parsed, geoCur, overviewOpt, false);
					}

					_cached[geoLevel].maxTotal = _tempMax;

					events.emit('resultsReady', geoLevel);
					return JSON.stringify(_cached[geoLevel]);
				},
				success: function (results) {
					return results;
				}
			});
		}
	}


	function _mapResults(key, data, cur, opts, isMicroRegion) {
		var isOverview = ( opts === 'goDeep' || opts === 'deepest' ) ? false : true;
		var locId = (!isOverview) ? data.locationId : data.parentLocationId;
		var locPath = null;
		var salMax = (!isOverview) ? data.maxSalary : data.totalMaxSalary;
		var raw = (!isOverview) ? data.originalCandidatesCount : data.originalTotalCandidatesCount;
		var gen = (!isOverview) ? data.genderCounts : data.totalGenderCounts;
		var job = (!isOverview) ? data.advertsCount : data.totalAdvertsCount;
		var exp = (!isOverview) ? data.experienceCounts : data.totalExperienceCounts;
		var dem = null;
		_tempMax = (salMax > _tempMax) ? salMax : _tempMax;

		if ( !isOverview ) {
			if ( data.focusLevel === 'region' ) {
				var microPrefix = isMicroRegion ? 'micro' : 0;
				locPath = data.originalLocation.subContinent + '/' + data.originalLocation.country + '/' + data.regionName  + '/' + microPrefix;
			} else if ( data.focusLevel === 'city' ) {
				var dataLoc = data.originalLocation;
				var dataRegion = ( dataLoc.region === '0' ) ? 'all' : dataLoc.region;
				locPath = dataLoc.subContinent + '/' + dataLoc.country + '/' + dataRegion  + '/' + data.cityName;
			} else {
				locPath = data.originalLocation.geoPath;
			}

			if ( data.demographic !== undefined && data.demographic ) {
				dem = data.demographic;
			}
		} else {
			locPath = '0/0/0/0';

			if ( data.totalEthnicityBreakDown !== undefined && data.totalEthnicityBreakDown ) {
				dem = data.totalEthnicityBreakDown;
			}
		}

		return {
			candidates: (!isOverview) ? data.candidatesCount : data.totalCandidatesCount,
			currency: cur,
			explevel: [exp['0'], exp['1'], exp['2'], (exp['0'] + exp['1'] + exp['2'])],
			gender: (!gen) ? [0, 0, 0] : [gen.female, gen.male, (gen.female + gen.male)],
			demographic: dem,
			locationId: (!locId) ? key.replace(/\s/g,'').toLowerCase() : locId,
			jobposts: (!job) ? 0 : job,
			levelOpts: opts,
			location: key,
			locationPath: locPath,
			mapType: (!isOverview) ? [data.lon, data.lat] : data.mapType,
			salary: {
				min: (!isOverview) ? data.minSalary : data.totalMinSalary,
				avg: (!isOverview) ? data.avgSalary : data.totalAvgSalary,
				max: (!isOverview) ? data.maxSalary : data.totalMaxSalary
			},
			rate: {
				min: (!isOverview) ? dailyRate(data.minSalary) : dailyRate(data.totalMinSalary),
				avg: (!isOverview) ? dailyRate(data.avgSalary) : dailyRate(data.totalAvgSalary),
				max: (!isOverview) ? dailyRate(data.maxSalary) : dailyRate(data.totalMaxSalary)
			}
		};
	}

	function dailyRate(salary) {
		if ( window.rateEnabled ) {
			//return Math.round(0.0087 + (0.005 * salary));
			return Math.round(65 + (0.0095 * salary));
		} else {
			return 0;
		}
	}

	function _getLevel() {
		// Return length of values that are not 0
		var len = _config.searchData.geo.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;

		return parseInt(len);
	}


	function getCached( objKey ) {
		if ( !objKey ) {
			return _cached;
		} else {
			return _cached[objKey];
		}
	}


	function _resolveCacheClean(type) {
		var isClean = $.Deferred();

		if ( type && type === 'all') {
				isClean.resolve( cleanCached() );
		} else if ( type && type !== 'all' ) {
			if ( Object.keys(_cached).length > 1 && _cached.hasOwnProperty(type) ) {
				isClean.resolve( cleanCached(type) );
			} else {
				isClean.resolve(true);
			}
		} else {
			isClean.resolve(true);
		}

		return isClean.promise();
	}


	function cleanCached( objKey ) {
		var isClean = $.Deferred();

		if ( !objKey ) {
			for (var key in _cached) {
				if ( _cached.hasOwnProperty(key)) {
					delete _cached[key];
				}
			}
			isClean.resolve(true);
		} else {
			if ( _cached.hasOwnProperty(objKey)) {
				delete _cached[objKey];
			}
			isClean.resolve(true);
		}

		return isClean.promise();
	}


	function _addSearchOption(elID, ddlName) {
		var ddlAdded = $.Deferred();

		$.when(
			HF.dropdownList.init(elID, ddlName)
		).then(function (done) {
			if (done) {
				ddlAdded.resolve(done);
			}
		});

		return ddlAdded.promise();
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		getCached: getCached,
		cleanCached: cleanCached,
		unload: unload
	};
})();