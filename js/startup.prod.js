(function () {
	var loadScripts = function() {
		// Check if development
		HF.isDev = false;

		var version = window.version || (new Date()).getTime();

		$LAB
		.script(
			'/assets/horsefly/js/dist/libraries.min.js?v='+version
		).script(
			'https://api.mapbox.com/mapbox-gl-js/v0.39.1/mapbox-gl.js'
		).wait()
		.script(
			'/assets/horsefly/js/dist/modules.min.js?v='+version
		);
	};

	var initialize = function() {
		// Define Global Namespace
		window.HF = {};

		// Detect Mobile Devices
		var device = uad.device.type;
		HF.isMobile = (device === 'mobile' || device === 'tablet') ? true : false;

		// Load Scripts
		loadScripts();
	};

	initialize();
}());