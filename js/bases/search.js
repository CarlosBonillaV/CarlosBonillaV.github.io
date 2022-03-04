HF.search = (function () {

	/*
	 *  Constants
	 */

	 var baseID	= 'search';



	/*
	 *  Cached DOM elements
	 */

	var $elControl, $elContent, $elTabList, elMainWrap;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind(subview) {
		// Set main containers
		$elControl = $('#base-controls');
		$elContent = $('#base-contents');
		$elTabList = $elControl.children('.tabs');
		elMainWrap = $elControl.closest('section').attr('id');

		// Set active tab
		$elTabList.find('a[data-tab="' + subview + '"]').parent('li').addClass('active');

		// Click on tab element
		$elTabList.on('click', 'a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).parent().hasClass('active') ) {
				return false;
			}

			var viewName = $(this).data('tab');
			_toggleView( viewName );
		});

		console.log('Search => Base view events binded');
	}


	// Unbind
	function _eventsUnbind() {
		// Click on tab element
		$elTabList.off('click', 'a');

		// Unset main containers
		$elControl = null;
		$elContent = null;
		$elTabList = null;
		elMainWrap = null;

		console.log('Events successfully unbinded');
	}


	// DOM
	function _toggleView(viewName) {
		// Reset active tabs
		$elTabList.children('li.active').removeClass('active');
		// Set active tab
		$elTabList.find('a[data-tab="' + viewName + '"]').parent('li').addClass('active');
		// Set view
		HF.views.set(baseID, viewName);
	}



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
			HF[baseID][subview].unload()
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