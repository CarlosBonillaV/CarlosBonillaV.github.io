HF.search.build = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap,
		$createGroupBtn, $createLocGroupBtn, $filters, $searchActions, $searchButtons;



	/*
	 *  Private cached data and defaults
	 */

	var tagGroupLen = 0,
		locGroupLen = 0,
		_config = {
			cachedTags: [],
			cachedLocs: [],
			searchData: {
				geo: ['northern europe', 'uk', 0, 0],
				cur: 'pound',
				rad: ''
			},
			filterData: {
				male: 1,
				female: 1,
				yoe0: 1,
				yoe1: 1,
				yoe2: 1
			}
		};



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('groupStatus', function(status) {
		if (status === 'noSearch') {
			$createGroupBtn.addClass('disabled');

			if ( $searchActions.hasClass('ready') ) {
				console.log('Unbind search panel events');

				$searchActions.removeClass('ready');
				$searchButtons.off('click');
			}
		}

		if (status === 'isEmpty') {
			$createGroupBtn.addClass('disabled');
		}

		if (status === 'canAdd') {
			$createGroupBtn.removeClass('disabled');
		}

		if (status !== 'noSearch') {
			if ( !$searchActions.hasClass('ready') ) {
				console.log('Bind search panel events');

				$searchActions.addClass('ready');

				$searchButtons.on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();

					if ( $(this).data('action') === 'explore' ) {
						_exploreResults();
					} else {
						_resetSearch();
					}
				});
			}
		}
	});


	// Bind
	function _eventsBind() {
		$createGroupBtn = $('#create-tag-group');
		$createLocGroupBtn = $('#create-loc-group');
		$searchActions = $('#search-actions');
		$searchButtons = $searchActions.find('a.btn');

		// Create tag group button click event
		$createGroupBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			}

			_addTagGroup();
		});

		// Create tag group button click event
		$createLocGroupBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			}

			_addLocGroup();
		});

		$filters.on('click', 'a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var parent = $(this).parent();

			if ( !parent.hasClass('show') ) {
				parent.addClass('show');
				$(document).on('click', _closeFilters);
			} else {
				parent.removeClass('show');
				$(document).off('click', _closeFilters);
			}
		});

		$filters.on('change', 'input[type=checkbox]', function(e) {
			var len = $(this).closest('.filter-block').find('input[type=checkbox]:checked').length;

			if ( !this.checked && !len) {
				$(this).prop('checked', true);
			} else {
				_config.filterData[this.value] = (this.checked) ? 1 : 0;
			}
		});

		console.log('Events successfully binded');
	}


	// Unbind
	function _eventsUnbind() {
		// Reset tag group count
		tagGroupLen = 0;
		locGroupLen = 0;
		// Unbind click events
		$createGroupBtn.off('click');
		$createLocGroupBtn.off('click');
		$searchButtons.off('click');
		$filters.off('click');
		$filters.off('change');
		// Reset cached DOM elements
		$createGroupBtn = null;
		$createLocGroupBtn = null;
		$filters = null;
		$searchActions = null;
		$searchButtons = null;

		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | build');
		var cachedTagsLen = _config.cachedTags.length;
		var cachedLocsLen = _config.cachedLocs.length;

		elViewWrap = el;

		$.when(
			HF.selects.init()
		).then(function(done) {
			console.log('Done: ', done);
			if ( done ) {
				return ( !cachedLocsLen )
					? _addLocGroup()
					: _allLocGroups(cachedLocsLen);
			}
		}).then(function(added) {
			console.log('Added: ', added);
			if ( added ) {
				return ( !cachedTagsLen )
					? _addTagGroup()
					: _allTagGroups(cachedTagsLen);
			}
		}).then(function(created) {
			if ( created ) {
				_setFilters();
				_eventsBind();

				if ( cachedTagsLen ) {
					events.emit('groupStatus', 'canAdd');
				}

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


	function setData(name, data, pos) {
		var dataObj = _config.searchData;

		if (name === 'search-new') {
			_deepReset();
		} else {
			if ( dataObj.hasOwnProperty(name) ) {
				if (!pos) {
					dataObj[name] = data;
				} else {
					dataObj[name][pos - 1] = data;
				}
			} else {
				console.error('Property does not exists in search data');
				return false;
			}
		}
	}


	function setSaved(sid) {
		var savedReady = $.Deferred();

		$.when(
			_getSavedData(sid)
		).then(function(data) {
			console.log('Set saved search: ', data);

			if (data) {
				_loadSavedData(data);
			}
		}).then(function (ready) {
			$('#base-controls').find('ul.tabs > li').removeClass('active');
			$('#base-controls').find('ul.tabs > li').first().addClass('active');

			HF.views.set('search', 'build');
		});
	}


	function unload(type) {
		var isUnload = $.Deferred();

		console.log('Unload view');

		$.when(
			HF.selects.destroyAll(),
			HF.tags.getBool()
		).then(function(selDestroy, tagGroups) {
			if (selDestroy && tagGroups) {
				_config.cachedTags = tagGroups;
				_eventsUnbind();

				return HF.tags.resetAll();
			}
		}).then(function(tagDestroy) {
			if (tagDestroy) {
				isUnload.resolve(tagDestroy);
			}
		});

		return isUnload.promise();
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		return false;
	}


	function _getSavedData(sid) {
		var payload = {searchId: parseInt(sid)};

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/search',
			data: payload,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _loadSavedData(data) {

		console.log('Cached Tags: ', _config.cachedTags);
		console.log('Cached Locs: ', _config.cachedLocs);

		// Clean cachedTags and geo data
		_config.cachedTags.length = 0;
		_config.cachedLocs.length = 0;
		_config.searchData.geo = 0;

		// Convert response geoPath into array
		var geoArray = data.geoPath.split('/');
		// Remove geoArray first empty item
		geoArray.shift();

		// Convert '0' values into numbers
		geoArray = geoArray.map(function(item) {
			return item === '0' ? 0 : item;
		});

		// Populate _config data
		_config.searchData.rad = (data.distance === '0') ? '' : Number(data.distance);
		_config.searchData.cur = (data.currency) ? data.currency : 'pound'; 
		_config.searchData.geo = geoArray;
		_config.cachedTags = data.tags.or;
		_config.cachedLocs = JSON.parse(data.geoPath);

		return true;
	}



	/*
	 *  Tag events
	 */

	function _addTagGroup() {
		var isReady = $.Deferred();

		$.when(
			HF.tags.addGroup('tag-groups', tagGroupLen)
		).then(function (complete) {
			if (complete) {
				$('#tag-group-' + tagGroupLen).removeClass('loading');
				$('#create-tag-group').addClass('disabled');
				tagGroupLen++;

				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}


	function _allTagGroups(len) {
		var isReady = $.Deferred();

		$.when(
			HF.tags.setGroups('tag-groups', _config.cachedTags)
		).then(function(complete) {
			if (complete) {
				tagGroupLen = len;
				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}



	/*
	 *  Loc events
	 */

	function _addLocGroup() {
		var isReady = $.Deferred();

		$.when(
			HF.locs.addGroup('loc-groups', locGroupLen)
		).then(function (complete) {
			if (complete) {
				$('#loc-group-' + locGroupLen).removeClass('loading');

				if ( locGroupLen ) {
					$('#create-loc-group').addClass('disabled');
				}

				locGroupLen++;

				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}


	function _allLocGroups(len) {
		var isReady = $.Deferred();

		console.log('Cached locations: ', _config.cachedLocs);

		$.when(
			HF.locs.setGroups('loc-groups', _config.cachedLocs)
		).then(function(complete) {
			if (complete) {
				locGroupLen = len;
				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}



	/*
	 *  Search form events
	 */

	function _exploreResults() {
		$.when(
			HF.locs.getGroups(), HF.tags.getBool()
		).then(function(locGroupArray, tagGroupArray) {
			_config.cachedLocs = locGroupArray;

			var data = $.extend(true, {}, _config.searchData),
				filters = $.extend(true, {}, _config.filterData),
				payload = {
					tags: JSON.stringify({or: tagGroupArray}),
					locations: JSON.stringify(locGroupArray),
					currency: data.cur,
					filters: JSON.stringify(filters),
					token: 'xtempx'
				};

			data.payload = payload;

			console.log('Explore Data: ', data);

			events.emit('searchSetup', data);
		});
	}


	function _deepReset() {
		_config.cachedTags.length = 0;
		_config.cachedLocs.length = 0;
		_config.searchData.cur = 'pound';
		_config.searchData.rad = '';
		_config.searchData.geo[0] = 'northern europe';
		_config.searchData.geo[1] = 'uk';
		_config.searchData.geo[2] = 0;
		_config.searchData.geo[3] = 0;

		_resetFilters(false);

		HF.views.set('search', 'build');
	}

	function _resetSearch() {
		console.log('Reset search form');
		var wrapID = 'tag-groups',
			$wrap = $('#' + wrapID);

		$wrap.addClass('loading');

		tagGroupLen = 0;
		locGroupLen = 0;

		$.when(
			HF.selects.clean(),
			HF.locs.resetAll(),
			HF.tags.resetAll(wrapID, tagGroupLen)
		).then(function(resetLocs, resetTags) {
			if ( resetLocs && resetTags ) {
				_resetFilters(true);
				$('#tag-group-' + tagGroupLen).removeClass('loading');
				tagGroupLen++;
				locGroupLen++;
				$wrap.removeClass('loading');
			}
		});
	}


	function _setFilters() {
		$filters = $('#filters');

		for (var key in _config.filterData) {
			if ( _config.filterData.hasOwnProperty(key) ) {
				$filters.find('#' + key).prop('checked', (!_config.filterData[key]) ? false : true );
			}
		}
	}


	function _resetFilters(resetDOM) {
		if (resetDOM) {
			$filters.find('input[type=checkbox]').prop('checked', true);
		}

		for (var key in _config.filterData) {
			if ( _config.filterData.hasOwnProperty(key) ) {
				_config.filterData[key] = 1;
			}
		}
	}


	function _closeFilters(e) {
		if ( !$(e.target).closest('#filters').length ) {
			$filters.removeClass('show');
			$(document).off('click', _closeFilters);
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		setData: setData,
		setSaved: setSaved,
		unload: unload
	};
})();