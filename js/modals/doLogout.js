HF.modal.doLogout = (function () {

	/*
	 *  Constants
	 */

	var elModal, continueBtn, cancelBtn;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		console.log('Binding modal events');

		continueBtn = elModal.find('#continue-session');
		cancelBtn = elModal.find('#cancel-session');

		continueBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_continueSession();
		});

		cancelBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			location.href = '/dashboard';
		});

		return true;
	}


	/*
	 *  Public methods
	 */

	function load($el) {
		var loaded = $.Deferred();

		elModal = $el;

		$.when(
			_eventsBind()
		).then(function(binded) {
			loaded.resolve(binded);
		});

		return loaded.promise();
	}


	function unload() {
		continueBtn.off('click');
		cancelBtn.off('click');
		continueBtn = null;
		cancelBtn = null;
		modalNow = '';

		return true;
	}



	/*
	 *  Private methods
	 */

	function _continueSession() {
		// $.ajax({
		// 	type: 'GET',
		// 	url: pathApi + 'horsefly/sessions/close?uuid=' + window.uuid,
		// 	crossDomain: true
		// });

		elModal.find('.m-foot > a.m-close').trigger('click');

		console.log('Continue with session => Close all sessions and set timer');
		// sessionTimer = setInterval(HF.views.checkSession, 15000);
	}



	/*
	 *  Exposed public methods
	 */

	return {
		load: load,
		unload: unload
	};
})();