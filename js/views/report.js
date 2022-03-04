(function () {

	/*
	 *  Cached DOM elements
	 */

	var $elMainWrap;



	/*
	 *  Constants
	 */

	var _config = {
		sid: 0,
		geo: '',
		cur: '',
		rad: 0,
		locations: null,
		tagGroups: null,
		filters: {male: 0, female: 0, yoe0: 0, yoe1: 0, yoe2: 0}
	},
	_cached,
	_tempMax = 0,
	_toComplete = 0,
	_completed = 0,
	_withError = 0,
	_errorMsg = 'HFr',
	genTxt = $('body').children('.generate-txt');

	var _country = [
		{code: 'ae', name: "United Arab Emirates", continent: "west asia", currency: "aed"},
		{code: "ar", name: "Argentina", continent: "south america", currency: "ars"},
		{code: "au", name: "Australia", continent: "australasia", currency: "aud"},
		{code: 'be', name: "Belgium", continent: "northern europe", currency: "euro"},
		{code: "bg", name: "Bulgaria", continent: "eastern europe", currency: "bgn"},
		{code: "br", name: "Brazil", continent: "south america", currency: "br"},
		{code: "ca", name: "Canada", continent: "north america", currency: "cad"},
		{code: 'ch', name: "Switzerland", continent: "western europe", currency: "chf"},
		{code: "cl", name: "Chile", continent: "south america", currency: "clp"},
		{code: "cn", name: "China", continent: "southeast asia", currency: "cny"},
		{code: "cz", name: "Czech Republic", continent: "eastern europe", currency: "czk"},
		{code: "de", name: "Germany", continent: "western europe", currency: "euro"},
		{code: "dk", name: "Denmark", continent: "central europe", currency: "euro"},
		{code: "es", name: "Spain", continent: "western europe", currency: "euro"},
		{code: "fi", name: "Finland", continent: "northern europe", currency: "euro"},
		{code: "fr", name: "France", continent: "western europe", currency: "euro"},
		{code: "gt", name: "Guatemala", continent: "central america", currency: "gtq"},
		{code: "hk", name: "Hong Kong", continent: "southeast asia", currency: "hkd"},
		{code: "hu", name: "Hungary", continent: "eastern europe", currency: "huf"},
		{code: "ie", name: "Ireland", continent: "northern europe", currency: "euro"},
		{code: "in", name: "India", continent: "south asia", currency: "in"},
		{code: "it", name: "Italy", continent: "western europe", currency: "euro"},
		{code: "jp", name: "Japan", continent: "east asia", currency: "jpy"},
		{code: "mx", name: "Mexico", continent: "north america", currency: "mxn"},
		{code: "my", name: "Malaysia", continent: "southeast asia", currency: "myr"},
		{code: "nl", name: "Netherlands", continent: "western europe", currency: "euro"},
		{code: "no", name: "Norway", continent: "northern europe", currency: "nok"},
		{code: "nz", name: "New Zealand", continent: "australasia", currency: "nzd"},
		{code: "pe", name: "Peru", continent: "south america", currency: "sol"},
		{code: "ph", name: "Philippines", continent: "southeast asia", currency: "ph"},
		{code: "pl", name: "Poland", continent: "eastern europe", currency: "pln"},
		{code: "pt", name: "Portugal", continent: "western europe", currency: "euro"},
		{code: "ro", name: "Romania", continent: "eastern europe", currency: "ron"},
		{code: "ru", name: "Russia", continent: "eastern europe", currency: "rub"},
		{code: "sa", name: "Saudi Arabia", continent: "west asia", currency: "sar"},
		{code: "se", name: "Sweden", continent: "northern europe", currency: "sek"},
		{code: "sg", name: "Singapore", continent: "southeast asia", currency: "sgd"},
		{code: "sv", name: "El Salvador", continent: "central america", currency: "dollar"},
		{code: "ua", name: "Ukraine", continent: "eastern europe", currency: "uah"},
		{code: "uk", name: "United Kingdom", continent: "northern europe", currency: "pound"},
		{code: "us", name: "United States", continent: "north america", currency: "dollar"},
		{code: "za", name: "South Africa", continent: "south africa", currency: "zar"}
	];

	var _currency = [
		{id: "euro", code: "EUR", symbol: "€", name: "Euro"},
		{id: "pound", code: "GBP", symbol: "£", name: "British pound sterling"},
		{id: "dollar", code: "USD", symbol: "$", name: "United States dollar"},
		{id: "aed", code: "AED", symbol: "د.إ", name: "United Arab Emirates dirham"},
		{id: "ars", code: "ARS", symbol: "$", name: "Argentine peso"},
		{id: "aud", code: "AUD", symbol: "$", name: "Australian dollar"},
		{id: 'bgn', code: 'BGN', symbol: 'лв', name: 'Bulgarian lev'},
		{id: "br", code: "BRL", symbol: "R$", name: "Brazilian real"},
		{id: "cad", code: "CAD", symbol: "$", name: "Canadian dollar"},
		{id: "chf", code: "CHF", symbol: "SFr.", name: "Swiss franc"},
		{id: "clp", code: "CLP", symbol: "$", name: "Chilean peso"},
		{id: "cny", code: "CNY", symbol: "¥", name: "Chinese yuan renminbi"},
		{id: "czk", code: "CZK", symbol: "Kč", name: "Czech koruna"},
		{id: "gtq", code: "GTQ", symbol: "Q", name: "Guatemalan quetzal"},
		{id: "hkd", code: "HKD", symbol: "HK$", name: "Hong Kong dollar"},
		{id: "huf", code: "HUF", symbol: "Ft", name: "Hungarian forint"},
		{id: "in", code: "INR", symbol: "₹", name: "Indian rupee"},
		{id: "jpy", code: "JPY", symbol: "¥", name: "Japanese yen"},
		{id: "mxn", code: "MXN", symbol: "$", name: "Mexican peso"},
		{id: "myr", code: "MYR", symbol: "RM", name: "Malaysian ringgit"},
		{id: "nok", code: "NOK", symbol: "kr", name: "Norwegian krone"},
		{id: "nzd", code: "NZD", symbol: "$", name: "New Zealand dollar"},
		{id: "sol", code: "SOL", symbol: "S/", name: "Peruvian Sol"},
		{id: "ph", code: "PHP", symbol: "₱", name: "Philippine peso"},
		{id: "pln", code: "PLN", symbol: "zł", name: "Polish zloty"},
		{id: "ron", code: "RON", symbol: "lei", name: "Romanian leu"},
		{id: "rub", code: "RUB", symbol: "₽", name: "Russian ruble"},
		{id: "sar", code: "SAR", symbol: "SR", name: "Saudi riyal"},
		{id: "sek", code: "SEK", symbol: "kr", name: "Swedish krona"},
		{id: "sgd", code: "SGD", symbol: "S$", name: "Singapore dollar"},
		{id: "uah", code: "UAH", symbol: "₴", name: "Ukrainian hryvnia"},
		{id: "zar", code: "ZAR", symbol: "R", name: "South African rand"}
	];

	var loadCount = 0;
	var loadMsg = ['Building search terms', 'Requesting data from APIs', 'Rendering search results', 'Preparing document for PDF'];
	var loadText = setInterval(function() {
			loadCount++;

			if ( loadCount > 5 ) {
				loadCount = 2;
			}

			if ( loadCount > 1 ) {
				genTxt.text(loadMsg[loadCount - 2]);
			}
		}, 4000);


	function init() {
		_getCount();
		_getMainData();
	}


	function _getCount() {
		var _pageURL = decodeURIComponent(window.location.search.substring(1)),
			_params = _pageURL.split('&').slice(9);

		for (var i = 0; i < _params.length; i++) {
			var option = _params[i].split('=');

			if ( option[1] === '1' ) {
				_toComplete++;
			}
		}
	}


	function _isChart(name) {
		return name.indexOf('chart-') === 0;
	}


	function _isEmptyObj(el) {
		if ( el.constructor === Object ) {
			for (var key in el) {
				return false;
			}

			return true;
		}
	}


	function _getGeoData(geoArray) {
		var searchData = (!geoArray) ? _config.geo : geoArray,
			len = searchData.filter(function(val) {
			return (val !== 0);
		}).length;

		var name;

		if ( len === 0 ) {
			name = 'Multiple Locations';
		} else if ( len === 2 ) {
			name = _codeToName( searchData[len - 1] );
		} else if ( len === 3 && searchData[len - 1] === 'all') {
			name = _codeToName( searchData[len - 2] );
		} else {
			name = _capAll( searchData[len - 1] );
		}

		return [len, name];
	}


	function _codeToName(key) {
		var name = _country.filter(function(cc) {
			return cc.code === key;
		}).map(function(cn) {
			return cn.name;
		});

		return name[0];
	}


	function _locationFormat(array) {
		array = array.map(function(str){
			return _capAll(str);
		});

		return array.join(', ');
	}


	function _capAll(strAll) {
		var srtArr = strAll.split(' ');

		srtArr = srtArr.map(function(str){
			return _capFirst(str);
		});

		return srtArr.join(' ');
	}


	function _capFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}


	function _addCommas(number, currency) {
		var symbol;

		if ( !currency ) {
			symbol = '';
		} else {
			var currencies = _currency.filter(function(cur) {
				return cur.id === currency;
			});

			if ( currencies.length ) {
				symbol = currencies[0].symbol;
			}
		}

		number += '';
		x = number.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var regx = /(\d+)(\d{3})/;

		while (regx.test(x1)) {
			x1 = x1.replace(regx, '$1' + ',' + '$2');
		}

		return symbol + x1 + x2;
	}


	function _kFormatter(number, currency, rounded) {
		var symbol, amount, divider, suffix;

		if ( number > 999999) {
			divider = 10000;
			suffix = 'M';
		} else if ( number > 999) {
			divider = 1000;
			suffix = 'K';
		} else {
			divider = 1;
			suffix = '';
		}

		if ( !currency ) {
			symbol = '';
		} else {
			var currencies = _currency.filter(function(cur) {
				return cur.id === currency;
			});

			if ( currencies.length ) {
				symbol = currencies[0].symbol;
			}
		}

		if ( !rounded ) {
			amount = Math.round(number/divider);
		} else {
			amount = ( rounded === 'floor' ) ? Math.floor(number/divider) : Math.ceil(number/divider);
		}

		if ( suffix === 'M' ) {
			amount = (amount/100).toFixed(2);
		}

		return symbol + amount + suffix;
	}


	function _meterMin(value, total) {
		return (value * 100) / total;
	}


	function _meterMax(value, total) {
		return 100 - ( (value * 100) / total );
	}


	function _pctRound(value, total, isFill) {
		var percent = (value * 100) / total,
			multiplier = Math.pow(10, 0),
			temp = Math.round(percent * multiplier) / multiplier;

		return (!isFill) ? temp : 100 - temp;
	}


	function _getMainData() {
		var params = ['sid', 'geo', 'cur', 'rad'],
			filter = ['male', 'female', 'yoe0', 'yoe1', 'yoe2'];

		$.when(
			_getParams('params', params),
			_getParams('filters', filter)
		).then(function(ready1, ready2) {
			if (ready1, ready2) {
				return _getSearchTerms();
			}
		}).then(function(done) {
			console.log('done: ', done);

			if ( done ) {
				$elMainWrap = $('#pdf-report');

				_config.geo = _config.geo.split('/').map(function(item) {
					return (item === '0') ? Number(item) : item;
				});

				_config.rad = Number(_config.rad);

				_getReportOptions();
			}
		});
	}


	function _getParams(type, arr) {
		var ready = $.Deferred(),
			count = 0,
			total = arr.length;

		arr.forEach(function(param) {
			param = String(param).replace(/[.*+?|()[]{}\]/g, '\$&');
			var match = RegExp('[?&]' + param + '=([^&]*)').exec(window.location.search);

			if (match) {
				if (type === 'filters') {
					_config.filters[param] = decodeURIComponent(match[1].replace(/\+/g, ' '));
				} else {
					_config[param] = decodeURIComponent(match[1].replace(/\+/g, ' '));
				}

				count++;
			} else {
				if (type === 'filters') {
					_config.filters[param] = null;
				} else {
					_config[param] = null;
				}
			}
		});

		ready.resolve( (count < total) ? false : true );
		return ready.promise();
	}


	function _getReportOptions() {
		var pageURL = decodeURIComponent(window.location.search.substring(1)),
			pageOpts = pageURL.split('&').slice(9),
			charts = 0;

		for (var i = 0; i < pageOpts.length; i++) {
			var option = pageOpts[i].split('=');

			if ( option[1] === '1' ) {
				if ( option[0] === 'terms' ) {
					_makeSearchText();
					_buildTags();
				}

				if ( option[0] === 'mapdata' ) {
					_loadMapImage();
				}

				if ( option[0] === 'results' ) {
					_fetchResults('snd');
				}

				if ( _isChart(option[0]) ) {
					charts++;

					var chartName = option[0].split('-');

					if (chartName[1] === 'breakdown') {
						if (!_cached) {
							_fetchResults('gender');
						} else {
							_buildBreakdown();
						}
					} else if (chartName[1] === 'ethnicity') {
						if (!_cached) {
							_fetchResults('ethnic');
						} else {
							_buildEthnicity();
						}
					} else {
						_getChart(chartName[1]);
					}
				}

				if ( option[0] === 'associated' ) {
					_fetchList('companies');
					_fetchList('jobTitles');
					_fetchList('hardSkills');
				}
			} else {
				if ( _isChart(option[0]) ) {
					var temp = option[0].split('-');

					$('#' + temp[1]).parent('.search-block').remove();
				} else {
					$('#' + option[0]).parent('.page').remove();
				}
			}
		}

		if (!charts) {
			$('#charts').parent('.page').remove();
		}

		checkComplete();
	}


	function checkComplete() {
		if ( _completed < _toComplete ) {
			if ( _withError ) {
				if ( Number(_withError) + Number(_completed) === _toComplete ) {
					console.log('Summary: ' + _toComplete + '_' + _completed + '_' + _withError);
					console.log('Error: ' + _errorMsg);

					genTxt.html('There was an error loading your PDF Preview<p>Reporting this error using the code below will help us understand it better.<br>' + _errorMsg + '</p>');
					$('html').addClass('failed').removeClass('generate');

					loadCount = -1;
					clearInterval(loadText);

					return;
				}
			}

			window.setTimeout(checkComplete, 500);
		} else {
			$('html').removeClass('generate');

			loadCount = -1;
			clearInterval(loadText);
		}
	}


	function _makeSearchText() {
		var $el = $('#search-text'),
			len = _config.geo.filter(function(val) {return (val !== 0);}).length,
			country = '<strong>' + _codeToName(_config.geo[1]) + '</strong>',
			radius = (_config.rad),
			city, txt;

		if (len === 2) {
			txt = country;
		} else if (len === 3) {
			txt = '<strong>' + _capAll(_config.geo[2]) + '</strong> in ' + country;
		} else if (len === 4) {
			city = '<strong>' + _locationFormat([_config.geo[3], _config.geo[2]]) + '</strong> in ' + country;
			txt = (radius)
				? 'a radius of <strong>' + radius + ' mi.</strong> from ' + city
				: 'the city of ' + city;
		}
		
		$el.append(txt);
	}


	function _getSearchTerms() {
		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/search',
			data: {searchId: _config.sid, pdf: true},
			crossDomain: true,
			success: function (data) {
				console.log('_getSearchTerms | Data: ', data);

				_config.tagGroups = data.tags.or;
				_config.locations = JSON.parse(data.geoPath);

				_errorMsg += '_' + _config.sid;
			},
			error: function (error) {
				console.log(error);
				_errorMsg += '_' + _config.sid + '_St' + error.status;

				console.log('Summary: ' + _toComplete + '_' + _completed + '_1');
				console.log('Error: ' + _errorMsg);

				genTxt.html('There was an error loading your PDF Preview<p>Reporting this error using the code below will help us understand it better.<br>' + _errorMsg + '</p>');
				$('html').addClass('failed').removeClass('generate');
			}
		});
	}


	// Parse boolean object with search data
	function _buildTags() {
		var $el = $('#search-groups');

		$.each(_config.tagGroups, function(i, group) {
			var $wrapper = $('<div/>')
				.attr('class', (!group.include) ? 'search-group exclude' : 'search-group')
				.append(
					$('<h3/>').text('Group ' + (i + 1))
				);

			var $group = $('<div/>')
				.attr('class', 'group-tag')
				.appendTo($wrapper);

			$.each(group.keywords, function(i, item) {
				$('<span/>')
					.attr('class', 'tag ' + item.type)
					.text(item.keyword)
				.appendTo($group);
			});

			$el.append($wrapper);
		});

		_completed++;
	}


	function _fetchResults(build) {
		var level = _config.geo.filter(function(val) {
				return (val !== 0 && val !== '0');
			}).length;

		console.log('Fetch Results | Config Geo: ', _config.geo);
		console.log('Fetch Results | Level: ', level);
		console.log('Fetch Results | Config Locations: ', _config.locations);

		var _locs = ( !level ) ? _config.locations : [{subContinent: _config.geo[0], country: _config.geo[1], region: _config.geo[2], city: _config.geo[3], locationId: 0, radius: ""}];

		var geoCur  = _config.cur,
			payload = {searchId: _config.sid, trigger: 'parent', locations: JSON.stringify(_locs), currency: geoCur, filters: JSON.stringify(_config.filters), pdf: true},
			geoData = _getGeoData(),
			geoName = geoData[1];

		console.log('Fetch Results | Payload: ', payload);

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/list/search/demand',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data);

				if ( !_isEmptyObj(parsed) ) {
					_cached = {
						overview: {},
						regions: {},
						maxTotal: 0
					};

					var regions = parsed.regions;

					for (var key in regions) {
						if ( regions.hasOwnProperty(key) ) {
							_cached.regions[key] = _mapResults(key, regions[key], geoCur, 'region');
						}
					}

					delete parsed.regions;

					var geoFormated	= ( _config.rad )
						? geoName + ' (' + _config.rad + ' mi. radius)'
						: geoName;

					_cached.overview = _mapResults(geoFormated, parsed, geoCur, 'overview');
				}

				_cached.maxTotal = _tempMax;

				return JSON.stringify(_cached);
			},
			success: function (results) {
				if (build === 'snd') {
					_prepareResults();
				} else if (build === 'gender') {
					_buildBreakdown();
				} else {
					_buildEthnicity();
				}
			},
			error: function (error) {
				console.log(error);
				_withError++;
				_errorMsg += '_SnD' + error.status;
			}
		});
	}


	function _mapResults(key, data, cur, opts) {
		var isOverview = ( opts === 'overview' ) ? true : false;
		var salMax = (!isOverview) ? data.maxSalary : data.totalMaxSalary;
		var gen = (!isOverview) ? data.genderCounts : data.totalGenderCounts;
		var job = (!isOverview) ? data.advertsCount : data.totalAdvertsCount;
		var exp = (!isOverview) ? data.experienceCounts : data.totalExperienceCounts;
		var dem = null;
		_tempMax = (salMax > _tempMax) ? salMax : _tempMax;

		if ( !isOverview ) {
			if ( data.demographic !== undefined && data.demographic ) {
				dem = data.demographic;
			}
		} else {
			if ( data.totalEthnicityBreakDown !== undefined && data.totalEthnicityBreakDown ) {
				dem = data.totalEthnicityBreakDown;
			}
		}

		return {
			candidates: (!isOverview) ? data.candidatesCount : data.totalCandidatesCount,
			currency: cur,
			explevel: (!exp) ? [0, 0, 0, 0] : [exp['0'], exp['1'], exp['2'], (exp['0'] + exp['1'] + exp['2'])],
			gender: (!gen) ? [0, 0, 0] : [gen.female, gen.male, (gen.female + gen.male)],
			demographic: dem,
			jobposts: (!job) ? 0 : job,
			location: key,
			salary: {
				min: (!isOverview) ? data.minSalary : data.totalMinSalary,
				avg: (!isOverview) ? data.avgSalary : data.totalAvgSalary,
				max: (!isOverview) ? data.maxSalary : data.totalMaxSalary
			}
		};
	}


	function _prepareResults() {
		var total = _cached.maxTotal;

		for (var key in _cached) {
			if ( _cached.hasOwnProperty(key) ) {
				if ( key === 'overview' ) {
					_buildResults( _cached[key], total, 'overview' );
				}

				if ( key === 'regions' ) {
					for (var reg in _cached[key]) {
						_buildResults( _cached[key][reg], total, 'card-item' );
					}
				}
			}
		}

		_completed++;
	}


	function _buildResults(data, total, type) {
		var cur = data.currency,
			tmpl = $('#geotmpl')
				.clone()
				.removeAttr('id')
				.attr('class', type)
				.appendTo( $('#georesults') );

		tmpl.find('h3').text( data.location );
		tmpl.find('li.candidates span').html( _addCommas(data.candidates) );
		tmpl.find('li.jobposts span').html( _addCommas(data.jobposts) );

		if ( !data.salary.avg ) {
			tmpl.find('li.salary > .block').html('<strong>sourcing</strong><p>avg. salary</p>');
		} else {
			tmpl.find('li.salary small.min').html( _kFormatter(data.salary.min, cur, 'floor') );
			tmpl.find('li.salary strong').html( _addCommas(data.salary.avg, cur) );
			tmpl.find('li.salary small.max').html( _kFormatter(data.salary.max, cur, 'ceil') );
			tmpl.find('li.salary .fill').css({
				'left': _meterMin(data.salary.min, total),
				'right': _meterMax(data.salary.max, total)
			});
		}
	}


	function _buildBreakdown() {
		var gen = $('#breakdown'),
			exp = $('#experience'),
			gd = _cached.overview.gender,
			ed = _cached.overview.explevel;

		gen.find('.male > .fill').css('top', _pctRound(gd[1], gd[2], true) + '%');
		gen.find('.female > .fill').css('top', _pctRound(gd[0], gd[2], true) + '%');
		gen.find('.data > .data-male').text(_pctRound(gd[1], gd[2]) + '%');
		gen.find('.data > .data-female').text(_pctRound(gd[0], gd[2]) + '%');

		exp.find('.exp-block.jr > .row').css('top', _pctRound(ed[0], ed[3], true) + '%');
		exp.find('.exp-block.md > .row').css('top', _pctRound(ed[1], ed[3], true) + '%');
		exp.find('.exp-block.sr > .row').css('top', _pctRound(ed[2], ed[3], true) + '%');
		exp.find('.exp-block.jr span').text(_pctRound(ed[0], ed[3]) + '%');
		exp.find('.exp-block.md span').text(_pctRound(ed[1], ed[3]) + '%');
		exp.find('.exp-block.sr span').text(_pctRound(ed[2], ed[3]) + '%');

		_completed++;


	}


	function _getChart(chartName) {
		var geoPath = _config.geo.join('/'),
			payload = {searchId: _config.sid, trigger: 'parent', type: 'candidates', currency: _config.cur, filters: JSON.stringify(_config.filters), view: 'chart', pdf: true};

		$.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/chart/search/' + geoPath + '/' + chartName,
			data: payload,
			dataType: 'json',
			crossDomain: true,
			success: function (data) {
				if (chartName === 'demand') {
					_combinedChart(data);
				} else {
					_simpleChart(chartName, data);
				}
			},
			error: function (error) {
				console.log(error);
				_withError++;
				_errorMsg += '_C' + chartName.substring(0, 2) + error.status;
			}
		});
	}

	function _buildEthnicity() {
		var _ethnic = _cached.overview.demographic;
		var ethnicChart = 'chart-ethnicity';
		var ethnicData = [];
		var ethnicityColor = {
			asian: '#04202c',
			black: '#00c4aa',
			east_or_southeast_asian: '#a18051',
			hispanic: '#4584c4',
			indigenous: '#4c9059',
			maori: '#eb5b30',
			mixed: '#f9a100',
			not_declared: '#cf4f9a',
			other: '#7996aa',
			white: '#765fbb'
		};

		if ( !_ethnic ) {
			$('#ethnicity').parent('.search-block').remove();
			_completed++;
		} else {
			for ( var key in _ethnic ) {
				if ( _ethnic.hasOwnProperty(key) ) {
					if ( key !== 'total' && _ethnic[key] ) {
						var formattedName = null;

						if ( key === 'east_or_southeast_asian' ) {
							formattedName = 'East or Southeast Asian';
						} else if ( key === 'not_declared' ) {
							formattedName = 'Not declared';
						} else {
							formattedName = key.charAt(0).toUpperCase() + key.slice(1);
						}

						var percent = _ethnic[key] * 100;
						var rounded = Math.round((percent + Number.EPSILON) * 100) / 100;
						ethnicData.push({name: formattedName, value: rounded, color: ethnicityColor[key]});
					}
				}
			}

			var maxFontSizeForWidth = function(text, width, i) {
				i = (typeof i === "undefined") ? 1 : i;

				if ( $('#sizeCalculator').length === 0 ) {
					mydiv = $('<div id="sizeCalculator" style="font-family: Arial;width: auto;font-size: ' + i + 'px;position: absolute;visibility: hidden;height: auto;white-space: nowrap;bottom: 0px;">' + text + '</div>');
					$('body').append(mydiv);
				} else {
					mydiv = $($('#sizeCalculator')[0]);
					mydiv.html(text);
					mydiv.css('font-size', i + 'px');
				}

				calculatedWidth = mydiv[0].clientWidth;

				if (calculatedWidth > width) {
					return i - 1;
				} else {
					i++;
					return maxFontSizeForWidth(text, width, i);
				}
			};

			var textWithAdaptiveSize = function(point) {
				var maxFontSize = 28,
					minFontSize = 12,
					labelMaxHeight = point.shapeArgs.height - 20,
					labelMaxWidth = point.shapeArgs.width - 30,
					textMaxWidth = maxFontSizeForWidth(point.value, labelMaxWidth);

				iFontSize = Math.min(maxFontSize, textMaxWidth);

				if ( iFontSize > minFontSize ) {
					return '<div class="tree-label"><span class="value" style="font-size:' + iFontSize + 'px;">' + point.value + '%</span><span>' + point.name + '</span></div>';
				} else {
					return '';
				}
			};

			Highcharts.chart(ethnicChart, {
				title: {
					text: '',
				},
				accessibility: {
					point: {
						valueSuffix: '%'
					}
				},
				tooltip: {
					enabled: false
				},
				plotOptions: {
					series: {
						animation: false
					},
					treemap: {
						allowPointSelect: true,
						cursor: 'pointer'
					}
				},
				series: [{
					type: 'treemap',
					layoutAlgorithm: 'squarified',
					data: ethnicData,
					dataLabels: {
						enabled: true,
						useHTML: true,
						allowOverlap: false,
						formatter: function() {
							return textWithAdaptiveSize(this.point);
						}
					},
					legendType: 'point',
					showInLegend: true
				}],
				credits: {
					enabled: false
				},
				exporting: {
					enabled: false
				}
			}, function(ethnicChart) {
				_completed++;
			});
		}
	}


	function _combinedChart(data) {
		var elChart = 'chart-demand';

		Highcharts.chart(elChart, {
			title: {
				text: '',
			},
			xAxis: {
				categories: data.xAxisObj
			},
			series: data.seriesObj,
			plotOptions: {
				series: {
					animation: false,
					stacking: 'normal',
					borderColor: 'rgba(0,0,0,0)',
					borderWidth: 0,
					states: {
						inactive: {
							opacity: 1
						}
					}
				}
			},
			credits: {
				enabled: false
			},
			exporting: {
				enabled: false
			},
			yAxis: [{
				labels: {
					style: {
						color: '#2196F3'
					}
				},
				title: {
					text: 'Candidates',
					style: {
						color: '#2196F3'
					}
				}
			}, {
				title: {
					enabled: true,
					text: 'Candidates per Role',
					style: {
						color: '#000008'
					}
				},
				labels: {
					style: {
						color: '#000008'
					}
				}
			}, {
				title: {
					enabled: true,
					text: 'Avg Salary',
					style: {
						color: '#3bb32b'
					}
				},
				labels: {
					style: {
						color: '#3bb32b'
					}
				},
				min: 0,
				opposite: true
			}],
			tooltip: {
				enabled: false
			}
		}, function(elChart) {
			_completed++;
		});
	}


	function _simpleChart(chartName, data) {
		var elChart = 'chart-' + chartName;

		Highcharts.chart(elChart, {
			chart: {
				type: 'bar',
				inverted: false
			},
			title: {
				text: '',
			},
			xAxis: {
				categories: data.xAxisObj
			},
			series: data.seriesObj,
			plotOptions: {
				series: {
					animation: false,
					stacking: 'normal',
					borderColor: '#2b98f0',
					borderWidth: 0,
					states: {
						inactive: {
							opacity: 1
						}
					}
				}
			},
			credits: {
				enabled: false
			},
			exporting: {
				enabled: false
			},
			yAxis: [{
				labels: {
					style: {
						color: '#000008'
					},
					enabled: false
				},
				title: {
					text: 'Frequency',
					style: {
						color: '#000008'
					}
				}
			}],
			tooltip: {
				enabled: false
			}
		}, function(elChart) {
			_completed++;
		});
	}


	function _fetchList(viewType) {
		var geoPath = _config.geo.join('/'),
			payload = {searchId: _config.sid, trigger: 'parent', type: 'candidates', currency: _config.cur, filters: JSON.stringify(_config.filters), view: 'list', pdf: true};

		$.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/list/search/' + geoPath + '/' + viewType,
			data: payload,
			dataType: 'json',
			crossDomain: true,
			success: function (data) {
				_buildList(data, viewType);
			},
			error: function (error) {
				console.log(error);
				_withError++;
				_errorMsg += '_L' + viewType.substring(0, 2) + error.status;
			}
		});
	}


	function _buildList(data, viewType) {
		var $list = $('#list-' + viewType);

		$list.find('.loading').remove();

		$.each(data.perspectiveClustersList, function (i, item) {
			if (i >= 21) {
				return false;
			}

			$('<li />')
				.text(item.itemTitle)
				.appendTo($list);
		});

		if ( viewType === 'hardSkills' ) {
			_completed++;
		}
	}


	function _loadMapImage() {
		var imgPathS3 = 'https://s3.amazonaws.com/jtw-images/maps';
		$('#map-target').attr('src', imgPathS3 + '/' +  _config.sid + '.png');

		_completed++;
	}


	$('ul.export-actions').on('click', 'li > a', function (e) {
		e.preventDefault();

		var html = $('html').html();
		var license = 'T3gdshGJ9evx';
		var data = {
			html: html,
			license: license,
			page_size: 'Letter',
			css_media_type: 'print',
			orientation: 'portrait'
		};
		var serialized = Object.keys(data).map(function(k) { 
			return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
		}).join('&');

		var filename = 'horsefly-report';

		genTxt.text('Generating PDF File');
		$('html').addClass('generate');

		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			var a;

			if (xhttp.readyState === 4 && xhttp.status === 200) {
				$('html').removeClass('generate');
				genTxt.text('Loading PDF Preview');

				if (window.navigator && window.navigator.msSaveOrOpenBlob) {
					window.navigator.msSaveOrOpenBlob(xhttp.response, filename.replace(/(\s+|\.)/g, '_') + ".pdf");
				} else {
					a = document.createElement('a');
					a.href = window.URL.createObjectURL(xhttp.response);
					a.download = filename.replace(/(\s+|\.)/g, '_') + ".pdf";
					a.style.display = 'none';
					document.body.appendChild(a);
					a.click();
				}
			}
		};

		xhttp.open("POST", "https://pdfmyurl.com/api", true);
		xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhttp.responseType = 'blob';
		xhttp.send(serialized);
	});


	init();
}());