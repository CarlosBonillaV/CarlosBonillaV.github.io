HF.views.base = (function () {

	/*
	 * Constants
	 */

	var searchBase = {
		'baseTmpl': 'base_tabs',
		'wrapper': 'base-contents',
		'context': {
			'tabItems': [
				{
					'viewName': 'build',
					'tabTitle': 'search builder'
				},
				{
					'viewName': 'saved',
					'tabTitle': 'saved searches'
				},
				{
					'viewName': 'upload',
					'tabTitle': 'upload cvs'
				}
			]
		}
	};


	var resultsBase = {
		'baseTmpl': 'base_simple',
		'wrapper': 'base-contents'
	};


	var baseConf = {
		'search': searchBase,
		'results': resultsBase
	};



	/*
	 * Public methods
	 */

	function getBase(base) {
		console.groupCollapsed('Resolve base view | ' + base);

		if ( !baseConf[base] ) {
			console.error('Base is not defined');
			console.groupEnd();
			return false;
		}

		console.log('Template name:');
		console.log(baseConf[base].baseTmpl);
		console.log('--------------------------');
		console.log('Template context:');
		console.log(baseConf[base].context);
		console.log('--------------------------');
		console.log('Contents wrapper ID:');
		console.log(baseConf[base].wrapper);
		console.groupEnd();

		return [baseConf[base].baseTmpl, baseConf[base].wrapper, baseConf[base].context];
	}



	/*
	 * Exposed public methods
	 */

	return {
		get: getBase
	};
})();