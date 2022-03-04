HF.modal.loggedOut = (function () {

	/*
	 *  Constants
	 */

	var elModal;



	/*
	 *  Public methods
	 */

	function load($el) {
		setTimeout(function() {
			location.href = '/dashboard';
		} , 5000);

		return true;
	}


	function unload() {
		return true;
	}



	/*
	 *  Exposed public methods
	 */

	return {
		load: load,
		unload: unload
	};
})();