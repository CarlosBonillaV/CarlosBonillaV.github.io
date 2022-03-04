HF.candidates = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, $elWrapMain, $elWrapDets, $elBreakdown, $elChartSwitch, $elTabList, elChartWrap, elChart, elEthnicWrap, elEthnic, elTree;



	/*
	 *  Private cached data
	 */

	var _geoPoint, _trigger, _gender, _exp, _ethnic,
		_configBase = [
		{
			'viewName': 'demand',
			'tabTitle': 'supply and demand'
		},
		{
			'viewName': 'schools',
			'tabTitle': 'universities'
		},
		{
			'viewName': 'jobTitles',
			'tabTitle': 'job titles'
		},
		{
			'viewName': 'companies',
			'tabTitle': 'companies'
		},
		{
			'viewName': 'hardSkills',
			'tabTitle': 'keywords'
		}
	];



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		// Set active tab
		$elTabList.find('a[data-tab="' + perspective[1] + '"]').parent('li').addClass('active');

		// Click on tab element
		$elTabList.on('click', 'a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).parent().hasClass('active') ) {
				return false;
			}

			var viewName = $(this).data('tab');
			_toggleView( viewName, true );
		});

		$elWrapMain.on('click', 'a.backbtn', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_eventsUnbind();
			var $el = $('#' + elViewWrap);
			$el.removeClass('candidates');

			setTimeout(function() {
				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;
			}, 500);
		});

		$elWrapMain.on('click', 'a.switch-view', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var viewName = $(this).hasClass('list') ? 'list' : 'chart';
			$(this).toggleClass('list');
			_toggleView( viewName, false );
		});

		$('#' + elChartWrap).on('click', 'a.projections', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).addClass('loading');
			var type = $(this).data('type');
			var value = $(this).data('value');

			_showProjection(type, value, 'future');
		});

		console.log('Events successfully binded');

		return true;
	}


	// Unbind
	function _eventsUnbind() {
		$elWrapMain.off('click');
		$elTabList.off('click');

		_geoPoint = null;
		_trigger = null;
		_gender = null;
		_exp = null;
		_ethnic = null;

		elChartWrap	= null;
		elEthnicWrap = null;
		$elWrapMain	= null;
		$elWrapDets	= null;
		$elBreakdown = null;
		$elChartSwitch = null;
		$elTabList  = null;
		elTree = null;

		console.log('Events successfully unbinded');

		return true;
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init details view | candidates');

		elViewWrap	= el;
		elChartWrap	= 'perspective-wrap';
		elEthnicWrap = 'ethnicity-wrap';
		$elWrapMain	= $('#ext-wrap');
		$elWrapDets	= $('#ext-details');
		$elBreakdown = $('#demographics');
		$elChartSwitch = $('#perspective-switch');
		$elTabList	= $('#tabs-wrapper').children('.tabs');

		// Initialize perspective view
		perspective[2] = 'candidates';

		if ( perspective[0] === 'list' ) { 
			$elWrapMain.find('a.switch-view').removeClass('list');
		}

		$.when(
			_eventsBind()
		).then(function(binded) {
			if (binded) {
				return _getChartData();
			}
		}).then(function(charted) {
			if ( charted ) {
				$('#' + el).addClass('candidates');
				console.groupEnd();

				setTimeout(function() {
					$('#' + el).removeClass('loading');
				}, 300);
			}
		});
	}


	function getData(geoPoint, geoName, trigger) {
		return _getBaseData(geoPoint, geoName, trigger);
	}


	function unload() {
		var isUnload = $.Deferred();

		console.log('Unload details view');

		var $el = $('#' + elViewWrap);
		$el.removeClass('candidates');

		$.when(
			_eventsUnbind()
		).then(function(unbinded) {
			if (unbinded) {
				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;

				isUnload.resolve(unbinded);
			}
		});

		return isUnload.promise();
	}



	// DOM
	function _toggleView(viewName, isType) {
		if ( perspective[0] === 'chart' ) {
			if ( elChart ) {
				elChart.destroy();
			}

			if ( window.hasEthnicity && elEthnic ) {
				elEthnic.destroy();
				elEthnic = null;
			}
		}

		if ( isType ) {
			// Reset active tabs
			$elTabList.children('li.active').removeClass('active');
			// Set active tab
			$elTabList.find('a[data-tab="' + viewName + '"]').parent('li').addClass('active');
			// Change perspective view name
			perspective[1] = viewName;

			if ( viewName === 'demand' || viewName === 'schools' ) {
				perspective[2] = 'candidates';
			}
		} else {
			// Change perspective view name
			perspective[0] = viewName;
		}

		$('#' + elChartWrap).addClass('loading').empty();

		if ( window.hasEthnicity ) {
			$('#' + elEthnicWrap).empty();
		}

		$elBreakdown.empty();

		// Initialize perspective view switch
		if ( window.hasAdvertsView ) {
			_initSwitch();
		}

		$.when(
			_getChartData()
		).then(function(charted) {
			if ( charted ) {
				setTimeout(function() {
					$('#' + elChartWrap).removeClass('loading');
				}, 300);
			}
		});
	}


	function _initSwitch(type) {
		var $opts = $elChartSwitch.find('span');
		$opts.removeClass('active');
		$opts.off('click');

		if ( perspective[1] !== 'demand' && perspective[1] !== 'schools' ) {
			$elChartSwitch.find('span[data-type="' + perspective[2] + '"]').addClass('active');
			$elChartSwitch.css('display', 'inline-block');

			$opts.on('click', function(e) {
				if ( $(this).hasClass('active') ) {
					return false;
				}

				var value = $(this).data('type');

				$opts.removeClass('active');
				$(this).addClass('active');

				_toggleSwitch(value);
			});
		} else {
			$elChartSwitch.css('display', 'none');
		}
	}


	function _toggleSwitch(type) {
		if ( perspective[0] === 'chart' ) {
			if ( elChart ) {
				elChart.destroy();
			}

			console.log('_toggleSwitch - has ethnicity: ', window.hasEthnicity);
			console.log('_toggleSwitch - ethnic container: ', elEthnic);

			if ( window.hasEthnicity && elEthnic ) {
				elEthnic.destroy();
				elEthnic = null;
			}
		}

		$('#' + elChartWrap).addClass('loading').empty();

		if ( window.hasEthnicity ) {
			$('#' + elEthnicWrap).empty();
		}

		$elBreakdown.empty();

		perspective[2] = type;

		$.when(
			_getChartData()
		).then(function(charted) {
			if ( charted ) {
				setTimeout(function() {
					$('#' + elChartWrap).removeClass('loading');
				}, 300);
			}
		});
	}



	/*
	 *  Private methods
	 */

	function _getBaseData(geoPoint, geoName, trigger) {
		var ctxReady = $.Deferred();

		console.log('_trigger: ', trigger);

		_geoPoint = geoPoint;
		_trigger = trigger;

		var tmpGeoArray = _geoPoint.split('/'),
			tmpGeoLen = tmpGeoArray.filter(function(val) {
				return (val !== 0 && val !== '0');
			}).length,
			tmpChildLen = tmpGeoLen - 1,
			tmpGeoName = (tmpGeoLen === 2) ? HF.utils.codeToName(tmpGeoArray[tmpChildLen]) : tmpGeoArray[tmpChildLen];

		if ( !tmpGeoLen ) {
			var tmpData = HF.results.list.getData('searchData'),
				tmpLocs = JSON.parse( tmpData.payload.locations ),
				isMulti = tmpLocs.length > 1,
				tmpArr = isMulti ? [0,0,0,0] : tmpData.geo,
				tmpLen = tmpArr.filter(function(val) {return (val !== 0 && val !== '0');}).length,
				tmpName = null;

			if ( !tmpLen ) {
				tmpGeoName = 'Multiple Locations';
			} else {
				tmpGeoName = (tmpLen === 2) ? HF.utils.codeToName(tmpArr[tmpLen - 1]) : tmpArr[tmpLen - 1];
			}
		}

		var tmpDisplayName = (!geoName || trigger === 'parent') ? tmpGeoName : geoName;

		console.log('_geoPoint: ', _geoPoint);
		console.log('tmpGeoArray: ', tmpGeoArray);
		console.log('tmpLen: ', tmpGeoLen);
		console.log('tmpChildLen: ', tmpChildLen);
		console.log('tmpGeoName: ', tmpGeoName);

		setTimeout(function() {
			ctxReady.resolve({location: tmpGeoName, locName: tmpDisplayName, tabItems: _configBase});
		}, 300);

		return ctxReady.promise();
	}

	function _getChartData() {
		var chartComplete = $.Deferred();

		console.log('Fetching data');

		$.when(
			_fetchPerspective()
		).then(function (data) {
			console.log('Perspective Data: ', data);
			if ( data ) {
				if ( !data.showCharts ) {
					return _errorMsg();
				} else {
					if ( perspective[0] === 'chart' ) {
						if ( perspective[1] === 'demand' ) {
							if ( window.hasEthnicity && _ethnic ) {
								$('#' + elEthnicWrap).css('display', 'block');
								_ethnicityChart(_ethnic);
							}

							return _combinedChart(data);
						} else {
							// Initialize perspective view switch
							if ( window.hasAdvertsView ) {
								_initSwitch();
							}

							return _simpleChart(data);
						}
					} else {
						if ( perspective[1] === 'demand' ) {
							return _demandList(data);
						} else {
							// Initialize perspective view switch
							if ( window.hasAdvertsView ) {
								_initSwitch();
							}

							return _simpleList(data);
						}
					}
				}
			} else {
				return _errorMsg();
			}
		}).then(function (chartReady) {
			chartComplete.resolve(chartReady);
		});

		return chartComplete.promise();
	}


	function _fetchPerspective() {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: _trigger, type: perspective[2], currency: searchData.cur, filters: searchData.payload.filters, view: perspective[0]},
			searchLocs = JSON.parse( searchData.payload.locations ),
			isMulti = searchLocs.length > 1,
			geoArray = _geoPoint.split('/'),
			tmpLen = geoArray.filter(function(val) {return (val !== 0 && val !== '0');}).length,
			geoLen = (tmpLen === 4 && geoArray[3] === 'micro') ? tmpLen - 1 : tmpLen,
			childLen = geoLen - 1,
			geoName = (geoLen === 2) ? HF.utils.codeToName(geoArray[childLen]) : geoArray[childLen],
			cachedLen = searchData.geo.filter(function(val) {return (val !== 0 && val !== '0');}).length,
			cachedTmp = (!cachedLen) ? HF.results.list.getCached('level1') : HF.results.list.getCached('level' + cachedLen),
			geoPath = (_trigger === 'child') ? _geoPoint : searchData.geo.join('/');

			console.log('Payload: ', payload);
			console.log('geoArray: ', geoArray);
			console.log('len: ', geoLen);
			console.log('childLen: ', childLen);
			console.log('geoName: ', geoName);

		if ( _trigger === 'child' ) {
			console.log('Child trigger');
			console.log('Temp cached regions: ', cachedTmp.regions);
			_gender = cachedTmp.regions[geoName.toLowerCase()].gender;
			_exp = cachedTmp.regions[geoName.toLowerCase()].explevel;
			_ethnic = cachedTmp.regions[geoName.toLowerCase()].demographic;
		} else {
			console.log('Overview trigger');
			console.log('Temp cached overview: ', cachedTmp.overview);
			_gender = cachedTmp.overview.gender;
			_exp = cachedTmp.overview.explevel;
			_ethnic = cachedTmp.overview.demographic;
		}

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/' + perspective[0] + '/search/' + geoPath + '/' + perspective[1],
			data: payload,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _showProjection(dataType, dataValue, dataDir) {
		var projectionData = null;
		var timeDir = ( !dataDir ) ? 'future' : dataDir;

		$.when(
			_fetchProjection(dataType, dataValue, timeDir)
		).then(function (data) {
			console.log('Data: ');
			console.log(data);

			if ( data ) {
				projectionData = data;
				return HF.views.addModule($elWrapDets, 'projection_details', {projectionType: dataType, projectionValue: dataValue});
			} else {
				return _errorMsg();
			}
		}).then(function(done) {
			if ( done ) {
				_treeDiagram(projectionData, timeDir);

				var $el = $('#' + elViewWrap);
				$el.addClass('details');

				_eventsDetailBind();

				setTimeout(function() {
					$el.removeClass('loading');
				}, 300);
			}
		});
	}


	function _updateProjection(dataType, dataValue, dataDir) {
		$elWrapDets.addClass('loading');
		elTree.destroy();
		$('#projection-wrap').empty();

		var projectionData = null;
		var timeDir = ( !dataDir ) ? 'future' : dataDir;

		$.when(
			_fetchProjection(dataType, dataValue, timeDir)
		).then(function (data) {
			console.log('Data: ');
			console.log(data);

			if ( data ) {
				projectionData = data;
				_treeDiagram(projectionData, timeDir);

				setTimeout(function() {
					$elWrapDets.removeClass('loading');
				}, 300);
			}
		});
	}


	function _treeDiagram(data, timeDir) {
		var treeDir = ( timeDir === 'future' ) ? 'WEST' : 'EAST';

		var collapseAll = function(jsonObj) {
			var len = jsonObj.children.length;

			for (var i = 0; i < len; i++) {
				jsonObj.children[i].collapsed = true;

				if (jsonObj.children[i].children) {
					collapseAll(jsonObj.children[i]);
				}
			}
		};

		collapseAll(data);

		var tree_structure = {
			chart: {
				container: "#projection-wrap",
				levelSeparation:    40,
				siblingSeparation:  20,
				subTeeSeparation:   20,
				rootOrientation: treeDir,
				node: {
					HTMLclass: "position",
					drawLineThrough: false,
					collapsable: true
				},
				connectors: {
					style: {
						"stroke-width": 2,
						"stroke": "#686868"
					}
				}
			},
			nodeStructure: data
		};

		elTree = new Treant( tree_structure );
	}


	function _fetchProjection(type, value, dir) {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: _trigger, timeDirection: dir, input: value},
			geoPath = searchData.geo.join('/');

		console.log('API URL: /horsefly/tree/project/' + geoPath + '/' + type);
		console.log('Payload: ', payload);

		return $.ajax({
			type: 'GET',
			url: pathApi + 'horsefly/tree/project/' + geoPath + '/' + type,
			data: payload,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _eventsDetailBind() {
		$elWrapDets.on('click', '.time-dir a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var type = $(this).data('type');
			var value = $(this).data('value');
			var time = $(this).data('dir');

			if ( time === 'past' ) {
				$(this).closest('.time-dir').removeClass('past').addClass('future');
			} else {
				$(this).closest('.time-dir').removeClass('future').addClass('past');
			}

			_updateProjection(type, value, time);
		});

		$elWrapDets.one('click', 'a.closepane', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).removeClass('details');

			setTimeout(function() {
				_eventsDetailUnbind();
			}, 500);
		});
	}


	function _eventsDetailUnbind() {
		$elWrapDets.off('click');
		elTree.destroy();
		elTree = null;
		$elWrapDets.empty();

		return true;
	}


	function _combinedChart(data) {
		var chartReady = $.Deferred();

		elChart = Highcharts.chart(elChartWrap, {
			chart: {
				events: {
					load: function () {
						if ( !$elBreakdown.find('div[class$="-breakdown"]').length ) {
							$.when(
								HF.views.addModule($elBreakdown, 'data_breakdown', {gender: _gender, exp: _exp})
							).then(function(genderReady) {
								chartReady.resolve(genderReady);
							});
						} else {
							chartReady.resolve(true);
						}
					}
				}
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
				enabled: true
			},
			navigation: {
				buttonOptions: {
					y: -6
				}
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
				useHTML: true,
				shared: true,
				formatter: function() {
					var i = this.points.length - 1;
					var t = '<div class="chart-tooltip">';
					t += '<big>' + this.x + '</big>';
					if ( this.points[i].series.name === 'hideLabel' ) {
						t += '<br /><span style="background-color: #3bb32b;"></span>Avg Salary: ';
						t += '<b>sourcing</b>';
					} else {
						t += '<br /><span style="background-color:' + this.points[i].point.color + ';"></span>' + this.points[i].series.name + ': ';
						t += '<b>' + Highcharts.numberFormat(this.points[i].point.options.y, 0, ',', ' ') + '</b>';
					}
					t += '</div>';
					return t;
				}
			}
			/* Use this to show experience data in tooltip
			tooltip: {
				useHTML: true,
				shared: true,
				formatter: function() {
					var t = '<div class="chart-tooltip">';
					t += '<big>' + this.x + '</big>';

					this.points.forEach(function(el, index) {
						if ( el.series.name && el.series.name !== 'hideLabel' ) {
							t += '<br /><span style="background-color:' + el.point.color + ';"></span>' + el.series.name + ': ';
							t += '<b>' + Highcharts.numberFormat(el.point.options.y, 0, ',', ' ') + '</b>';
						}
					});

					t += '</div>';

					return t;
				}
			}
			*/
		});

		return chartReady.promise();
	}


	function _ethnicityChart(data) {
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

		for ( var key in data ) {
			if ( data.hasOwnProperty(key) ) {
				if ( key !== 'total' && data[key] ) {
					var formattedName = null;

					if ( key === 'east_or_southeast_asian' ) {
						formattedName = 'East or Southeast Asian';
					} else if ( key === 'not_declared' ) {
						formattedName = 'Not declared';
					} else {
						formattedName = key.charAt(0).toUpperCase() + key.slice(1);
					}

					var percent = data[key] * 100;
					var rounded = Math.round((percent + Number.EPSILON) * 100) / 100;
					ethnicData.push({name: formattedName, value: rounded, color: ethnicityColor[key]});
				}
			}
		}

		function maxFontSizeForWidth(text, width, i) {
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
		}

		function textWithAdaptiveSize(point) {
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
		}

		elEthnic = Highcharts.chart(elEthnicWrap, {
			title: {
				text: 'Ethnicity Breakdown',
				style: {
					fontSize: '16px'
				}
			},
			accessibility: {
				point: {
					valueSuffix: '%'
				}
			},
			tooltip: {
				pointFormat: '{point.name}: <b>{point.value:.2f}%</b>'
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
				enabled: true
			},
			navigation: {
				buttonOptions: {
					y: -6
				}
			}
		});
	}

	function _simpleChart(data) {
		var chartReady = $.Deferred();

		elChart = Highcharts.chart(elChartWrap, {
			chart: {
				type: 'bar',
				inverted: false,
				events: {
					load: function () {
						chartReady.resolve(true);
					}
				}
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
				enabled: true
			},
			navigation: {
				buttonOptions: {
					y: -6
				}
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
				useHTML: true,
				formatter: function () {
					return '<b> ' + this.x + '</b>';
				},
				shared: true
			}
		});

		return chartReady.promise();
	}


	function _demandList(data) {
		var listReady = $.Deferred(),
			regions = data.regions;

		$('#' + elChartWrap)
			.html('<ul id="demand-list" class="data-list"><li class="head">' +
				'<span class="name">Region Name</span>' +
				'<span class="ratio">Candidates<br />per Role</span>' +
				'<span class="gender">Gender<br />Split</span>' +
				'<span class="exp">Experience<br />Split</span>' +
				'<span class="count">Total<br />Candidates</span>' +
				'<span class="count">Total<br />Adverts</span>' +
				'</li></ul>');

		if (regions) {
			for (var i in regions) {
				var region = regions[i],
					gen = (region.genderCounts) ? [region.genderCounts.male, region.genderCounts.female] : [0, 0],
					exp = (region.experienceCounts) ? region.experienceCounts : [0, 0, 0],
					// genTotal = region.originalCandidatesCount,
					genTotal = gen[0] + gen[1],
					expTotal = exp[0] + exp[1] + exp[2],
					rat = ( !region.regionDifficultyRatio ) ? 'n/a' : region.regionDifficultyRatio,
					$list = $('<li />'),
					adverts = (!region.advertsCount) ? 0 : HF.utils.addCommas(region.advertsCount);

				$list.html(
					'<span class="name">' + i + '</span>' +
					'<span class="ratio">' + rat + '</span>' +
					'<span class="gender">Male: ' + HF.utils.toPercent(gen[0], genTotal, 0, false, true) +
					'<br />Female: ' + HF.utils.toPercent(gen[1], genTotal, 0, false, true) + '</span>' +
					'<span class="exp">0-3 y: ' + HF.utils.toPercent(exp[0], expTotal, 0) +
					'<br />4-7 y: ' + HF.utils.toPercent(exp[1], expTotal, 0) +
					'<br />8+ y: ' + HF.utils.toPercent(exp[2], expTotal, 0) + '</span>' +
					'<span class="count">' + HF.utils.addCommas(region.candidatesCount) + '</span>' +
					'<span class="count">' + adverts + '</span>');

				$('#demand-list').append($list);
			}
		}

		listReady.resolve(true);
		return listReady.promise();
	}


	function _simpleList(data) {
		console.log('simple list data: ', data);

		var noDups = data.perspectiveClustersList.filter(function(item, index, self) {
			return index === self.findIndex(function(i) {
				return i.itemTitle === item.itemTitle;
			});
		});

		console.log('simple list filtered data: ', noDups);

		var listReady = $.Deferred(),
			listTitle,
			isProjectable = ( window.hasTree && ( perspective[1] === 'jobTitles' || perspective[1] === 'companies' ) );

		if ( perspective[1] === 'schools' ) {listTitle = 'School Name';}
		else if ( perspective[1] === 'jobTitles' ) {listTitle = 'Job Title';}
		else if ( perspective[1] === 'companies' ) {listTitle = 'Company Name';}
		else if ( perspective[1] === 'hardSkills' ) {listTitle = 'Keyword';}

		$('#' + elChartWrap)
			.html('<ul id="perspective-list" class="data-list"><li class="head">' +
				'<span class="title">' + listTitle + '</span>' +
				'<span class="gender">Male</span>' +
				'<span class="gender">Female</span>' +
				'</li></ul>');

		$.each(noDups, function (i, item) {
			var gen = (item.genderCounts) ? [item.genderCounts.male, item.genderCounts.female] : [0, 0],
				// genTotal = item.totalCandidatesCount,
				genTotal = gen[0] + gen[1],
				$list = $('<li />'),
				male = ( !genTotal || isNaN(gen[0]) ) ? 'n/a' : HF.utils.toPercent(gen[0], genTotal, 0, false, true),
				female = ( !genTotal || isNaN(gen[1]) ) ? 'n/a' : HF.utils.toPercent(gen[1], genTotal, 0, false, true);

			if ( isProjectable ) {
				$list.html(
					'<span class="title">' + item.itemTitle +
					'<small><a href="#" data-type= "' + perspective[1] + '" data-value="' + item.itemTitle + '" class="projections is-tooltip">' +
					'<i class="material-icons">device_hub</i><p class="lft">Projections</p></a></small></span>' +
					'<span class="gender">' + male + '</span>' +
					'<span class="gender">' + female + '</span>');
			} else {
				$list.html(
					'<span class="title">' + item.itemTitle + '</span>' +
					'<span class="gender">' + male + '</span>' +
					'<span class="gender">' + female + '</span>');
			}

			$('#perspective-list').append($list);
		});

		listReady.resolve(true);
		return listReady.promise();
	}


	function _errorMsg() {
		var errorReady = $.Deferred();

		$('#' + elChartWrap)
			.html('<div class="msg-box">' +
				'<p>Data is sparse here, so it is difficult to produce accurate insights.</p>' +
				'<p>Check back soon for updates.</p></div>');

		errorReady.resolve(true);
		return errorReady.promise();
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		unload: unload
	};
})();