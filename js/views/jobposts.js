HF.jobposts = (function () {

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
			$el.removeClass('jobposts');

			setTimeout(function() {
				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;
			}, 500);
		});

		elPostItem.on('click', 'a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).addClass('loading');
			var jobpostId = $(this).data('jobpost');

			_showJobpost(jobpostId);
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
		console.groupCollapsed('Init details view | jobposts');

		elViewWrap	= el;
		elWrapMain	= $('#ext-wrap');
		elWrapDets	= $('#ext-details');
		elPostList	= $('#jobposts-list');
		elPostItem	= elPostList.children('.jobpost-item');

		$.when(
			_eventsBind()
		).then(function(binded) {
			if (binded) {
				$('#' + elViewWrap).addClass('jobposts');
				console.groupEnd();

				setTimeout(function() {
					$('#' + elViewWrap).removeClass('loading');
				}, 300);
			}
		});
	}


	function getData(geoPoint, geoName, trigger) {
		return _getContext(geoPoint, geoName, trigger);
	}


	function unload() {
		var isUnload = $.Deferred();

		console.log('Unload details view');

		var $el = $('#' + elViewWrap);
		$el.removeClass('jobposts');

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

	function _getContext(geoPoint, geoName, trigger) {
		var ctxReady = $.Deferred();

		console.log('Fetching data');

		var tmpGeoArray = geoPoint.split('/'),
			tmpGeoLen = tmpGeoArray.filter(function(val) {
				return (val !== 0 && val !== '0' && val !== 'all');
			}).length,
			tmpChildLen = (tmpGeoLen > 3) ? tmpGeoLen - 1 : tmpGeoLen,
			tmpGeoName = (tmpGeoLen === 2) ? HF.utils.codeToName(tmpGeoArray[tmpChildLen - 1]) : tmpGeoArray[tmpChildLen];


		if ( !tmpGeoLen ) {
			var tmpData = HF.results.list.getData('searchData'),
				tmpLocs = JSON.parse( tmpData.payload.locations ),
				isMulti = tmpLocs.length > 1,
				tmpArr = isMulti ? [0,0,0,0] : [tmpLocs[0].subContinent, tmpLocs[0].country, tmpLocs[0].region, tmpLocs[0].city],
				tmpLen = tmpArr.filter(function(val) {return (val !== 0 && val !== '0' && val !== 'all');}).length,
				tmpName = null;

			if ( !tmpLen ) {
				tmpGeoName = 'Multiple Locations';
			} else {
				tmpGeoName = (tmpLen === 2) ? HF.utils.codeToName(tmpArr[tmpLen - 1]) : tmpArr[tmpLen];
			}
		}

		var tmpDisplayName = (!geoName || trigger === 'parent') ? tmpGeoName : geoName;

		$.when(
			_fetchJobposts(geoPoint, trigger)
		).then(function (data) {
			ctxReady.resolve({location: tmpGeoName, locName: tmpDisplayName, jobposts: data});
		});

		return ctxReady.promise();
	}


	function _fetchJobposts(geoPoint, trigger) {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: trigger, currency: searchData.cur, filters: searchData.payload.filters};

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/list/search/' + geoPoint + '/adverts',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data);

				if ( !$.isEmptyObject(parsed) ) {
					parsed = parsed.adverts.map(function(item) {
						return {id: item.advertId, title: item.positionName, company: item.companyName, salary: item.salary, currency: searchData.cur, content: item.content};
					});
				}

				return JSON.stringify(parsed);
			},
			success: function (jobposts) {
				return jobposts;
			}
		});
	}


	function _fetchById(id) {
		var payload = {advertId: id},
			currency = HF.results.list.getData('searchData', 'cur');

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/advert',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data),
					jobpost;

				if ( !$.isEmptyObject(parsed) ) {
					jobpost = {title: parsed.positionName, company: parsed.companyName, salary: parsed.salary, currency: currency, content: parsed.content};
				}

				return JSON.stringify(jobpost);
			},
			success: function (jobpost) {
				return jobpost;
			}
		});
	}


	function _showJobpost(id) {
		$.when(
			_fetchById(id)
		).then(function(jobpost) {
			if ( jobpost ) {
				return HF.views.addModule(elWrapDets, 'jobpost_details', jobpost);
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