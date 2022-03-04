HF.search.saved = (function () {

	/*
	 *  Constants
	 */

	var apiFavSearch = pathApi + 'horsefly/favoritesearches';



	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, $elFavGroup, $elBtnDel, $elCheckAll, $elFilter;



	/*
	 *  Private cached data and defaults
	 */

	var _config = {
		cachedFavs: [],
		checkedFavs: [],
		toDelete: []
	};



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		var $el = $('#' + elViewWrap);
		$elFavGroup = $el.find('ul.item-list');
		$elBtnDel	= $el.find('#delete-selected');
		$elCheckAll	= $el.find('#checkAll');
		$elFilter	= $el.find('#filter-input');
		$elSortName	= $el.find('#sort-name');

		_updateBtnDel(_config.checkedFavs.length);

		$elFavGroup.on('change', 'input[type=checkbox]', function(e) {
			if (this.checked) {
				$(this).closest('li').addClass('selected');
				_config.checkedFavs.push(this.value);
			} else {
				$(this).closest('li').removeClass('selected');
				_config.checkedFavs.splice(_config.checkedFavs.indexOf(this.value, 0), 1);
			}

			_updateBtnDel(_config.checkedFavs.length);
		});

		$elFavGroup.on('click', '.actions a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var sid = $(this).closest('li').data('sid');

			if ( $(this).hasClass('load') ) {
				HF.search.build.setSaved(sid);
			} else {
				_config.toDelete = [sid.toString()];
				HF.views.modal({modalurl: 'deleteSearch', bgclose: false});
			}
		});

		$elBtnDel.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_config.toDelete = _config.checkedFavs.slice(0);
			HF.views.modal({modalurl: 'deleteSearch', bgclose: false});
		});

		$elCheckAll.on('change', function(e) {
			var $elFavItem = $elFavGroup.children('li'),
				len = $elFavItem.length;

			$elFavItem.toggleClass('selected', this.checked);
			_config.checkedFavs.length = 0;

			_updateBtnDel( this.checked ? len : 0 );
			_toggleAllChecks(this.checked, len);
		});

		$elFilter.on('keyup', function(e) {
			var query = e.target.value;

			$elFavGroup.find('li').filter(function() {
				var regex = new RegExp(query, 'ig'),
					data = $(this).find('span').text();

				$(this)[0].style.display = (regex.test(data)) ? 'block' : 'none';
			});
		});

		$elSortName.on('click', function(e) {
			e.preventDefault();

			var $elFavItem = $elFavGroup.children('li');

			$elFavItem.sort(function(a, b) {
				var textA = $(a).find('span').text().toUpperCase();
				var textB = $(b).find('span').text().toUpperCase();
				return (textA < textB) ? -1 : 1;
			});

			$.each($elFavItem, function(i, elItem) {
				$elFavGroup.append(elItem);
			});
		});

		console.log('Events successfully binded');
	}


	// Unbind
	function _eventsUnbind() {
		$elFavGroup.off('change');
		$elFavGroup.off('click');
		$elBtnDel.off('click');
		$elCheckAll.off('change');
		$elFilter.off('keyup');
		$elSortName.off('click');

		_config.checkedFavs.length = 0;
		_config.toDelete.length = 0;

		$elFavGroup = null;
		$elBtnDel	= null;
		$elCheckAll	= null;
		$elFilter	= null;
		$elSortName = null;

		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | saved');
		elViewWrap = el;

		_eventsBind();
		events.emit('doneLoading', elViewWrap);

		console.groupEnd();
	}


	function getData(type) {
		if (!type) {
			return _getContext();
		} else {
			return _config[type];
		}
	}


	function updateData(isCancel) {
		if ( !isCancel ) {
			var updated = $.Deferred(),
				isMulti = (_config.toDelete.length > 1) ? true : false;

			// Filter out deteled searches from cached favorites
			_config.cachedFavs = _config.cachedFavs.filter( function( fav ) {
				return _config.toDelete.indexOf( fav.searchId ) < 0;
			});

			// Deleted multiple searches
			if (isMulti) {
				// Empty checked array
				_config.checkedFavs.length = 0;
				// Remove all checked list items
				$elFavGroup.find('li.selected').remove();
			// Deleted single search
			} else {
				// If there are multiple checked searches
				if ( _config.checkedFavs.length ) {
					// Remove deleted search from checked array
					_config.checkedFavs.splice(_config.checkedFavs.indexOf(_config.toDelete[0], 0), 1);
				}

				// Remove deleted list item
				$elFavGroup.find('li[data-sid="' + _config.toDelete[0] + '"]').remove();
			}

			// Empty temporal delete array
			_config.toDelete.length = 0;
			// Update delete button
			_updateBtnDel(_config.checkedFavs.length);

			// Resolve promise
			updated.resolve(true);
			return updated.promise();
		} else {
			// Empty temporal delete array
			_config.toDelete.length = 0;
		}
	}


	function resetCached() {
		_config.cachedFavs.length = 0;
	}


	function unload(type) {
		console.log('Unload view');

		_eventsUnbind();

		return true;
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		var ctxReady = $.Deferred();

		if (!_config.cachedFavs.length) {
			console.log('No cached data found -> Fetching');

			$.when(
				_fetchFavData()
			).then(function (data) {
				ctxReady.resolve({favorites: data});
			});
		} else {
			console.log('Cached data found -> Reusing');
			ctxReady.resolve({favorites: _config.cachedFavs});
		}

		return ctxReady.promise();
	}


	function _fetchFavData() {
		return $.ajax({
			type: 'POST',
			url: apiFavSearch,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data);

				if ( !$.isEmptyObject(parsed) ) {
					parsed = parsed.map(function(item) {
						return {searchId: item.id, searchName: item.searchName.toLowerCase()};
					});
				}

				return JSON.stringify(parsed);
			},
			success: function (favorites) {
				_config.cachedFavs = favorites;

				return favorites;
			}
		});
	}


	function _updateBtnDel(len) {
		$elBtnDel[0].style.display = (len <= 0) ? 'none' : 'block';
		$elBtnDel.find('span').text(len);
	}


	function _toggleAllChecks(isChecked, len) {
		var $elFavItems = $elFavGroup.find('input[type=checkbox]');

		var i = 0;
		while (i < len) {
			$elFavItems[i].checked = isChecked;

			if (isChecked) {
				_config.checkedFavs.push($elFavItems[i].value);
			}

			i++;
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		resetCached: resetCached,
		updateData: updateData,
		unload: unload
	};
})();