HF.profiles = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, elWrapMain, elWrapDets, elPostList, elPostItem;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		elWrapMain.on('click', 'a.backbtn', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_eventsUnbind();
			var $el = $('#' + elViewWrap);
			$el.removeClass('profiles');

			setTimeout(function() {
				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;
			}, 500);
		});

		elPostItem.on('click', 'a.profile-title', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).addClass('loading');
			var profileId = $(this).data('profile');

			_showProfile(profileId);
		});

		console.log('Events successfully binded');

		return true;
	}


	// Unbind
	function _eventsUnbind() {
		elWrapMain.off('click');
		elPostItem.off('click');

		elWrapMain	= null;
		elWrapDets	= null;
		elPostList	= null;
		elPostItem	= null;

		console.log('Events successfully unbinded');

		return true;
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init details view | profiles');

		elViewWrap	= el;
		elWrapMain	= $('#ext-wrap');
		elWrapDets	= $('#ext-details');
		elPostList	= $('#profiles-list');
		elPostItem	= elPostList.children('.profile-item');

		$.when(
			_eventsBind()
		).then(function(binded) {
			if (binded) {
				$('#' + elViewWrap).addClass('profiles');
				console.groupEnd();

				setTimeout(function() {
					$('#' + elViewWrap).removeClass('loading');
				}, 300);
			}
		});
	}


	function getData(geoPoint, trigger) {
		return _getContext(geoPoint, trigger);
	}


	function unload() {
		var isUnload = $.Deferred();

		console.log('Unload details view');

		var $el = $('#' + elViewWrap);
		$el.removeClass('profiles');

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



	/*
	 *  Private methods
	 */

	function _getContext(geoPoint, trigger) {
		var ctxReady = $.Deferred();

		console.log('Fetching data');

		$.when(
			_fetchProfiles(geoPoint, trigger)
		).then(function (data) {
			ctxReady.resolve({location: geoPoint, profiles: data});
		});

		return ctxReady.promise();
	}


	function _fetchProfiles(geoPoint, trigger) {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: trigger, currency: searchData.cur, filters: searchData.payload.filters},
			len = searchData.geo.filter(function(val) {return (val !== 0);}).length;

		if ( trigger === 'child' ) {
			var childLen = (len > 3) ? len - 1 : len;
			searchData.geo[childLen] = geoPoint;
		}

 		var geoPath = searchData.geo.join('/');

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/list/search/' + geoPath + '/candidates',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data);

				console.log('Parsed: ', parsed);

				if ( !$.isEmptyObject(parsed) ) {
					parsed = parsed.candidates.map(function(item) {
						return {name: item.name, email: item.email, city: item.city, position: item.currentPositionName, company: item.currentCompanyName, skills: item.skills};
					});
				}

				return JSON.stringify(parsed);
			},
			success: function (profiles) {
				return profiles;
			}
		});
	}


	function _fetchById(id) {
		var payload = {profileId: id},
			currency = HF.results.list.getData('searchData', 'cur');

		return $.ajax({
			type: 'POST',
			url: pathApi + '/candidate',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data),
					profile;

				if ( !$.isEmptyObject(parsed) ) {
					profile = {name: parsed.name, email: parsed.email, city: parsed.city, position: parsed.currentPositionName, skils: parsed.skills};
				}

				return JSON.stringify(profile);
			},
			success: function (profile) {
				return profile;
			}
		});
	}


	function _showProfile(id) {
		$.when(
			_fetchById(id)
		).then(function(profile) {
			if ( profile ) {
				return HF.views.addModule(elWrapDets, 'profile_details', profile);
			}
		}).then(function(done) {
			if ( done ) {
				var $el = $('#' + elViewWrap);
				$el.addClass('details');

				_eventsDetailBind();

				setTimeout(function() {
					$el.removeClass('loading');
				}, 300);
			}
		});
	}


	function _eventsDetailBind() {
		elWrapDets.one('click', 'a.closepane', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).removeClass('details');

			setTimeout(function() {
				elWrapDets.empty();
			}, 500);
		});
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