HF.utils = (function () {
	// Converts int value to percentage value
	function percentage(value, total, precision, noEntity, zeroToNA) {
		var percent = (value * 100) / total,
			multiplier = Math.pow(10, precision || 0),
			result = Math.round(percent * multiplier) / multiplier;

		if ( zeroToNA && ( result === 100 || result === 0 ) ) {
			return 'n/a';
		} else {
			return (noEntity) ? result : result + '%';
		}
	}


	/* Add thousands separator */
	function addCommas(number, currency) {
		var symbol;

		if ( !currency ) {
			symbol = '';
		} else {
			var currencies = _currency.filter(function(cur) {
				return cur.id === currency;
			});

			if ( currencies.length ) {
				symbol = currencies[0].symbol;
			}
		}

		number += '';
		x = number.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var regx = /(\d+)(\d{3})/;

		while (regx.test(x1)) {
			x1 = x1.replace(regx, '$1' + ',' + '$2');
		}

		return symbol + x1 + x2;
	}


	/* Get currency ISO Code */
	function getCurrencyCode(currency) {
		var code,
			currencies = _currency.filter(function(cur) {
			return cur.id === currency;
		});

		if ( currencies.length ) {
			code = currencies[0].code;
		}

		return code;
	}


	// Check if element is an empty object
	function isEmptyObj(el) {
		if ( el.constructor === Object ) {
			for (var key in el) {
				return false;
			}

			return true;
		}
	}


	function codeToName(key) {
		var name = _country.filter(function(cc) {
			return cc.code === key;
		}).map(function(cn) {
			return cn.name;
		});

		return name[0];
	}


	function getContinent(key) {
		var name = _country.filter(function(cc) {
			return cc.code === key;
		}).map(function(cn) {
			return cn.continent;
		});

		return name[0];
	}


	// Formats an array of strings, capitalizing every word
	// Returns a comma separated string
	// Eg: [london, london] => London, London
	function locationFormat(array) {
		array = array.map(function(str){
			return capAll(str);
		});

		return array.join(', ');
	}


	function capAll(strAll) {
		var srtArr = strAll.split(' ');

		srtArr = srtArr.map(function(str){
			return capFirst(str);
		});

		return srtArr.join(' ');
	}


	function capFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}


	/*
	 *  Exposed public methods
	 */

	return {
		toPercent: percentage,
		addCommas: addCommas,
		getCurrencyCode: getCurrencyCode,
		isEmptyObj:	isEmptyObj,
		codeToName: codeToName,
		getContinent: getContinent,
		locationFormat: locationFormat,
		capAll: capAll,
		capFirst: capFirst
	};
})();