HF.selects = (function () {

	/*
	 *  Private cached data
	 */

	var listSel = {};



	/*
	 *  Public methods
	 */

	function init() {
		console.groupCollapsed('Selects => Initializing');
		var completed = $.Deferred();

		$.when(
			_createAll(),
			HF.search.build.getData('searchData')
		).then(function(created, data) {
			console.log('Search Data: ', data);
			if ( created && data ) {
				listSel.currency.setValue(data.cur);
				completed.resolve(created);
				console.groupEnd();
			}
		});

		return completed.promise();
	}


	function clean() {
		console.log('Reset selects to default');

		if ( !HF.utils.isEmptyObj(listSel) ) {
			listSel.currency.setValue('pound');
		}

		return true;
	}


	function getCurrencies() {
		var currencies = _currency.map(function(cur) {
			return {code: cur.code, symbol: cur.symbol, name: cur.id};
		});

		return currencies;
	}


	function getCurrencyName(code) {
		var name = _country.filter(function(cc) {
			return cc.code === code;
		}).map(function(cn) {
			return cn.currency;
		});

		return name[0];
	}


	function destroyAll() {
		console.groupCollapsed('Resolve destroying selects');
		var isDestroyed = $.Deferred();

		if ( !HF.utils.isEmptyObj(listSel) ) {
			console.log('Selects object ready');
			console.groupCollapsed('Destroy all');

			for (var key in listSel) {
				if ( listSel.hasOwnProperty(key) ) {
					_destroy(key);
				}
			}

			isDestroyed.resolve(true);
			console.groupEnd();
		} else {
			console.warn('Selects object error => No action taken');
			isDestroyed.resolve(false);
		}

		console.groupEnd();
		return isDestroyed.promise();
	}


	function destroySel(selItem) {
		console.groupCollapsed('Resolve destroying select');
		var isDestroyed = false;

		if ( !selItem ) {
			console.warn('Select not specified => No action taken');
			console.groupEnd();
		} else {
			if ( !HF.utils.isEmptyObj(listSel) ) {
				if ( listSel.hasOwnProperty(selItem) ) {
					console.log('Select found');
					_destroy(selItem);
					isDestroyed = true;
				} else {
					console.log('Select not found');
				}
			} else {
				console.warn('Selects object error => No action taken');
			}
		}

		console.groupEnd();
		return isDestroyed;
	}



	/*
	 *  Private methods
	 */

	function _fetchCountries() {
		console.log('Fetching country options');

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/users/testAccessCountries',
			dataType: 'json',
			data: {token: 'xtempx'},
			crossDomain: true,
			dataFilter: function (data) {
				console.log('Countries:');

				var parsed = JSON.parse(data);
				console.log(parsed);

				var countries = parsed.filter(function(country) {
					return country !== null;
				});

				return JSON.stringify(countries);
			},
			success: function (results) {
				return results;
			}
		});
	}


	function _createAll() {
		console.groupCollapsed('Creating selects');
		var created	= $.Deferred();

		$.when(
			_fetchCountries()
		).then(function(cc) {
			console.log('Filtered Countries:');
			console.log(cc);

			// Get existing global country JSON and merge/filter
			// with user available country options
			_country = cc.map(function (item1) {
				item1.currency = _country.find(function (item2) {
					return item2.code === item1.code;
				}).currency;

				return item1;
			});

			// Map all currencies from available countries
			var currency = _country.map(function(country) {
				return country.currency;
			});

			// Filter all currencies not available from global JSON
			_currency = _currency.filter(function(item) {
				return currency.includes(item.id); 
			});

			// Store country options for building dropdown
			selConf.currency.options = getCurrencies();

			_createEach('currency');
			created.resolve(true);
		});

		console.groupEnd();
		return created.promise();
	}


	function _createEach(selName) {
		console.log('----------------------------------');
		console.log('Creating ' + selName + ' select');
		var $elSel = $('#search_' + selName).selectize(selConf[selName]);
	}


	function _destroy(selName) {
		console.log('Destroying select | ' + selName);
		// Destroy selectize;
		listSel[selName].destroy();
		// Remove instance from group object
		delete listSel[selName];
	}



	/*
	 *  Select configurations
	 */

	var selConf = {
		'currency': {
			valueField: 'name',
			labelField: 'code',
			searchField: 'code',
			options: [],
			disableDelete: true,
			render: {
				item: function(item, escape) {
					return '<div>' + escape(item.code) + ' ' + escape(item.symbol) + '</div>';
				},
				option: function(item, escape) {
					return '<div>' +
						(item.code ? '<strong>' + escape(item.code) + '</strong>' : '') +
						(item.symbol ? ' ' + escape(item.symbol) : '') +
					'</div>';
				}
			},
			onChange: function(value) {
				HF.search.build.setData('cur', this.options[value].name);
			},
			onInitialize: function() {
				var selName = 'currency';
				console.log('Created => ' + selName);
				listSel[selName] = $(this)[0];
			}
		}
	};



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		clean: clean,
		destroyAll: destroyAll,
		destroySel: destroySel
	};
})();