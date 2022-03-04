(function() {
	Handlebars.registerHelper('debug', function(optionalValue) {
		console.log('Current Context');
		console.log('====================');
		console.log(this);

		if (optionalValue) {
			console.log('Value');
			console.log('====================');
			console.log(optionalValue);
		}
	});

	Handlebars.registerHelper('imageHelper', function(imgUrl, imgAlt) {
		return new Handlebars.SafeString(
			'<img src="' + pathAws + 'img/' + imgUrl + '.png" alt="' + imgAlt + '">'
		);
	});

	Handlebars.registerHelper('userNameFirst', function() {
		return new Handlebars.SafeString(
			userData.firstname
		);
	});

	Handlebars.registerHelper('userName', function() {
		return new Handlebars.SafeString(
			userData.firstname + ' ' + userData.lastname
		);
	});

	Handlebars.registerHelper('is_admin', function (options) {
		if (userData.type === '2') {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper('if_multi', function (options) {
		if (multiCountry) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper('has_rate', function (options) {
		if (rateEnabled) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper('ifMatches', function (conditional, options) {
		if (options.hash.toMatch === conditional) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper('ifIsTotal', function (conditional, options) {
		if (options.hash.total === conditional || options.hash.total === 0 ) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	Handlebars.registerHelper('numFormat', function (value, options) {
		var symbol;

		if ( !options.hash.entity ) {
			symbol = '';
		} else {
			var currencies = _currency.filter(function(cur) {
				return cur.id === options.hash.entity;
			});

			if ( currencies.length ) {
				symbol = currencies[0].symbol;
			}
		}

		value += '';
		x = value.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var regx = /(\d+)(\d{3})/;

		while (regx.test(x1)) {
			x1 = x1.replace(regx, '$1' + ',' + '$2');
		}

		return new Handlebars.SafeString(symbol + x1 + x2);
	});

	Handlebars.registerHelper('numFormatK', function (value, options) {
		var symbol, amount, divider, suffix;

		if ( value > 999999) {
			divider = 10000;
			suffix = 'M';
		} else if ( value > 999) {
			divider = 1000;
			suffix = 'K';
		} else {
			divider = 1;
			suffix = '';
		}

		if ( !options.hash.entity ) {
			symbol = '';
		} else {
			var currencies = _currency.filter(function(cur) {
				return cur.id === options.hash.entity;
			});

			if ( currencies.length ) {
				symbol = currencies[0].symbol;
			}
		}

		if ( !options.hash.round ) {
			amount = Math.round(value/divider);
		} else {
			amount = ( options.hash.round === 'floor' ) ? Math.floor(value/divider) : Math.ceil(value/divider);
		}

		if ( suffix === 'M' ) {
			amount = (amount/100).toFixed(2);
		}

		return new Handlebars.SafeString( symbol + amount + suffix );
	});

	Handlebars.registerHelper('meterMin', function (value, options) {
		return (value * 100) / options.hash.total;
	});

	Handlebars.registerHelper('meterMax', function (value, options) {
		return 100 - ( (value * 100) / options.hash.total );
	});

	Handlebars.registerHelper('pctRound', function (value, options) {
		var percent = (value * 100) / options.hash.total,
			multiplier = Math.pow(10, 0);

		return Math.round(percent * multiplier) / multiplier;
	});

	Handlebars.registerHelper('pctRoundFill', function (value, options) {
		var percent = (value * 100) / options.hash.total,
			multiplier = Math.pow(10, 0);

		return 100 - (Math.round(percent * multiplier) / multiplier);
	});

})();