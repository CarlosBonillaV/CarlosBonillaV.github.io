HF.results = (function () {

	/*
	 *  Constants
	 */

	 var baseID	= 'results';



	/*
	 *  Cached DOM elements
	 */

	var $elContent, elMainWrap;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind(subview) {
		// Set main containers
		$elContent = $('#base-contents');
		elMainWrap = $elContent.closest('section').attr('id');

		console.log('Results => Base view events binded');
	}


	// Unbind
	function _eventsUnbind() {
		// Unset main containers
		$elContent = null;
		elMainWrap = null;

		console.log('Events successfully unbinded');
	}


	// DOM



	/*
	 *  Public methods
	 */

	function init(subView) {
		_eventsBind(subView);
		events.emit('doneLoading', elMainWrap);
	}


	function getData(type) {
		console.log('Fetching view data');
		return false;
	}


	function unload(subview) {
		var baseUnload = $.Deferred();

		console.log('Unload base');
		console.groupCollapsed('Unbind current content view | ' + subview);

		$.when(
			HF[baseID].list.unload('all')
		).then(function(viewUnload) {
			console.groupEnd();
			if (viewUnload) {
				_eventsUnbind();
				baseUnload.resolve(viewUnload);
			}
		});

		return baseUnload.promise();
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