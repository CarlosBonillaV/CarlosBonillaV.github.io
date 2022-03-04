var DEBUG = HF.isDev;
var pathNow	= '';
var modalNow = '';
var extNow = [];
var perspective = ['chart', 'demand'];
var sessionTimer = null;
var csvLimit = Number(window.csvLocs);
// var pathAws = ( !HF.isDev ) ? 'https://s3.eu-west-2.amazonaws.com/horsefly-web/' : 'https://s3.eu-west-2.amazonaws.com/horsefly-dev/';
// var pathAws = '/assets/horsefly/';
var pathAws = '';
var pathApi = 'http://107.21.39.157:9751/';
var $app = $('#horsefly-app');
var _country = [
	{code: 'ae', currency: 'aed'},
	{code: 'ar', currency: 'ars'},
	{code: 'au', currency: 'aud'},
	{code: 'be', currency: 'euro'},
	{code: 'bg', currency: 'bgn'},
	{code: 'br', currency: 'br'},
	{code: 'ca', currency: 'cad'},
	{code: 'ch', currency: 'chf'},
	{code: 'cl', currency: 'clp'},
	{code: 'cn', currency: 'cny'},
	{code: 'cz', currency: 'czk'},
	{code: 'de', currency: 'euro'},
	{code: 'dk', currency: 'euro'},
	{code: 'es', currency: 'euro'},
	{code: 'fi', currency: 'euro'},
	{code: 'fr', currency: 'euro'},
	{code: 'gt', currency: 'gtq'},
	{code: 'hu', currency: 'huf'},
	{code: 'ie', currency: 'euro'},
	{code: 'in', currency: 'in'},
	{code: 'it', currency: 'euro'},
	{code: 'jp', currency: 'jpy'},
	{code: 'hk', currency: 'hkd'},
	{code: 'mx', currency: 'mxn'},
	{code: 'my', currency: 'myr'},
	{code: 'nl', currency: 'euro'},
	{code: 'no', currency: 'nok'},
	{code: 'nz', currency: 'nzd'},
	{code: 'pe', currency: 'sol'},
	{code: 'ph', currency: 'ph'},
	{code: 'pl', currency: 'pln'},
	{code: 'pt', currency: 'euro'},
	{code: 'ro', currency: 'ron'},
	{code: 'ru', currency: 'rub'},
	{code: 'sa', currency: 'sar'},
	{code: 'se', currency: 'sek'},
	{code: 'sg', currency: 'sgd'},
	{code: 'sv', currency: 'dollar'},
	{code: 'ua', currency: 'uah'},
	{code: 'uk', currency: 'pound'},
	{code: 'us', currency: 'dollar'},
	{code: 'za', currency: 'zar'}
];
var _currency = [
	{id: 'euro', code: 'EUR', symbol: '€', name: 'Euro'},
	{id: 'pound', code: 'GBP', symbol: '£', name: 'British pound sterling'},
	{id: 'dollar', code: 'USD', symbol: '$', name: 'United States dollar'},
	{id: 'aed', code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates dirham'},
	{id: 'ars', code: 'ARS', symbol: '$', name: 'Argentine peso'},
	{id: 'aud', code: 'AUD', symbol: '$', name: 'Australian dollar'},
	{id: 'bgn', code: 'BGN', symbol: 'лв', name: 'Bulgarian lev'},
	{id: 'br', code: 'BRL', symbol: 'R$', name: 'Brazilian real'},
	{id: 'cad', code: 'CAD', symbol: '$', name: 'Canadian dollar'},
	{id: 'chf', code: 'CHF', symbol: 'SFr.', name: 'Swiss franc'},
	{id: 'clp', code: 'CLP', symbol: '$', name: 'Chilean peso'},
	{id: 'cny', code: 'CNY', symbol: '¥', name: 'Chinese yuan renminbi'},
	{id: 'czk', code: 'CZK', symbol: 'Kč', name: 'Czech koruna'},
	{id: 'gtq', code: 'GTQ', symbol: 'Q', name: 'Guatemalan quetzal'},
	{id: 'hkd', code: 'HKD', symbol: 'HK$', name: 'Hong Kong dollar'},
	{id: 'huf', code: 'HUF', symbol: 'Ft', name: 'Hungarian forint'},
	{id: 'in', code: 'INR', symbol: '₹', name: 'Indian rupee'},
	{id: 'jpy', code: 'JPY', symbol: '¥', name: 'Japanese yen'},
	{id: 'mxn', code: 'MXN', symbol: '$', name: 'Mexican peso'},
	{id: 'myr', code: 'MYR', symbol: 'RM', name: 'Malaysian ringgit'},
	{id: 'nok', code: 'NOK', symbol: 'kr', name: 'Norwegian krone'},
	{id: 'nzd', code: 'NZD', symbol: '$', name: 'New Zealand dollar'},
	{id: 'sol', code: 'SOL', symbol: 'S/', name: 'Peruvian Sol'},
	{id: 'ph', code: 'PHP', symbol: '₱', name: 'Philippine peso'},
	{id: 'pln', code: 'PLN', symbol: 'zł', name: 'Polish zloty'},
	{id: 'ron', code: 'RON', symbol: 'lei', name: 'Romanian leu'},
	{id: 'rub', code: 'RUB', symbol: '₽', name: 'Russian ruble'},
	{id: 'sar', code: 'SAR', symbol: 'SR', name: 'Saudi riyal'},
	{id: 'sek', code: 'SEK', symbol: 'kr', name: 'Swedish krona'},
	{id: 'sgd', code: 'SGD', symbol: 'S$', name: 'Singapore dollar'},
	{id: 'uah', code: 'UAH', symbol: '₴', name: 'Ukrainian hryvnia'},
	{id: 'zar', code: 'ZAR', symbol: 'R', name: 'South African rand'}
];
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
var events = {
	events: {},
	on: function (eventName, fn) {
		this.events[eventName] = this.events[eventName] || [];
		this.events[eventName].push(fn);
	},
	off: function(eventName, fn) {
		if (this.events[eventName]) {
			for (var i = 0; i < this.events[eventName].length; i++) {
				if (this.events[eventName][i] === fn) {
					this.events[eventName].splice(i, 1);
					break;
				}
			}
		}
	},
	emit: function (eventName, data) {
		if (this.events[eventName]) {
			this.events[eventName].forEach(function(fn) {
				fn(data);
			});
		}
	}
};
HF.views = (function () {

	/*
	 *  Constants
	 */

	var templates = {},
		viewsReady = false,
		$modalWrap = $('#modal'),
		$backdrop = $('.backdrop'),
		$toggleChat = null;



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('doneLoading', function(el) {
		$('#' + el).removeClass('loading');
	});



	/*
	 *  Public methods
	 */

	function checkSession() {
		$.ajax({
			type: 'GET',
			url: pathApi + 'horsefly/sessions/check?uuid=' + window.uuid,
			crossDomain: true,
			success: function(data) {
				// console.log('Checking session: ', data);

				if ( data.active > 0 ) {
					clearInterval(sessionTimer);
					sessionTimer = null;
				}

				if ( data.active === 1 ) {
					console.log('Another session is currently active => Show logout modal | Timer stopped');
					modal({modalurl: 'doLogout', bgclose: false});
				} else if ( data.active === 2 ) {
					console.log('Someone else started a session => Show logged out modal | Timer stopped');
					modal({modalurl: 'loggedOut', bgclose: false});
				}
			}
		});
	}


	function set(baseName, viewName, wrapID) {
		console.groupCollapsed('Views => Resolving contents');
		var el, eq;

		if (!baseName || !viewName) {
			var type = (!baseName) ? 'Base' : 'Content';

			console.error(type + ' view not specified');
			console.groupEnd();
			return false;
		} else {
			eq = _viewPathEq(baseName + '-' + viewName);
		}

		if (eq === 'same') {
			console.warn('Trying to load same view => No action taken');
			console.groupEnd();
			return false;
		}

		if (eq === 'none') {
			console.log('Requested new base view');
			console.log('Set base view');
			console.groupEnd();

			el = (!wrapID) ? 'key' : wrapID;

			if (!pathNow) {
				_setBase(baseName, viewName, el);
			} else {
				_unbindPrevious('base', baseName, viewName, el);
			}
		}

		if (eq === 'base') {
			console.log('Using same base view');
			console.log('Set content view');
			console.groupEnd();

			el = (!wrapID) ? 'base-contents' : wrapID;

			_unbindPrevious('content', baseName, viewName, el);
		}
	}


	function addModule($el, modName, context) {
		console.groupCollapsed('Resolve module | ' + modName);

		var isReady	= $.Deferred();
		var partial = 'mod_' + modName;

		console.log('Template name:');
		console.log(partial);
		console.log('--------------------------');
		console.log('Template context:');
		console.log( (!context) ? 'No data found' : context );
		console.groupEnd();

		$.when(
			_renderPartial($el, partial, context, true)
		).then(function (complete) {
			if (!complete) {
				_error($el, 'module');
			}

			isReady.resolve(complete);
		});

		return isReady.promise();
	}


	function setDetails(viewName, geoPoint, geoName, trigger, el) {
		if ( extNow.length > 0 ) {
			if (extNow[0] === viewName && extNow[1] === geoPoint) {
				console.warn('Requested same details view => No action taken');
				return false;
			} else {
				var prevView = extNow[0];

				$.when(
					HF[prevView].unload()
				).then(function(unloaded) {
					if (unloaded) {
						_showDetails(viewName, geoPoint, geoName, trigger, el);
					}
				});
			}
		} else {
			_showDetails(viewName, geoPoint, geoName, trigger, el);
		}
	}


	function modal(options) {
		if (modalNow && options.modalurl === modalNow) {
			console.log('Trying to open same modal => No action taken');
			return false;
		}

		var bgClose = (options.bgclose === undefined) ? true : options.bgclose,
			isInfo = (options.isinfo === undefined) ? false : options.isinfo;

		if ( $modalWrap.hasClass('show') ) {
			_modalHide(options.modalurl, bgClose, isInfo);
		} else {
			$backdrop.fadeIn(300);
			_modalShow(options.modalurl, bgClose, isInfo);
		}
	}



	/*
	 *  Private methods
	 */

	function _unbindPrevious(type, baseName, viewName, el) {
		$('#' + el).addClass('loading');

		var pathArgs = pathNow.split('-'),
			prevBase = pathArgs[0],
			tempView = pathArgs[1],
			isLevel	 = ( prevBase === 'results' && tempView.indexOf('level') === 0 ),
			prevView = ( !isLevel ) ? tempView : 'list';

		console.groupCollapsed('Unbind current ' + type + ' view | ', (type === 'base') ? prevBase : tempView);
		
		var whenView = (type === 'base')
			? HF[prevBase].unload(tempView)
			: HF[baseName][prevView].unload(tempView);

		$.when(
			whenView
		).then(function(unloaded) {
			if ( unloaded ) {
				console.log('Unbind complete');
				console.groupEnd();

				if (type === 'base') {
					_setBase(baseName, viewName, el);
				} else {
					_setView(baseName, viewName, el);
				}
			}
		});
	}


	function _setBase(baseName, viewName, el) {
		$el = $('#' + el);
		$el.addClass('loading').empty();

		var elWrapper, elTemplate, elContext;

		$.when(
			HF.views.base.get(baseName)
		).then(function (baseData) {
			if (!baseData) {
				return '404';
			}

			elWrapper	= baseData[1];
			elTemplate	= baseData[0];
			elContext	= baseData[2];

			return _renderPartial($el, elTemplate, elContext);
		}).then(function (rendered) {
			if ( rendered ) {
				if ( rendered === '404' ) {
					_404($el);
				} else {
					// Initialize base view
					HF[baseName].init(viewName);
					_setView(baseName, viewName, elWrapper);
				}
			} else {
				_error($el, 'view');
			}
		});
	}


	function _setView(baseName, viewName, el) {
		console.groupCollapsed('Resolve content view | ' + viewName);

		$el = $('#' + el);
		$el.addClass('loading').empty();

		// Check if new content view is a level of results
		var isLevel = ( baseName === 'results' && viewName.indexOf('level') === 0 );

		// If level of results, use list results partial, otherwise use composed partial name
		var partial = ( !isLevel )
			? 'view_' + baseName + '_' + viewName
			: 'view_' + baseName + '_list';

		console.log('Template name:');
		console.log(partial);
		console.log('--------------------------');
		console.log('Template context:');

		$.when(
			HF[baseName][(!isLevel) ? viewName : 'list'].getData()
		).then(function (context) {
			console.log( (!context) ? 'No data found' : context );
			console.groupEnd();

			return _renderPartial($el, partial, context);
		}).done(function (rendered) {
			if ( rendered ) {
				// Set current path
				pathNow = baseName + '-' + viewName;
				// Initialize content view
				HF[baseName][(!isLevel) ? viewName : 'list'].init(el);
			} else {
				_404($el);
			}
		});
	}


	function _showDetails(viewName, geoPoint, geoName, trigger, el) {
		console.groupCollapsed('Resolve details view | ' + viewName);

		$el = (!el) ? $('#ext') : $('#' + el);
		$el.attr('class', 'loading').empty();

		var partial = 'extra_' + viewName;

		console.log('Template name:');
		console.log(partial);
		console.log('--------------------------');
		console.log('Template context:');

		$.when(
			HF[viewName].getData(geoPoint, geoName, trigger)
		).then(function (context) {
			console.log( (!context) ? 'No data found' : context );
			console.groupEnd();

			return _renderPartial($el, partial, context);
		}).done(function (rendered) {
			if ( rendered ) {
				// Set current path
				extNow = [viewName, geoPoint];
				// Initialize content view
				HF[viewName].init(el);
			} else {
				_404($el);
			}
		});
	}


	function _modalShow(modalName, closeWithBg, isInfo) {
		console.log('is info? ', isInfo);
		$modalWrap.html('<div class="m-x"><div class="m-y"><div class="m-z"></div></div></div>');

		var $modal = $modalWrap.find('.m-z'),
			partial = 'modal_' + modalName;

		$.when(
			_renderPartial($modal, partial, null)
		).then(function(rendered) {
			if (rendered) {
				return isInfo ? true : HF.modal[modalName].load($modal);
			} else {
				return false;
			}
		}).done(function (loaded) {
			console.log('Is modal complete? ', loaded);

			if ( loaded ) {
				console.log('modal loaded');
				$modalWrap
					.attr('aria-hidden', 'false')
					.addClass('show')
					.animate({
						opacity: 1
					}, 300, function() {
						modalNow = modalName;
					});

				if (closeWithBg) {
					$modalWrap.on('click', '.m-x, .m-close', function (e) {
						e.preventDefault();
						_modalHide(0, 0, isInfo);
					});
				} else {
					$modalWrap.on('click', '.m-close', function (e) {
						e.preventDefault();
						_modalHide(0, 0, isInfo);
					});
				}

				$modalWrap.on('click', '.m-z > div', function (e) {
					e.stopPropagation();
				});
			} else {
				_modalHide(0, 0, true);
			}
		});
	}


	function _modalHide(urlModal, closeWithBg, isInfo) {
		var shouldUnload = isInfo ? true : HF.modal[modalNow].unload();

		$.when(
			shouldUnload
		).then(function(unloaded) {
			if (unloaded) {
				if (isInfo) {
					modalNow = '';
				}

				$modalWrap.animate({
					opacity: 0
				}, 300, function() {
					$(this)
						.off()
						.attr('aria-hidden', 'true')
						.removeClass('show')
						.empty();

					if (urlModal) {
						_modalShow(urlModal, closeWithBg);
					} else {
						$backdrop.fadeOut(300);
					}
				});
			}
		});
	}



	/*
	 *  Render Methods
	 */

	function _renderPartial($el, partial, context, append) {
		console.groupCollapsed('Resolve partial template');
		console.log('Partial name: ', partial);

		var isReady	= $.Deferred(),
			exists	= _partialExists(partial);

		if ( exists ) {
			console.log('Rendering partial');

			if (append) {
				$el.append( (!context) ? templates[partial]() : templates[partial](context) );
			} else {
				$el.html( (!context) ? templates[partial]() : templates[partial](context) );
			}
		} else {
			console.log('Partial does not exists');
		}

		console.groupEnd();
		isReady.resolve(exists);
		return isReady.promise();
	}


	function _error($el, elType, customMsg) {
		var errorMsg;

		if (elType === 'view') {
			pathNow = 'error';
		}

		if (customMsg) {
			errorMsg = customMsg;
		} else {
			errorMsg = (!elType)
				? 'Something went wrong!'
				: 'There was an error loading this ' + elType;
		}

		$el.html(
				'<div class="module-error-msg">' +
				errorMsg +
				'</div>')
			.removeClass('loading');
	}


	function _404($el) {
		$.when(
			_renderPartial($el, 'view_not_found')
		).done(function (rendered) {
			if (rendered) {
				pathNow = 'not-found';
				$el.removeClass('loading');
			} else {
				_error($el, 'view');
			}
		});
	}



	/*
	 *  Helpers
	 */

	function _partialExists(partial) {
		console.log('Checking partial integrity');
		return templates.hasOwnProperty(partial);
	}


	function _viewPathEq(pathView) {
		var eq = 'none';

		if (pathNow) {
			if (pathNow === pathView) {
				eq = 'same';
			} else {
				var pathCur = pathNow.split('-'),
					pathNxt = pathView.split('-');

				if (pathCur[0] === pathNxt[0]) {
					eq = 'base';
				}
			}
		}

		return eq;
	}



	/*
	 *  Initial Compilation Methods
	 */

	function _initialContents() {
		console.log('Ready to load contents');
		console.groupEnd();
		set('search', 'build', 'key');
		HF.map.init('alt');

		$toggleChat = $('#toggleChat');

		if ( $('#toggleChat').length ) {
			$toggleChat.on('click', function(e) {
				e.preventDefault();

				$('#hubspot-messages-iframe-container').toggleClass('hidden');
			});
		}

		if ( !window.notAlone ) {
			console.log('No session open => No modal to show | Set timer');
			sessionTimer = setInterval(checkSession, 15000);
		} else if (window.notAlone === 1) {
			console.log('Another session is currently active => Show logout modal | No timer set');
			modal({modalurl: 'doLogout', bgclose: false});
		} else {
			console.log('Someone else started a session => Show logged out modal | No timer set');
			modal({modalurl: 'loggedOut', bgclose: false});
		}
	}

	function _renderLayout() {
		console.log('Rendering main layout');
		$app.append( templates.layoutBody() );
		viewsReady = true;

		_initialContents();
	}


	function _compileTemplates($temp) {
		console.log('Compiling templates');
		$temp.find('script').each(function() {
			var name = $(this).attr('name'),
				src = $(this).html(),
				partial = $(this).attr('partial-name');

			if (partial) {
				Handlebars.registerPartial(partial, src);
			}
			
			templates[name] = Handlebars.compile(src);
		});

		$temp.remove();
		_renderLayout();
	}


	function _fetchTemplates() {
		console.log('Fetching templates');
		var pathTmpl = (HF.isDev) ? 'dev' : 'prod';

		$.ajax({
			type: 'GET',
			url: pathAws + 'tmpl/' + pathTmpl + '.html?v='+version,
			crossDomain: true,
			cache: true,
			success: function(data) {
				var $temp = $('<div />', { id: 'temp' });
				$temp.html(data).appendTo('body');

				_compileTemplates($temp);
			}
		});
	}


	if (!viewsReady) {
		console.groupCollapsed('Views => Initializing');
		HF.modal = {};
		_fetchTemplates();
	}



	/*
	 *  Exposed public methods
	 */

	return {
		set: set,
		addModule: addModule,
		setDetails: setDetails,
		modal: modal,
		checkSession: checkSession
	};
})();
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
HF.search.build = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap,
		$createGroupBtn, $createLocGroupBtn, $filters, $searchActions, $searchButtons;



	/*
	 *  Private cached data and defaults
	 */

	var tagGroupLen = 0,
		locGroupLen = 0,
		_config = {
			cachedTags: [],
			cachedLocs: [],
			searchData: {
				geo: ['northern europe', 'uk', 0, 0],
				cur: 'pound',
				rad: ''
			},
			filterData: {
				male: 1,
				female: 1,
				yoe0: 1,
				yoe1: 1,
				yoe2: 1
			}
		};



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('groupStatus', function(status) {
		if (status === 'noSearch') {
			$createGroupBtn.addClass('disabled');

			if ( $searchActions.hasClass('ready') ) {
				console.log('Unbind search panel events');

				$searchActions.removeClass('ready');
				$searchButtons.off('click');
			}
		}

		if (status === 'isEmpty') {
			$createGroupBtn.addClass('disabled');
		}

		if (status === 'canAdd') {
			$createGroupBtn.removeClass('disabled');
		}

		if (status !== 'noSearch') {
			if ( !$searchActions.hasClass('ready') ) {
				console.log('Bind search panel events');

				$searchActions.addClass('ready');

				$searchButtons.on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();

					if ( $(this).data('action') === 'explore' ) {
						_exploreResults();
					} else {
						_resetSearch();
					}
				});
			}
		}
	});


	// Bind
	function _eventsBind() {
		$createGroupBtn = $('#create-tag-group');
		$createLocGroupBtn = $('#create-loc-group');
		$searchActions = $('#search-actions');
		$searchButtons = $searchActions.find('a.btn');

		// Create tag group button click event
		$createGroupBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			}

			_addTagGroup();
		});

		// Create tag group button click event
		$createLocGroupBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			}

			_addLocGroup();
		});

		$filters.on('click', 'a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var parent = $(this).parent();

			if ( !parent.hasClass('show') ) {
				parent.addClass('show');
				$(document).on('click', _closeFilters);
			} else {
				parent.removeClass('show');
				$(document).off('click', _closeFilters);
			}
		});

		$filters.on('change', 'input[type=checkbox]', function(e) {
			var len = $(this).closest('.filter-block').find('input[type=checkbox]:checked').length;

			if ( !this.checked && !len) {
				$(this).prop('checked', true);
			} else {
				_config.filterData[this.value] = (this.checked) ? 1 : 0;
			}
		});

		console.log('Events successfully binded');
	}


	// Unbind
	function _eventsUnbind() {
		// Reset tag group count
		tagGroupLen = 0;
		locGroupLen = 0;
		// Unbind click events
		$createGroupBtn.off('click');
		$createLocGroupBtn.off('click');
		$searchButtons.off('click');
		$filters.off('click');
		$filters.off('change');
		// Reset cached DOM elements
		$createGroupBtn = null;
		$createLocGroupBtn = null;
		$filters = null;
		$searchActions = null;
		$searchButtons = null;

		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | build');
		var cachedTagsLen = _config.cachedTags.length;
		var cachedLocsLen = _config.cachedLocs.length;

		elViewWrap = el;

		$.when(
			HF.selects.init()
		).then(function(done) {
			console.log('Done: ', done);
			if ( done ) {
				return ( !cachedLocsLen )
					? _addLocGroup()
					: _allLocGroups(cachedLocsLen);
			}
		}).then(function(added) {
			console.log('Added: ', added);
			if ( added ) {
				return ( !cachedTagsLen )
					? _addTagGroup()
					: _allTagGroups(cachedTagsLen);
			}
		}).then(function(created) {
			if ( created ) {
				_setFilters();
				_eventsBind();

				if ( cachedTagsLen ) {
					events.emit('groupStatus', 'canAdd');
				}

				events.emit('doneLoading', elViewWrap);
				console.groupEnd();
			}
		});
	}


	function getData(type, subtype) {
		if (!type) {
			return _getContext();
		} else {
			return (!subtype) ? _config[type] : _config[type][subtype];
		}
	}


	function setData(name, data, pos) {
		var dataObj = _config.searchData;

		if (name === 'search-new') {
			_deepReset();
		} else {
			if ( dataObj.hasOwnProperty(name) ) {
				if (!pos) {
					dataObj[name] = data;
				} else {
					dataObj[name][pos - 1] = data;
				}
			} else {
				console.error('Property does not exists in search data');
				return false;
			}
		}
	}


	function setSaved(sid) {
		var savedReady = $.Deferred();

		$.when(
			_getSavedData(sid)
		).then(function(data) {
			console.log('Set saved search: ', data);

			if (data) {
				_loadSavedData(data);
			}
		}).then(function (ready) {
			$('#base-controls').find('ul.tabs > li').removeClass('active');
			$('#base-controls').find('ul.tabs > li').first().addClass('active');

			HF.views.set('search', 'build');
		});
	}


	function unload(type) {
		var isUnload = $.Deferred();

		console.log('Unload view');

		$.when(
			HF.selects.destroyAll(),
			HF.tags.getBool()
		).then(function(selDestroy, tagGroups) {
			if (selDestroy && tagGroups) {
				_config.cachedTags = tagGroups;
				_eventsUnbind();

				return HF.tags.resetAll();
			}
		}).then(function(tagDestroy) {
			if (tagDestroy) {
				isUnload.resolve(tagDestroy);
			}
		});

		return isUnload.promise();
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		return false;
	}


	function _getSavedData(sid) {
		var payload = {searchId: parseInt(sid)};

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/search',
			data: payload,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _loadSavedData(data) {

		console.log('Cached Tags: ', _config.cachedTags);
		console.log('Cached Locs: ', _config.cachedLocs);

		// Clean cachedTags and geo data
		_config.cachedTags.length = 0;
		_config.cachedLocs.length = 0;
		_config.searchData.geo = 0;

		// Convert response geoPath into array
		var geoArray = data.geoPath.split('/');
		// Remove geoArray first empty item
		geoArray.shift();

		// Convert '0' values into numbers
		geoArray = geoArray.map(function(item) {
			return item === '0' ? 0 : item;
		});

		// Populate _config data
		_config.searchData.rad = (data.distance === '0') ? '' : Number(data.distance);
		_config.searchData.cur = (data.currency) ? data.currency : 'pound'; 
		_config.searchData.geo = geoArray;
		_config.cachedTags = data.tags.or;
		_config.cachedLocs = JSON.parse(data.geoPath);

		return true;
	}



	/*
	 *  Tag events
	 */

	function _addTagGroup() {
		var isReady = $.Deferred();

		$.when(
			HF.tags.addGroup('tag-groups', tagGroupLen)
		).then(function (complete) {
			if (complete) {
				$('#tag-group-' + tagGroupLen).removeClass('loading');
				$('#create-tag-group').addClass('disabled');
				tagGroupLen++;

				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}


	function _allTagGroups(len) {
		var isReady = $.Deferred();

		$.when(
			HF.tags.setGroups('tag-groups', _config.cachedTags)
		).then(function(complete) {
			if (complete) {
				tagGroupLen = len;
				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}



	/*
	 *  Loc events
	 */

	function _addLocGroup() {
		var isReady = $.Deferred();

		$.when(
			HF.locs.addGroup('loc-groups', locGroupLen)
		).then(function (complete) {
			if (complete) {
				$('#loc-group-' + locGroupLen).removeClass('loading');

				if ( locGroupLen ) {
					$('#create-loc-group').addClass('disabled');
				}

				locGroupLen++;

				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}


	function _allLocGroups(len) {
		var isReady = $.Deferred();

		console.log('Cached locations: ', _config.cachedLocs);

		$.when(
			HF.locs.setGroups('loc-groups', _config.cachedLocs)
		).then(function(complete) {
			if (complete) {
				locGroupLen = len;
				isReady.resolve(complete);
			}
		});

		return isReady.promise();
	}



	/*
	 *  Search form events
	 */

	function _exploreResults() {
		$.when(
			HF.locs.getGroups(), HF.tags.getBool()
		).then(function(locGroupArray, tagGroupArray) {
			_config.cachedLocs = locGroupArray;

			var data = $.extend(true, {}, _config.searchData),
				filters = $.extend(true, {}, _config.filterData),
				payload = {
					tags: JSON.stringify({or: tagGroupArray}),
					locations: JSON.stringify(locGroupArray),
					currency: data.cur,
					filters: JSON.stringify(filters),
					token: 'xtempx'
				};

			data.payload = payload;

			console.log('Explore Data: ', data);

			events.emit('searchSetup', data);
		});
	}


	function _deepReset() {
		_config.cachedTags.length = 0;
		_config.cachedLocs.length = 0;
		_config.searchData.cur = 'pound';
		_config.searchData.rad = '';
		_config.searchData.geo[0] = 'northern europe';
		_config.searchData.geo[1] = 'uk';
		_config.searchData.geo[2] = 0;
		_config.searchData.geo[3] = 0;

		_resetFilters(false);

		HF.views.set('search', 'build');
	}

	function _resetSearch() {
		console.log('Reset search form');
		var wrapID = 'tag-groups',
			$wrap = $('#' + wrapID);

		$wrap.addClass('loading');

		tagGroupLen = 0;
		locGroupLen = 0;

		$.when(
			HF.selects.clean(),
			HF.locs.resetAll(),
			HF.tags.resetAll(wrapID, tagGroupLen)
		).then(function(resetLocs, resetTags) {
			if ( resetLocs && resetTags ) {
				_resetFilters(true);
				$('#tag-group-' + tagGroupLen).removeClass('loading');
				tagGroupLen++;
				locGroupLen++;
				$wrap.removeClass('loading');
			}
		});
	}


	function _setFilters() {
		$filters = $('#filters');

		for (var key in _config.filterData) {
			if ( _config.filterData.hasOwnProperty(key) ) {
				$filters.find('#' + key).prop('checked', (!_config.filterData[key]) ? false : true );
			}
		}
	}


	function _resetFilters(resetDOM) {
		if (resetDOM) {
			$filters.find('input[type=checkbox]').prop('checked', true);
		}

		for (var key in _config.filterData) {
			if ( _config.filterData.hasOwnProperty(key) ) {
				_config.filterData[key] = 1;
			}
		}
	}


	function _closeFilters(e) {
		if ( !$(e.target).closest('#filters').length ) {
			$filters.removeClass('show');
			$(document).off('click', _closeFilters);
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		setData: setData,
		setSaved: setSaved,
		unload: unload
	};
})();
HF.search.saved = (function () {

	/*
	 *  Constants
	 */

	var apiFavSearch = pathApi + 'horsefly/favoritesearches';



	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, $elFavGroup, $elBtnDel, $elCheckAll, $elFilter;



	/*
	 *  Private cached data and defaults
	 */

	var _config = {
		cachedFavs: [],
		checkedFavs: [],
		toDelete: []
	};



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		var $el = $('#' + elViewWrap);
		$elFavGroup = $el.find('ul.item-list');
		$elBtnDel	= $el.find('#delete-selected');
		$elCheckAll	= $el.find('#checkAll');
		$elFilter	= $el.find('#filter-input');
		$elSortName	= $el.find('#sort-name');

		_updateBtnDel(_config.checkedFavs.length);

		$elFavGroup.on('change', 'input[type=checkbox]', function(e) {
			if (this.checked) {
				$(this).closest('li').addClass('selected');
				_config.checkedFavs.push(this.value);
			} else {
				$(this).closest('li').removeClass('selected');
				_config.checkedFavs.splice(_config.checkedFavs.indexOf(this.value, 0), 1);
			}

			_updateBtnDel(_config.checkedFavs.length);
		});

		$elFavGroup.on('click', '.actions a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var sid = $(this).closest('li').data('sid');

			if ( $(this).hasClass('load') ) {
				HF.search.build.setSaved(sid);
			} else {
				_config.toDelete = [sid.toString()];
				HF.views.modal({modalurl: 'deleteSearch', bgclose: false});
			}
		});

		$elBtnDel.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_config.toDelete = _config.checkedFavs.slice(0);
			HF.views.modal({modalurl: 'deleteSearch', bgclose: false});
		});

		$elCheckAll.on('change', function(e) {
			var $elFavItem = $elFavGroup.children('li'),
				len = $elFavItem.length;

			$elFavItem.toggleClass('selected', this.checked);
			_config.checkedFavs.length = 0;

			_updateBtnDel( this.checked ? len : 0 );
			_toggleAllChecks(this.checked, len);
		});

		$elFilter.on('keyup', function(e) {
			var query = e.target.value;

			$elFavGroup.find('li').filter(function() {
				var regex = new RegExp(query, 'ig'),
					data = $(this).find('span').text();

				$(this)[0].style.display = (regex.test(data)) ? 'block' : 'none';
			});
		});

		$elSortName.on('click', function(e) {
			e.preventDefault();

			var $elFavItem = $elFavGroup.children('li');

			$elFavItem.sort(function(a, b) {
				var textA = $(a).find('span').text().toUpperCase();
				var textB = $(b).find('span').text().toUpperCase();
				return (textA < textB) ? -1 : 1;
			});

			$.each($elFavItem, function(i, elItem) {
				$elFavGroup.append(elItem);
			});
		});

		console.log('Events successfully binded');
	}


	// Unbind
	function _eventsUnbind() {
		$elFavGroup.off('change');
		$elFavGroup.off('click');
		$elBtnDel.off('click');
		$elCheckAll.off('change');
		$elFilter.off('keyup');
		$elSortName.off('click');

		_config.checkedFavs.length = 0;
		_config.toDelete.length = 0;

		$elFavGroup = null;
		$elBtnDel	= null;
		$elCheckAll	= null;
		$elFilter	= null;
		$elSortName = null;

		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | saved');
		elViewWrap = el;

		_eventsBind();
		events.emit('doneLoading', elViewWrap);

		console.groupEnd();
	}


	function getData(type) {
		if (!type) {
			return _getContext();
		} else {
			return _config[type];
		}
	}


	function updateData(isCancel) {
		if ( !isCancel ) {
			var updated = $.Deferred(),
				isMulti = (_config.toDelete.length > 1) ? true : false;

			// Filter out deteled searches from cached favorites
			_config.cachedFavs = _config.cachedFavs.filter( function( fav ) {
				return _config.toDelete.indexOf( fav.searchId ) < 0;
			});

			// Deleted multiple searches
			if (isMulti) {
				// Empty checked array
				_config.checkedFavs.length = 0;
				// Remove all checked list items
				$elFavGroup.find('li.selected').remove();
			// Deleted single search
			} else {
				// If there are multiple checked searches
				if ( _config.checkedFavs.length ) {
					// Remove deleted search from checked array
					_config.checkedFavs.splice(_config.checkedFavs.indexOf(_config.toDelete[0], 0), 1);
				}

				// Remove deleted list item
				$elFavGroup.find('li[data-sid="' + _config.toDelete[0] + '"]').remove();
			}

			// Empty temporal delete array
			_config.toDelete.length = 0;
			// Update delete button
			_updateBtnDel(_config.checkedFavs.length);

			// Resolve promise
			updated.resolve(true);
			return updated.promise();
		} else {
			// Empty temporal delete array
			_config.toDelete.length = 0;
		}
	}


	function resetCached() {
		_config.cachedFavs.length = 0;
	}


	function unload(type) {
		console.log('Unload view');

		_eventsUnbind();

		return true;
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		var ctxReady = $.Deferred();

		if (!_config.cachedFavs.length) {
			console.log('No cached data found -> Fetching');

			$.when(
				_fetchFavData()
			).then(function (data) {
				ctxReady.resolve({favorites: data});
			});
		} else {
			console.log('Cached data found -> Reusing');
			ctxReady.resolve({favorites: _config.cachedFavs});
		}

		return ctxReady.promise();
	}


	function _fetchFavData() {
		return $.ajax({
			type: 'POST',
			url: apiFavSearch,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data);

				if ( !$.isEmptyObject(parsed) ) {
					parsed = parsed.map(function(item) {
						return {searchId: item.id, searchName: item.searchName.toLowerCase()};
					});
				}

				return JSON.stringify(parsed);
			},
			success: function (favorites) {
				_config.cachedFavs = favorites;

				return favorites;
			}
		});
	}


	function _updateBtnDel(len) {
		$elBtnDel[0].style.display = (len <= 0) ? 'none' : 'block';
		$elBtnDel.find('span').text(len);
	}


	function _toggleAllChecks(isChecked, len) {
		var $elFavItems = $elFavGroup.find('input[type=checkbox]');

		var i = 0;
		while (i < len) {
			$elFavItems[i].checked = isChecked;

			if (isChecked) {
				_config.checkedFavs.push($elFavItems[i].value);
			}

			i++;
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		resetCached: resetCached,
		updateData: updateData,
		unload: unload
	};
})();
HF.search.upload = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, $form, $fileBox, $fileInput, $fileName, $fileBtn, $fileError, $resMsg;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		var $el = $('#' + elViewWrap);

		$form = $('#form-upload');
		$fileBox = $form.children('.file-box');
		$fileInput = $fileBox.children('input');
		$fileName = $fileBox.children('.name-upload');
		$fileBtn = $('#btn-upload');
		$fileError = $('#error-upload');
		$resMsg = $('#response-msg');

		$fileBtn.on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			} else {
				$fileBtn.addClass('disabled');
				_processFile();
			}
		});

		// Add chosen filename to custom file input
		$fileInput.on('change', function (e) {
			var fileList = $(this)[0].files;

			$resMsg.empty();

			if ( $(this).val() !== '' ) {
				console.log('File list: ', fileList);

				_isValidFileType(fileList);

				$fileName.text( $(this).val().split( '\\' ).pop() );
				$fileBox.addClass('with-file');
			} else {
				$fileName.text( 'No file selected' );
				$fileBtn.addClass('disabled');

				$fileError
					.text('CV file is required')
					.css('display', 'block');
			}
		});

		console.log('Events successfully binded');
	}


	// Unbind
	function _eventsUnbind() {
		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | upload');
		elViewWrap = el;

		_eventsBind();
		events.emit('doneLoading', elViewWrap);

		console.groupEnd();
	}


	function getData(type) {
		return _getContext();
	}


	function unload(type) {
		console.log('Unload view');

		_eventsUnbind();

		return true;
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		var ctxReady = $.Deferred();

		ctxReady.resolve(true);

		return ctxReady.promise();
	}


	// Check if file types are valid
	function _isValidFileType(files) {
		var cvTypes = ['application/zip'],
			fileType = files[0].type,
			valid = false;

		console.log('Checking files');
		console.log('File Type: ', fileType);

		if ( $.inArray(fileType, cvTypes) !== -1 ) {
			$fileBtn.removeClass('disabled');

			$fileError
				.empty()
				.css('display', 'none');

			valid = true;
		} else {
			$fileBtn.addClass('disabled');

			$fileError
				.text('Accepted file extensions: zip')
				.addClass('error')
				.css('display', 'block');
		}

		return valid;
	}


	function _processFile() {
		var fileData = new FormData( $form[0] );

		console.log('Form: ', $form[0]);
		console.log('File Data: ', fileData);

		$.when(
			_uploadFile(fileData)
		).then(function (response) {
			if ( !response ) {
				$fileBtn.removeClass('disabled');

				$fileError
					.text('Your file could not be uploaded. Please try again!')
					.addClass('error')
					.css('display', 'block');
			} else {
				$fileInput.val('');

				$fileBox.removeClass('with-file');

				$resMsg.html('<pre>' + JSON.stringify(response) + '</pre>');

				$fileError
					.text('File uploaded successfully!')
					.removeClass('error')
					.css('display', 'block');

				setTimeout(function() {
					$fileError
						.empty()
						.addClass('error')
						.css('display', 'none');
				}, 3000);
			}
		});
	}


	// Upload User CV
	function _uploadFile(fileData) {
		console.log('Form Data: ', fileData.get('file-upload') );

		return $.ajax({
			type: 'POST',
			url: '/candidates/companies/uploadCVs',
			data: fileData,
			processData: false,
			contentType: false,
			async:		 false,
			crossDomain: true,
			cache:		 false
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
HF.candidates = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, $elWrapMain, $elWrapDets, $elBreakdown, $elChartSwitch, $elTabList, elChartWrap, elChart, elEthnicWrap, elEthnic, elTree;



	/*
	 *  Private cached data
	 */

	var _geoPoint, _trigger, _gender, _exp, _ethnic,
		_configBase = [
		{
			'viewName': 'demand',
			'tabTitle': 'supply and demand'
		},
		{
			'viewName': 'schools',
			'tabTitle': 'universities'
		},
		{
			'viewName': 'jobTitles',
			'tabTitle': 'job titles'
		},
		{
			'viewName': 'companies',
			'tabTitle': 'companies'
		},
		{
			'viewName': 'hardSkills',
			'tabTitle': 'keywords'
		}
	];



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		// Set active tab
		$elTabList.find('a[data-tab="' + perspective[1] + '"]').parent('li').addClass('active');

		// Click on tab element
		$elTabList.on('click', 'a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).parent().hasClass('active') ) {
				return false;
			}

			var viewName = $(this).data('tab');
			_toggleView( viewName, true );
		});

		$elWrapMain.on('click', 'a.backbtn', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_eventsUnbind();
			var $el = $('#' + elViewWrap);
			$el.removeClass('candidates');

			setTimeout(function() {
				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;
			}, 500);
		});

		$elWrapMain.on('click', 'a.switch-view', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var viewName = $(this).hasClass('list') ? 'list' : 'chart';
			$(this).toggleClass('list');
			_toggleView( viewName, false );
		});

		$('#' + elChartWrap).on('click', 'a.projections', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).addClass('loading');
			var type = $(this).data('type');
			var value = $(this).data('value');

			_showProjection(type, value, 'future');
		});

		console.log('Events successfully binded');

		return true;
	}


	// Unbind
	function _eventsUnbind() {
		$elWrapMain.off('click');
		$elTabList.off('click');

		_geoPoint = null;
		_trigger = null;
		_gender = null;
		_exp = null;
		_ethnic = null;

		elChartWrap	= null;
		elEthnicWrap = null;
		$elWrapMain	= null;
		$elWrapDets	= null;
		$elBreakdown = null;
		$elChartSwitch = null;
		$elTabList  = null;
		elTree = null;

		console.log('Events successfully unbinded');

		return true;
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init details view | candidates');

		elViewWrap	= el;
		elChartWrap	= 'perspective-wrap';
		elEthnicWrap = 'ethnicity-wrap';
		$elWrapMain	= $('#ext-wrap');
		$elWrapDets	= $('#ext-details');
		$elBreakdown = $('#demographics');
		$elChartSwitch = $('#perspective-switch');
		$elTabList	= $('#tabs-wrapper').children('.tabs');

		// Initialize perspective view
		perspective[2] = 'candidates';

		if ( perspective[0] === 'list' ) { 
			$elWrapMain.find('a.switch-view').removeClass('list');
		}

		$.when(
			_eventsBind()
		).then(function(binded) {
			if (binded) {
				return _getChartData();
			}
		}).then(function(charted) {
			if ( charted ) {
				$('#' + el).addClass('candidates');
				console.groupEnd();

				setTimeout(function() {
					$('#' + el).removeClass('loading');
				}, 300);
			}
		});
	}


	function getData(geoPoint, geoName, trigger) {
		return _getBaseData(geoPoint, geoName, trigger);
	}


	function unload() {
		var isUnload = $.Deferred();

		console.log('Unload details view');

		var $el = $('#' + elViewWrap);
		$el.removeClass('candidates');

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



	// DOM
	function _toggleView(viewName, isType) {
		if ( perspective[0] === 'chart' ) {
			if ( elChart ) {
				elChart.destroy();
			}

			if ( window.hasEthnicity && elEthnic ) {
				elEthnic.destroy();
				elEthnic = null;
			}
		}

		if ( isType ) {
			// Reset active tabs
			$elTabList.children('li.active').removeClass('active');
			// Set active tab
			$elTabList.find('a[data-tab="' + viewName + '"]').parent('li').addClass('active');
			// Change perspective view name
			perspective[1] = viewName;

			if ( viewName === 'demand' || viewName === 'schools' ) {
				perspective[2] = 'candidates';
			}
		} else {
			// Change perspective view name
			perspective[0] = viewName;
		}

		$('#' + elChartWrap).addClass('loading').empty();

		if ( window.hasEthnicity ) {
			$('#' + elEthnicWrap).empty();
		}

		$elBreakdown.empty();

		// Initialize perspective view switch
		if ( window.hasAdvertsView ) {
			_initSwitch();
		}

		$.when(
			_getChartData()
		).then(function(charted) {
			if ( charted ) {
				setTimeout(function() {
					$('#' + elChartWrap).removeClass('loading');
				}, 300);
			}
		});
	}


	function _initSwitch(type) {
		var $opts = $elChartSwitch.find('span');
		$opts.removeClass('active');
		$opts.off('click');

		if ( perspective[1] !== 'demand' && perspective[1] !== 'schools' ) {
			$elChartSwitch.find('span[data-type="' + perspective[2] + '"]').addClass('active');
			$elChartSwitch.css('display', 'inline-block');

			$opts.on('click', function(e) {
				if ( $(this).hasClass('active') ) {
					return false;
				}

				var value = $(this).data('type');

				$opts.removeClass('active');
				$(this).addClass('active');

				_toggleSwitch(value);
			});
		} else {
			$elChartSwitch.css('display', 'none');
		}
	}


	function _toggleSwitch(type) {
		if ( perspective[0] === 'chart' ) {
			if ( elChart ) {
				elChart.destroy();
			}

			console.log('_toggleSwitch - has ethnicity: ', window.hasEthnicity);
			console.log('_toggleSwitch - ethnic container: ', elEthnic);

			if ( window.hasEthnicity && elEthnic ) {
				elEthnic.destroy();
				elEthnic = null;
			}
		}

		$('#' + elChartWrap).addClass('loading').empty();

		if ( window.hasEthnicity ) {
			$('#' + elEthnicWrap).empty();
		}

		$elBreakdown.empty();

		perspective[2] = type;

		$.when(
			_getChartData()
		).then(function(charted) {
			if ( charted ) {
				setTimeout(function() {
					$('#' + elChartWrap).removeClass('loading');
				}, 300);
			}
		});
	}



	/*
	 *  Private methods
	 */

	function _getBaseData(geoPoint, geoName, trigger) {
		var ctxReady = $.Deferred();

		console.log('_trigger: ', trigger);

		_geoPoint = geoPoint;
		_trigger = trigger;

		var tmpGeoArray = _geoPoint.split('/'),
			tmpGeoLen = tmpGeoArray.filter(function(val) {
				return (val !== 0 && val !== '0');
			}).length,
			tmpChildLen = tmpGeoLen - 1,
			tmpGeoName = (tmpGeoLen === 2) ? HF.utils.codeToName(tmpGeoArray[tmpChildLen]) : tmpGeoArray[tmpChildLen];

		if ( !tmpGeoLen ) {
			var tmpData = HF.results.list.getData('searchData'),
				tmpLocs = JSON.parse( tmpData.payload.locations ),
				isMulti = tmpLocs.length > 1,
				tmpArr = isMulti ? [0,0,0,0] : tmpData.geo,
				tmpLen = tmpArr.filter(function(val) {return (val !== 0 && val !== '0');}).length,
				tmpName = null;

			if ( !tmpLen ) {
				tmpGeoName = 'Multiple Locations';
			} else {
				tmpGeoName = (tmpLen === 2) ? HF.utils.codeToName(tmpArr[tmpLen - 1]) : tmpArr[tmpLen - 1];
			}
		}

		var tmpDisplayName = (!geoName || trigger === 'parent') ? tmpGeoName : geoName;

		console.log('_geoPoint: ', _geoPoint);
		console.log('tmpGeoArray: ', tmpGeoArray);
		console.log('tmpLen: ', tmpGeoLen);
		console.log('tmpChildLen: ', tmpChildLen);
		console.log('tmpGeoName: ', tmpGeoName);

		setTimeout(function() {
			ctxReady.resolve({location: tmpGeoName, locName: tmpDisplayName, tabItems: _configBase});
		}, 300);

		return ctxReady.promise();
	}

	function _getChartData() {
		var chartComplete = $.Deferred();

		console.log('Fetching data');

		$.when(
			_fetchPerspective()
		).then(function (data) {
			console.log('Perspective Data: ', data);
			if ( data ) {
				if ( !data.showCharts ) {
					return _errorMsg();
				} else {
					if ( perspective[0] === 'chart' ) {
						if ( perspective[1] === 'demand' ) {
							if ( window.hasEthnicity && _ethnic ) {
								$('#' + elEthnicWrap).css('display', 'block');
								_ethnicityChart(_ethnic);
							}

							return _combinedChart(data);
						} else {
							// Initialize perspective view switch
							if ( window.hasAdvertsView ) {
								_initSwitch();
							}

							return _simpleChart(data);
						}
					} else {
						if ( perspective[1] === 'demand' ) {
							return _demandList(data);
						} else {
							// Initialize perspective view switch
							if ( window.hasAdvertsView ) {
								_initSwitch();
							}

							return _simpleList(data);
						}
					}
				}
			} else {
				return _errorMsg();
			}
		}).then(function (chartReady) {
			chartComplete.resolve(chartReady);
		});

		return chartComplete.promise();
	}


	function _fetchPerspective() {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: _trigger, type: perspective[2], currency: searchData.cur, filters: searchData.payload.filters, view: perspective[0]},
			searchLocs = JSON.parse( searchData.payload.locations ),
			isMulti = searchLocs.length > 1,
			geoArray = _geoPoint.split('/'),
			tmpLen = geoArray.filter(function(val) {return (val !== 0 && val !== '0');}).length,
			geoLen = (tmpLen === 4 && geoArray[3] === 'micro') ? tmpLen - 1 : tmpLen,
			childLen = geoLen - 1,
			geoName = (geoLen === 2) ? HF.utils.codeToName(geoArray[childLen]) : geoArray[childLen],
			cachedLen = searchData.geo.filter(function(val) {return (val !== 0 && val !== '0');}).length,
			cachedTmp = (!cachedLen) ? HF.results.list.getCached('level1') : HF.results.list.getCached('level' + cachedLen),
			geoPath = (_trigger === 'child') ? _geoPoint : searchData.geo.join('/');

			console.log('Payload: ', payload);
			console.log('geoArray: ', geoArray);
			console.log('len: ', geoLen);
			console.log('childLen: ', childLen);
			console.log('geoName: ', geoName);

		if ( _trigger === 'child' ) {
			console.log('Child trigger');
			console.log('Temp cached regions: ', cachedTmp.regions);
			_gender = cachedTmp.regions[geoName.toLowerCase()].gender;
			_exp = cachedTmp.regions[geoName.toLowerCase()].explevel;
			_ethnic = cachedTmp.regions[geoName.toLowerCase()].demographic;
		} else {
			console.log('Overview trigger');
			console.log('Temp cached overview: ', cachedTmp.overview);
			_gender = cachedTmp.overview.gender;
			_exp = cachedTmp.overview.explevel;
			_ethnic = cachedTmp.overview.demographic;
		}

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/' + perspective[0] + '/search/' + geoPath + '/' + perspective[1],
			data: payload,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _showProjection(dataType, dataValue, dataDir) {
		var projectionData = null;
		var timeDir = ( !dataDir ) ? 'future' : dataDir;

		$.when(
			_fetchProjection(dataType, dataValue, timeDir)
		).then(function (data) {
			console.log('Data: ');
			console.log(data);

			if ( data ) {
				projectionData = data;
				return HF.views.addModule($elWrapDets, 'projection_details', {projectionType: dataType, projectionValue: dataValue});
			} else {
				return _errorMsg();
			}
		}).then(function(done) {
			if ( done ) {
				_treeDiagram(projectionData, timeDir);

				var $el = $('#' + elViewWrap);
				$el.addClass('details');

				_eventsDetailBind();

				setTimeout(function() {
					$el.removeClass('loading');
				}, 300);
			}
		});
	}


	function _updateProjection(dataType, dataValue, dataDir) {
		$elWrapDets.addClass('loading');
		elTree.destroy();
		$('#projection-wrap').empty();

		var projectionData = null;
		var timeDir = ( !dataDir ) ? 'future' : dataDir;

		$.when(
			_fetchProjection(dataType, dataValue, timeDir)
		).then(function (data) {
			console.log('Data: ');
			console.log(data);

			if ( data ) {
				projectionData = data;
				_treeDiagram(projectionData, timeDir);

				setTimeout(function() {
					$elWrapDets.removeClass('loading');
				}, 300);
			}
		});
	}


	function _treeDiagram(data, timeDir) {
		var treeDir = ( timeDir === 'future' ) ? 'WEST' : 'EAST';

		var collapseAll = function(jsonObj) {
			var len = jsonObj.children.length;

			for (var i = 0; i < len; i++) {
				jsonObj.children[i].collapsed = true;

				if (jsonObj.children[i].children) {
					collapseAll(jsonObj.children[i]);
				}
			}
		};

		collapseAll(data);

		var tree_structure = {
			chart: {
				container: "#projection-wrap",
				levelSeparation:    40,
				siblingSeparation:  20,
				subTeeSeparation:   20,
				rootOrientation: treeDir,
				node: {
					HTMLclass: "position",
					drawLineThrough: false,
					collapsable: true
				},
				connectors: {
					style: {
						"stroke-width": 2,
						"stroke": "#686868"
					}
				}
			},
			nodeStructure: data
		};

		elTree = new Treant( tree_structure );
	}


	function _fetchProjection(type, value, dir) {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: _trigger, timeDirection: dir, input: value},
			geoPath = searchData.geo.join('/');

		console.log('API URL: /horsefly/tree/project/' + geoPath + '/' + type);
		console.log('Payload: ', payload);

		return $.ajax({
			type: 'GET',
			url: pathApi + 'horsefly/tree/project/' + geoPath + '/' + type,
			data: payload,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _eventsDetailBind() {
		$elWrapDets.on('click', '.time-dir a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var type = $(this).data('type');
			var value = $(this).data('value');
			var time = $(this).data('dir');

			if ( time === 'past' ) {
				$(this).closest('.time-dir').removeClass('past').addClass('future');
			} else {
				$(this).closest('.time-dir').removeClass('future').addClass('past');
			}

			_updateProjection(type, value, time);
		});

		$elWrapDets.one('click', 'a.closepane', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).removeClass('details');

			setTimeout(function() {
				_eventsDetailUnbind();
			}, 500);
		});
	}


	function _eventsDetailUnbind() {
		$elWrapDets.off('click');
		elTree.destroy();
		elTree = null;
		$elWrapDets.empty();

		return true;
	}


	function _combinedChart(data) {
		var chartReady = $.Deferred();

		elChart = Highcharts.chart(elChartWrap, {
			chart: {
				events: {
					load: function () {
						if ( !$elBreakdown.find('div[class$="-breakdown"]').length ) {
							$.when(
								HF.views.addModule($elBreakdown, 'data_breakdown', {gender: _gender, exp: _exp})
							).then(function(genderReady) {
								chartReady.resolve(genderReady);
							});
						} else {
							chartReady.resolve(true);
						}
					}
				}
			},
			title: {
				text: '',
			},
			xAxis: {
				categories: data.xAxisObj
			},
			series: data.seriesObj,
			plotOptions: {
				series: {
					stacking: 'normal',
					borderColor: 'rgba(0,0,0,0)',
					borderWidth: 0,
					states: {
						inactive: {
							opacity: 1
						}
					}
				}
			},
			credits: {
				enabled: false
			},
			exporting: {
				enabled: true
			},
			navigation: {
				buttonOptions: {
					y: -6
				}
			},
			yAxis: [{
				labels: {
					style: {
						color: '#2196F3'
					}
				},
				title: {
					text: 'Candidates',
					style: {
						color: '#2196F3'
					}
				}
			}, {
				title: {
					enabled: true,
					text: 'Candidates per Role',
					style: {
						color: '#000008'
					}
				},
				labels: {
					style: {
						color: '#000008'
					}
				}
			}, {
				title: {
					enabled: true,
					text: 'Avg Salary',
					style: {
						color: '#3bb32b'
					}
				},
				labels: {
					style: {
						color: '#3bb32b'
					}
				},
				min: 0,
				opposite: true
			}],
			tooltip: {
				useHTML: true,
				shared: true,
				formatter: function() {
					var i = this.points.length - 1;
					var t = '<div class="chart-tooltip">';
					t += '<big>' + this.x + '</big>';
					if ( this.points[i].series.name === 'hideLabel' ) {
						t += '<br /><span style="background-color: #3bb32b;"></span>Avg Salary: ';
						t += '<b>sourcing</b>';
					} else {
						t += '<br /><span style="background-color:' + this.points[i].point.color + ';"></span>' + this.points[i].series.name + ': ';
						t += '<b>' + Highcharts.numberFormat(this.points[i].point.options.y, 0, ',', ' ') + '</b>';
					}
					t += '</div>';
					return t;
				}
			}
			/* Use this to show experience data in tooltip
			tooltip: {
				useHTML: true,
				shared: true,
				formatter: function() {
					var t = '<div class="chart-tooltip">';
					t += '<big>' + this.x + '</big>';

					this.points.forEach(function(el, index) {
						if ( el.series.name && el.series.name !== 'hideLabel' ) {
							t += '<br /><span style="background-color:' + el.point.color + ';"></span>' + el.series.name + ': ';
							t += '<b>' + Highcharts.numberFormat(el.point.options.y, 0, ',', ' ') + '</b>';
						}
					});

					t += '</div>';

					return t;
				}
			}
			*/
		});

		return chartReady.promise();
	}


	function _ethnicityChart(data) {
		var ethnicData = [];
		var ethnicityColor = {
			asian: '#04202c',
			black: '#00c4aa',
			east_or_southeast_asian: '#a18051',
			hispanic: '#4584c4',
			indigenous: '#4c9059',
			maori: '#eb5b30',
			mixed: '#f9a100',
			not_declared: '#cf4f9a',
			other: '#7996aa',
			white: '#765fbb'
		};

		for ( var key in data ) {
			if ( data.hasOwnProperty(key) ) {
				if ( key !== 'total' && data[key] ) {
					var formattedName = null;

					if ( key === 'east_or_southeast_asian' ) {
						formattedName = 'East or Southeast Asian';
					} else if ( key === 'not_declared' ) {
						formattedName = 'Not declared';
					} else {
						formattedName = key.charAt(0).toUpperCase() + key.slice(1);
					}

					var percent = data[key] * 100;
					var rounded = Math.round((percent + Number.EPSILON) * 100) / 100;
					ethnicData.push({name: formattedName, value: rounded, color: ethnicityColor[key]});
				}
			}
		}

		function maxFontSizeForWidth(text, width, i) {
			i = (typeof i === "undefined") ? 1 : i;

			if ( $('#sizeCalculator').length === 0 ) {
				mydiv = $('<div id="sizeCalculator" style="font-family: Arial;width: auto;font-size: ' + i + 'px;position: absolute;visibility: hidden;height: auto;white-space: nowrap;bottom: 0px;">' + text + '</div>');
				$('body').append(mydiv);
			} else {
				mydiv = $($('#sizeCalculator')[0]);
				mydiv.html(text);
				mydiv.css('font-size', i + 'px');
			}

			calculatedWidth = mydiv[0].clientWidth;

			if (calculatedWidth > width) {
				return i - 1;
			} else {
				i++;
				return maxFontSizeForWidth(text, width, i);
			}
		}

		function textWithAdaptiveSize(point) {
			var maxFontSize = 28,
				minFontSize = 12,
				labelMaxHeight = point.shapeArgs.height - 20,
				labelMaxWidth = point.shapeArgs.width - 30,
				textMaxWidth = maxFontSizeForWidth(point.value, labelMaxWidth);

			iFontSize = Math.min(maxFontSize, textMaxWidth);

			if ( iFontSize > minFontSize ) {
				return '<div class="tree-label"><span class="value" style="font-size:' + iFontSize + 'px;">' + point.value + '%</span><span>' + point.name + '</span></div>';
			} else {
				return '';
			}
		}

		elEthnic = Highcharts.chart(elEthnicWrap, {
			title: {
				text: 'Ethnicity Breakdown',
				style: {
					fontSize: '16px'
				}
			},
			accessibility: {
				point: {
					valueSuffix: '%'
				}
			},
			tooltip: {
				pointFormat: '{point.name}: <b>{point.value:.2f}%</b>'
			},
			plotOptions: {
				series: {
					animation: false
				},
				treemap: {
					allowPointSelect: true,
					cursor: 'pointer'
				}
			},
			series: [{
				type: 'treemap',
				layoutAlgorithm: 'squarified',
				data: ethnicData,
				dataLabels: {
					enabled: true,
					useHTML: true,
					allowOverlap: false,
					formatter: function() {
						return textWithAdaptiveSize(this.point);
					}
				},
				legendType: 'point',
				showInLegend: true
			}],
			credits: {
				enabled: false
			},
			exporting: {
				enabled: true
			},
			navigation: {
				buttonOptions: {
					y: -6
				}
			}
		});
	}

	function _simpleChart(data) {
		var chartReady = $.Deferred();

		elChart = Highcharts.chart(elChartWrap, {
			chart: {
				type: 'bar',
				inverted: false,
				events: {
					load: function () {
						chartReady.resolve(true);
					}
				}
			},
			title: {
				text: '',
			},
			xAxis: {
				categories: data.xAxisObj
			},
			series: data.seriesObj,
			plotOptions: {
				series: {
					stacking: 'normal',
					borderColor: 'rgba(0,0,0,0)',
					borderWidth: 0,
					states: {
						inactive: {
							opacity: 1
						}
					}
				}
			},
			credits: {
				enabled: false
			},
			exporting: {
				enabled: true
			},
			navigation: {
				buttonOptions: {
					y: -6
				}
			},
			yAxis: [{
				labels: {
					style: {
						color: '#000008'
					},
					enabled: false
				},
				title: {
					text: 'Frequency',
					style: {
						color: '#000008'
					}
				}
			}],
			tooltip: {
				useHTML: true,
				formatter: function () {
					return '<b> ' + this.x + '</b>';
				},
				shared: true
			}
		});

		return chartReady.promise();
	}


	function _demandList(data) {
		var listReady = $.Deferred(),
			regions = data.regions;

		$('#' + elChartWrap)
			.html('<ul id="demand-list" class="data-list"><li class="head">' +
				'<span class="name">Region Name</span>' +
				'<span class="ratio">Candidates<br />per Role</span>' +
				'<span class="gender">Gender<br />Split</span>' +
				'<span class="exp">Experience<br />Split</span>' +
				'<span class="count">Total<br />Candidates</span>' +
				'<span class="count">Total<br />Adverts</span>' +
				'</li></ul>');

		if (regions) {
			for (var i in regions) {
				var region = regions[i],
					gen = (region.genderCounts) ? [region.genderCounts.male, region.genderCounts.female] : [0, 0],
					exp = (region.experienceCounts) ? region.experienceCounts : [0, 0, 0],
					// genTotal = region.originalCandidatesCount,
					genTotal = gen[0] + gen[1],
					expTotal = exp[0] + exp[1] + exp[2],
					rat = ( !region.regionDifficultyRatio ) ? 'n/a' : region.regionDifficultyRatio,
					$list = $('<li />'),
					adverts = (!region.advertsCount) ? 0 : HF.utils.addCommas(region.advertsCount);

				$list.html(
					'<span class="name">' + i + '</span>' +
					'<span class="ratio">' + rat + '</span>' +
					'<span class="gender">Male: ' + HF.utils.toPercent(gen[0], genTotal, 0, false, true) +
					'<br />Female: ' + HF.utils.toPercent(gen[1], genTotal, 0, false, true) + '</span>' +
					'<span class="exp">0-3 y: ' + HF.utils.toPercent(exp[0], expTotal, 0) +
					'<br />4-7 y: ' + HF.utils.toPercent(exp[1], expTotal, 0) +
					'<br />8+ y: ' + HF.utils.toPercent(exp[2], expTotal, 0) + '</span>' +
					'<span class="count">' + HF.utils.addCommas(region.candidatesCount) + '</span>' +
					'<span class="count">' + adverts + '</span>');

				$('#demand-list').append($list);
			}
		}

		listReady.resolve(true);
		return listReady.promise();
	}


	function _simpleList(data) {
		console.log('simple list data: ', data);

		var noDups = data.perspectiveClustersList.filter(function(item, index, self) {
			return index === self.findIndex(function(i) {
				return i.itemTitle === item.itemTitle;
			});
		});

		console.log('simple list filtered data: ', noDups);

		var listReady = $.Deferred(),
			listTitle,
			isProjectable = ( window.hasTree && ( perspective[1] === 'jobTitles' || perspective[1] === 'companies' ) );

		if ( perspective[1] === 'schools' ) {listTitle = 'School Name';}
		else if ( perspective[1] === 'jobTitles' ) {listTitle = 'Job Title';}
		else if ( perspective[1] === 'companies' ) {listTitle = 'Company Name';}
		else if ( perspective[1] === 'hardSkills' ) {listTitle = 'Keyword';}

		$('#' + elChartWrap)
			.html('<ul id="perspective-list" class="data-list"><li class="head">' +
				'<span class="title">' + listTitle + '</span>' +
				'<span class="gender">Male</span>' +
				'<span class="gender">Female</span>' +
				'</li></ul>');

		$.each(noDups, function (i, item) {
			var gen = (item.genderCounts) ? [item.genderCounts.male, item.genderCounts.female] : [0, 0],
				// genTotal = item.totalCandidatesCount,
				genTotal = gen[0] + gen[1],
				$list = $('<li />'),
				male = ( !genTotal || isNaN(gen[0]) ) ? 'n/a' : HF.utils.toPercent(gen[0], genTotal, 0, false, true),
				female = ( !genTotal || isNaN(gen[1]) ) ? 'n/a' : HF.utils.toPercent(gen[1], genTotal, 0, false, true);

			if ( isProjectable ) {
				$list.html(
					'<span class="title">' + item.itemTitle +
					'<small><a href="#" data-type= "' + perspective[1] + '" data-value="' + item.itemTitle + '" class="projections is-tooltip">' +
					'<i class="material-icons">device_hub</i><p class="lft">Projections</p></a></small></span>' +
					'<span class="gender">' + male + '</span>' +
					'<span class="gender">' + female + '</span>');
			} else {
				$list.html(
					'<span class="title">' + item.itemTitle + '</span>' +
					'<span class="gender">' + male + '</span>' +
					'<span class="gender">' + female + '</span>');
			}

			$('#perspective-list').append($list);
		});

		listReady.resolve(true);
		return listReady.promise();
	}


	function _errorMsg() {
		var errorReady = $.Deferred();

		$('#' + elChartWrap)
			.html('<div class="msg-box">' +
				'<p>Data is sparse here, so it is difficult to produce accurate insights.</p>' +
				'<p>Check back soon for updates.</p></div>');

		errorReady.resolve(true);
		return errorReady.promise();
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
HF.profiles = (function () {

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
			$el.removeClass('profiles');

			setTimeout(function() {
				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;
			}, 500);
		});

		elPostItem.on('click', 'a.profile-title', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#' + elViewWrap).addClass('loading');
			var profileId = $(this).data('profile');

			_showProfile(profileId);
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
		console.groupCollapsed('Init details view | profiles');

		elViewWrap	= el;
		elWrapMain	= $('#ext-wrap');
		elWrapDets	= $('#ext-details');
		elPostList	= $('#profiles-list');
		elPostItem	= elPostList.children('.profile-item');

		$.when(
			_eventsBind()
		).then(function(binded) {
			if (binded) {
				$('#' + elViewWrap).addClass('profiles');
				console.groupEnd();

				setTimeout(function() {
					$('#' + elViewWrap).removeClass('loading');
				}, 300);
			}
		});
	}


	function getData(geoPoint, trigger) {
		return _getContext(geoPoint, trigger);
	}


	function unload() {
		var isUnload = $.Deferred();

		console.log('Unload details view');

		var $el = $('#' + elViewWrap);
		$el.removeClass('profiles');

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

	function _getContext(geoPoint, trigger) {
		var ctxReady = $.Deferred();

		console.log('Fetching data');

		$.when(
			_fetchProfiles(geoPoint, trigger)
		).then(function (data) {
			ctxReady.resolve({location: geoPoint, profiles: data});
		});

		return ctxReady.promise();
	}


	function _fetchProfiles(geoPoint, trigger) {
		var searchData = $.extend(true, {}, HF.results.list.getData('searchData')),
			searchID = HF.results.list.getData('searchId'),
			payload = {searchId: searchID, trigger: trigger, currency: searchData.cur, filters: searchData.payload.filters},
			len = searchData.geo.filter(function(val) {return (val !== 0);}).length;

		if ( trigger === 'child' ) {
			var childLen = (len > 3) ? len - 1 : len;
			searchData.geo[childLen] = geoPoint;
		}

 		var geoPath = searchData.geo.join('/');

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/list/search/' + geoPath + '/candidates',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data);

				console.log('Parsed: ', parsed);

				if ( !$.isEmptyObject(parsed) ) {
					parsed = parsed.candidates.map(function(item) {
						return {name: item.name, email: item.email, city: item.city, position: item.currentPositionName, company: item.currentCompanyName, skills: item.skills};
					});
				}

				return JSON.stringify(parsed);
			},
			success: function (profiles) {
				return profiles;
			}
		});
	}


	function _fetchById(id) {
		var payload = {profileId: id},
			currency = HF.results.list.getData('searchData', 'cur');

		return $.ajax({
			type: 'POST',
			url: pathApi + '/candidate',
			data: payload,
			dataType: 'json',
			crossDomain: true,
			dataFilter: function (data) {
				var parsed = JSON.parse(data),
					profile;

				if ( !$.isEmptyObject(parsed) ) {
					profile = {name: parsed.name, email: parsed.email, city: parsed.city, position: parsed.currentPositionName, skils: parsed.skills};
				}

				return JSON.stringify(profile);
			},
			success: function (profile) {
				return profile;
			}
		});
	}


	function _showProfile(id) {
		$.when(
			_fetchById(id)
		).then(function(profile) {
			if ( profile ) {
				return HF.views.addModule(elWrapDets, 'profile_details', profile);
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
HF.wammee = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, elWrapMain, elForm, elEditor, elSendBtn;



	/*
	 *  Private cached data and defaults
	 */

	var ddList = {};



	/*
	 *  Events
	 */

	//  Bind
	function _eventsBind() {
		elWrapMain.on('click', 'a.backbtn', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_eventsUnbind();
			var $el = $('#' + elViewWrap);
			$el.removeClass('wammee');

			setTimeout(function() {
				tinymce.remove('textarea#description');

				$el.addClass('on-back').empty();
				elViewWrap = null;
				extNow.length = 0;
			}, 500);
		});

		elForm.on('change', 'input[name="applicationType"]', function () {
			var checkedValue = $('input[name=applicationType]:checked').val();

			if ( checkedValue === '0' ) {
				$('#atsURL').prop('disabled', true);

				$('#atsURL')
					.next('span')
					.attr('class', 'initial')
					.empty();

				$('#atsEmail').prop('disabled', false);
			} else {
				$('#atsEmail').prop('disabled', true);

				$('#atsEmail')
					.next('span')
					.attr('class', 'initial')
					.empty();

				$('#atsURL').prop('disabled', false);
			}
		});

		elSendBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			}

			_validateForm();
		});

		elForm.on('keyup', 'input', _debounce(function() {
			var name = $(this).attr('id'),
				val = $(this).val();

			_validate(name, val);
		}, 600));

		console.log('Events successfully binded');

		return true;
	}


	// Unbind
	function _eventsUnbind() {
		_destroySelects();

		elWrapMain.off('click');
		elForm.off('change', 'input[name="applicationType"]');
		elForm.off('keyup', 'input');
		elSendBtn.off('click');

		elWrapMain = null;
		elForm = null;
		elSendBtn = null;

		console.log('Events successfully unbinded');

		return true;
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init details view | wammee');

		_createSelects();

		errorCount = 0;
		elViewWrap	= el;
		elWrapMain	= $('#ext-wrap');
		elForm = $('#form-campaign-preview');
		elSendBtn = $('#campaign-apply-btn');

		$.when(
			_eventsBind()
		).then(function(binded) {
			return _initEditor();
		}).then(function(ready) {
			if (ready) {
				$('#' + elViewWrap).addClass('wammee');
				console.groupEnd();

				setTimeout(function() {
					$('#' + elViewWrap).removeClass('loading');
				}, 300);
			}
		});
	}


	function getData(geoPoint, trigger) {
		var geoData = HF.results.list.getData('searchData', 'geo'),
			context = {
				searchId: HF.results.list.getData('searchId'),
				country: geoData[1],
				candidates: HF.results.list.getData('wammeeCount'),
				credits: Math.ceil(HF.results.list.getData('wammeeCount') / 5000)
			};

		return context;
	}


	function unload() {
		var isUnload = $.Deferred();

		console.log('Unload details view');

		var $el = $('#' + elViewWrap);
		$el.removeClass('wammee');

		$.when(
			_eventsUnbind()
		).then(function(unbinded) {
			if (unbinded) {
				tinymce.remove('textarea#description');

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

	function _initEditor() {
		var isRender = $.Deferred();

		tinymce.init({
			selector: 'textarea#description',
			resize: false,
			height: 180,
			max_height: 500,
			menubar: false,
			plugins: 'paste',
			toolbar: 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | paste',
			paste_as_text: true,
			paste_convert_word_fake_lists: true,
			paste_word_valid_elements: "b,strong,i,em,u,ul,ol,li",
			branding: false,
			init_instance_callback : function(editor) {
				isRender.resolve(true);
				console.log('Editor: ' + editor.id + ' initialized');
			}
		});

		return isRender.promise();
	}


	function _debounce(func, wait, immediate) {
		var timeout;

		return function() {
			var context = this,
				args = arguments;

			var later = function() {
				timeout = null;

				if (!immediate) {
					func.apply(context, args);
				}
			};

			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	}


	function _validate(id, val) {
		console.log('Name: ', id);
		console.log('Value: ', val);
		var $this = $('#' + id);

		if (id === 'wammee_title') {
			if ( !val ) {
				_setError($this, 'Position name is empty');
			} else {
				$this.next('span').attr('class', 'valid').empty();
			}
		}

		if (id === 'wammee_salary') {
			if ( !val ) {
				_setError($this, 'Salary is empty');
			} else {
				$this.next('span').attr('class', 'valid').empty();
			}
		}

		if (id === 'atsEmail') {
			var regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			if ( !val ) {
				_setError($this, 'Application method is empty');
			} else if ( !regEmail.test(val) ) {
				_setError($this, 'Email address format is invalid');
			} else {
				$this.next('span').attr('class', 'valid').empty();
			}
		}

		if (id === 'atsURL') {
			var regUrl = /^((https?:\/\/)?([^\s\W][\w\-]{1,}\.){0,2}([\w]{2,})(\.[\w]{2,14})?(\.[\w]{2,14}\/?)([\w\?\=\.\#\!\@\&\-\/]{2,}[^\.\s\,])*)$/;

			if ( !val ) {
				_setError($this, 'Application method is empty');
			} else if ( !regUrl.test(val) ) {
				_setError($this, 'URL format is invalid');
			} else {
				$this.next('span').attr('class', 'valid').empty();
			}
		}

		elSendBtn.toggleClass('disabled', elForm.find('span.valid').length < 3);
	}


	function _validateForm() {
		$.when(
			_validateDescription()
		).then(function(valid) {
			if (valid && elForm.find('span.valid').length === 4) {
				elForm.submit();
			}
		});
	}


	function _validateDescription() {
		// update underlying textarea before submit validation
		tinymce.EditorManager.triggerSave();
		var $this = $('#description'),
			isValid;

		if ( !$this.val() ) {
			_setError($this, 'Description is empty');
			isValid = false;
		} else {
			$this.next('span')
				.attr('class', 'valid')
				.empty();
			isValid = true;
		}

		return isValid;
	}


	function _setError($this, msg) {
		if ( $this.next('span').hasClass('error') ) {
			$this.next('span').text(msg);
		} else {
			$this.next('span')
				.attr('class', 'error')
				.text(msg);
		}
	}


	function _createSelects() {
		var allSelects = ['hireType', 'hours'];

		allSelects.forEach(function(itemSel) {
			$('#' + itemSel).selectize({
				disableDelete: true,
				onInitialize: function() {
					ddList[itemSel] = $(this)[0];
				}
			});
		});
	}


	function _destroySelects() {
		console.groupCollapsed('Resolve destroying selects');
		var isDestroyed = $.Deferred();

		if ( !HF.utils.isEmptyObj(ddList) ) {
			console.log('Selects object ready');
			console.groupCollapsed('Destroy all');

			for (var key in ddList) {
				if ( ddList.hasOwnProperty(key) ) {
					console.log('Destroying select | ' + key);

					// Destroy selectize;
					ddList[key].destroy();
					// Remove instance from group object
					delete ddList[key];
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



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		unload: unload
	};
})();
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
HF.results.list = (function () {

	/*
	 *  Constants
	 */

	var apiListSearch = pathApi + 'horsefly/list/search/';



	/*
	 *  Cached DOM elements
	 */

	var elViewWrap, elItem, elList, elGeoItem, elCardItem, elGeoList, elSalaryOpt;



	/*
	 *  Private cached data
	 */

	var _config = {
			searchId: 0,
			wammeeCount: 0,
			locations: 0,
			searchData: {}
		};

	var _cached = {};

	var _tempMax = 0;



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('searchSetup', function(searchObj) {
		_config.searchData = searchObj;

		// Get locations from payload
		var locs = JSON.parse(_config.searchData.payload.locations);
		// Reset geo obj key if just 1 location is found
		_config.searchData.geo = ( locs.length === 1 ) ? [locs[0].subContinent, locs[0].country, locs[0].region, locs[0].city] : [0,0,0,0];
		_config.locations = locs.length;
		// Get current geo position level
		var level = _getLevel();
		// Set results view with current level
		HF.views.set('results', 'level' + level, 'key');
	});

	events.on('mapDrilled', function(data) {
		// Get clicked location name
		var geoName = data[0];
		var geoArray = data[1].split('/');
		var level = geoArray.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;

		_config.searchData.geo = geoArray;
		// Set results view with next level
		HF.views.set('results', 'level' + level, elViewWrap);
	});


	// Bind
	function _eventsBind() {
		elItem.on('click', 'a.backbtn', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var target = $(this).data('target');

			if (extNow.length > 0) {
				var prevView = extNow[0];
				HF[prevView].unload();
			}

			if ( target === 'results' ) {
				// Going back => Get previous level (current - 1)
				var levelTarget = 0;
				var levelCurrent = _getLevel();

				if ( levelCurrent === 4 ) {
					// If this is a microregion result
					if ( _config.searchData.geo[3] === 'micro' ) {
						// Set previous target level
						levelTarget = levelCurrent - 3;
						// Reset previous geo position
						_config.searchData.geo = [0, 0, 0, 0];
					} else {
						// Set previous target level
						levelTarget = levelCurrent - 1;
						// Reset previous geo position
						_config.searchData.geo[levelTarget] = 0;
					}
				} else {
					// Set previous target level
					levelTarget = levelCurrent - 1;
					// Reset previous geo position
					_config.searchData.geo[levelTarget] = 0;
				}

				// Set results view with previous level
				HF.views.set('results', 'level' + levelTarget, elViewWrap);
			}

			if ( target === 'search' ) {
				events.emit('cleanMap');
				HF.views.set('search', 'build');
			}
		});

		elItem.on('click', 'a.toggle-map', function(e) {
			e.preventDefault();
			e.stopPropagation();

			$('#alt').addClass('showing');
		});

		elGeoItem.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var parentLi = $(this).parent(),
				parentUl = parentLi.parent(),
				viewType = parentLi.attr('class'),
				geoPoint = parentUl.data('geopoint'),
				geoName = parentUl.data('geoname');

			console.log('GeoItem clicked: ', viewType);

			HF.views.setDetails(viewType, geoPoint, geoName, 'parent', 'ext');
		});

		elCardItem.on('click', 'a.geopoint', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var geoName = $(this).text();
			var geoPath = $(this).next('ul').data('geopoint');
			var geoArray = geoPath.split('/');
			// Going forth => Get next level (current + 1)
			// var level = _getLevel() + 1;
			var level = geoArray.filter(function(val) {
				return (val !== 0 && val !== '0');
			}).length;

			// Set current geo position with clicked name
			_config.searchData.geo = geoArray;
			// Set results view with next level
			HF.views.set('results', 'level' + level, elViewWrap);
		});

		elCardItem.on('click', 'small.help', function(e) {
			HF.views.modal({modalurl: 'sourcing', bgclose: false, isinfo: true});
		});

		elGeoList.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var parentLi = $(this).parent(),
				parentUl = parentLi.parent(),
				// Trigger profiles panel
				// viewType = (parentLi.attr('class') === 'candidates') ? 'profiles' : parentLi.attr('class'),
				viewType = parentLi.attr('class'),
				geoPoint = parentUl.data('geopoint'),
				geoName = parentUl.data('geoname');

			console.log('GeoList clicked: ', viewType);

			HF.views.setDetails(viewType, geoPoint, geoName, 'child', 'ext');
		});

		elSalaryOpt.on('change', function(e) {
			var isChecked = this.checked;

			$('#base-contents').toggleClass('show-rate', isChecked);
		});

		if ( $('#base-contents').hasClass('show-rate') ) {
			elSalaryOpt.prop('checked', true);
		}

		console.log('Events successfully binded');

		return true;
	}


	// Unbind
	function _eventsUnbind() {
		elItem.off('click');
		elGeoItem.off('click');
		elCardItem.off('click');
		elGeoList.off('click');
		elSalaryOpt.off('change');

		elViewWrap = null;
		elItem = null;
		elList = null;
		elGeoItem = null;
		elCardItem = null;
		elGeoList = null;
		elSalaryOpt = null;

		console.log('Events successfully unbinded');
	}



	/*
	 *  Public methods
	 */

	function init(el) {
		console.groupCollapsed('Init content view | results level');

		elViewWrap = el;

		elItem = $('#' + el).find('#result-item');
		elList = $('#' + el).find('#result-list');

		elGeoItem = elItem.find('li > a');

		elCardItem = elList.find('.card-item');
		elGeoList = elCardItem.find('li > a');

		elSalaryOpt = $('#switch');

		$.when(
			HF.dropdownList.init('nav-wrapper', 'searchOpt'),
			_eventsBind()
		).then(function(added, binded) {
			if ( added, binded ) {
				events.emit('doneLoading', elViewWrap);
				console.groupEnd();
			}
		});
	}


	function getData(type, subtype) {
		if (!type) {
			return _getContext();
		} else {
			return (!subtype) ? _config[type] : _config[type][subtype];
		}
	}


	function unload(type) {
		var isUnload = $.Deferred();

		console.log('Unload view');

		_eventsUnbind();

		$.when(
			HF.dropdownList.unload('nav-wrapper'),
			_resolveCacheClean(type)
		).then(function(unloaded, cleaned) {
			if (unloaded && cleaned) {
				if (type === 'all') {
					_config.searchId = 0;
					_config.wammeeCount = 0;

					for (var key in _config.searchData) {
						if ( _config.searchData.hasOwnProperty(key)) {
							delete _config.searchData[key];
						}
					}

					isUnload.resolve(true);
				} else {
					isUnload.resolve(true);
				}
			}
		});

		return isUnload.promise();
	}



	/*
	 *  Private methods
	 */

	function _getContext() {
		var ctxReady = $.Deferred();
		_tempMax = 0;

		$.when(
			_fetchResults()
		).then(function (data) {
			ctxReady.resolve(data);
		});

		return ctxReady.promise();
	}


	// Get Geo Level Name
	function _getGeoData(geoArray) {
		var searchData = (!geoArray) ? _config.searchData.geo : geoArray,
			len = searchData.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;

		console.log('_getGeoData | searchData : ', searchData);
		console.log('_getGeoData | len : ', len);

		var name, code;

		if ( len === 0 ) {
			// Always use level 1 as minimum
			name = 'Worldwide';
			code = 'world';
			len = 1;
		} else if ( len === 2 ) {
			code = searchData[len - 1];
			name = HF.utils.codeToName( code );
		} else if ( len === 3 && searchData[len - 1] === 'all') {
			code = searchData[len - 2];
			name = HF.utils.codeToName( code );
		} else {
			code = searchData[len - 1];
			name = HF.utils.capAll( code );
		}

		return [len, name, code];
	}


	function _fetchResults() {
		console.log('Fetching Results: ', _config.searchData.payload);
		var isFirst = ( _config.searchId ) ? false : true,
			geoJson = [{subContinent: _config.searchData.geo[0], country: _config.searchData.geo[1], region: _config.searchData.geo[2], city: _config.searchData.geo[3], locationId: 0, radius: ""}],
			geoPath = ( isFirst ) ? _config.searchData.payload.locations : JSON.stringify(geoJson),
			geoCur  = _config.searchData.cur,
			payload = ( isFirst ) ? _config.searchData.payload : {searchId: _config.searchId, tags: _config.searchData.payload.tags, locations: geoPath, currency: geoCur, filters: _config.searchData.payload.filters, token: 'xtempx'},
			geoData = _getGeoData(),
			geoLevel = 'level' + geoData[0],
			geoName = _config.locations > 1 ? null : geoData[1];

		console.log('_fetchResults | geoData : ', geoData);
		console.log('_fetchResults | geoLevel : ', geoLevel);

		if ( !HF.utils.isEmptyObj(geoLevel) && _cached.hasOwnProperty(geoLevel) ) {
			console.log('Cached data found -> Reusing');
			events.emit('resultsReady', geoLevel);
			return _cached[geoLevel];
		} else {
			console.log('No cached data found -> Fetching');

			return $.ajax({
				type: 'POST',
				url: apiListSearch + 'demand',
				data: payload,
				dataType: 'json',
				crossDomain: true,
				dataFilter: function (data) {
					console.log('Data: ', data);
					var parsed = JSON.parse(data);

					if ( !HF.utils.isEmptyObj(parsed) ) {
						if ( isFirst ) {
							_config.searchId = parsed.searchId;
							_config.wammeeCount = parsed.wammeeCandidatesCount;
						}

						if ( parsed.multiCountry ) {
							if ( parsed.countryCount > 1 ) {
								geoName = 'Multiple Locations';
							} else {
								geoName = HF.utils.codeToName(parsed.countryCollection[0]);
							}
						}

						// Create new key and contents in cached global object
						_cached[geoLevel] = {
							overview: {},
							regions: {},
							maxTotal: 0
						};

						var regions = parsed.regions;

						for (var key in regions) {
							if ( regions.hasOwnProperty(key) ) {
								if ( !geoName ) {
									var tmpGeoArray = regions[key].originalLocation.geoPath.split('/');
									var tmpGeoTemp = _getGeoData(tmpGeoArray);
									geoName = tmpGeoTemp[1];
								}

								var regionOpt = (regions[key].focusLevel === 'city') ? 'deepest' : 'goDeep';

								if ( key.indexOf(' Plus ') > -1 ) {
									console.log('Result with radius');
									var tmpKey = regions[key].regionName;
									_cached[geoLevel].regions[tmpKey] = _mapResults(key, regions[key], geoCur, regionOpt, true);
								} else {
									_cached[geoLevel].regions[key] = _mapResults(key, regions[key], geoCur, regionOpt, false);
								}
							}
						}

						delete parsed.regions;

						// var overviewOpt	= ( isFirst ) ? 'isFirst' : _cached['level' + (geoData[0] - 1)].overview.location,
						var overviewOpt	= ( isFirst ) ? 'isFirst' : 'subsequent',
							geoFormated	= ( isFirst && _config.searchData.rad )
							? geoName + ' (' + _config.searchData.rad + ' mi. radius)'
							: geoName;

						_cached[geoLevel].overview = _mapResults(geoFormated, parsed, geoCur, overviewOpt, false);
					}

					_cached[geoLevel].maxTotal = _tempMax;

					events.emit('resultsReady', geoLevel);
					return JSON.stringify(_cached[geoLevel]);
				},
				success: function (results) {
					return results;
				}
			});
		}
	}


	function _mapResults(key, data, cur, opts, isMicroRegion) {
		var isOverview = ( opts === 'goDeep' || opts === 'deepest' ) ? false : true;
		var locId = (!isOverview) ? data.locationId : data.parentLocationId;
		var locPath = null;
		var salMax = (!isOverview) ? data.maxSalary : data.totalMaxSalary;
		var raw = (!isOverview) ? data.originalCandidatesCount : data.originalTotalCandidatesCount;
		var gen = (!isOverview) ? data.genderCounts : data.totalGenderCounts;
		var job = (!isOverview) ? data.advertsCount : data.totalAdvertsCount;
		var exp = (!isOverview) ? data.experienceCounts : data.totalExperienceCounts;
		var dem = null;
		_tempMax = (salMax > _tempMax) ? salMax : _tempMax;

		if ( !isOverview ) {
			if ( data.focusLevel === 'region' ) {
				var microPrefix = isMicroRegion ? 'micro' : 0;
				locPath = data.originalLocation.subContinent + '/' + data.originalLocation.country + '/' + data.regionName  + '/' + microPrefix;
			} else if ( data.focusLevel === 'city' ) {
				var dataLoc = data.originalLocation;
				var dataRegion = ( dataLoc.region === '0' ) ? 'all' : dataLoc.region;
				locPath = dataLoc.subContinent + '/' + dataLoc.country + '/' + dataRegion  + '/' + data.cityName;
			} else {
				locPath = data.originalLocation.geoPath;
			}

			if ( data.demographic !== undefined && data.demographic ) {
				dem = data.demographic;
			}
		} else {
			locPath = '0/0/0/0';

			if ( data.totalEthnicityBreakDown !== undefined && data.totalEthnicityBreakDown ) {
				dem = data.totalEthnicityBreakDown;
			}
		}

		return {
			candidates: (!isOverview) ? data.candidatesCount : data.totalCandidatesCount,
			currency: cur,
			explevel: [exp['0'], exp['1'], exp['2'], (exp['0'] + exp['1'] + exp['2'])],
			gender: (!gen) ? [0, 0, 0] : [gen.female, gen.male, (gen.female + gen.male)],
			demographic: dem,
			locationId: (!locId) ? key.replace(/\s/g,'').toLowerCase() : locId,
			jobposts: (!job) ? 0 : job,
			levelOpts: opts,
			location: key,
			locationPath: locPath,
			mapType: (!isOverview) ? [data.lon, data.lat] : data.mapType,
			salary: {
				min: (!isOverview) ? data.minSalary : data.totalMinSalary,
				avg: (!isOverview) ? data.avgSalary : data.totalAvgSalary,
				max: (!isOverview) ? data.maxSalary : data.totalMaxSalary
			},
			rate: {
				min: (!isOverview) ? dailyRate(data.minSalary) : dailyRate(data.totalMinSalary),
				avg: (!isOverview) ? dailyRate(data.avgSalary) : dailyRate(data.totalAvgSalary),
				max: (!isOverview) ? dailyRate(data.maxSalary) : dailyRate(data.totalMaxSalary)
			}
		};
	}

	function dailyRate(salary) {
		if ( window.rateEnabled ) {
			//return Math.round(0.0087 + (0.005 * salary));
			return Math.round(65 + (0.0095 * salary));
		} else {
			return 0;
		}
	}

	function _getLevel() {
		// Return length of values that are not 0
		var len = _config.searchData.geo.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;

		return parseInt(len);
	}


	function getCached( objKey ) {
		if ( !objKey ) {
			return _cached;
		} else {
			return _cached[objKey];
		}
	}


	function _resolveCacheClean(type) {
		var isClean = $.Deferred();

		if ( type && type === 'all') {
				isClean.resolve( cleanCached() );
		} else if ( type && type !== 'all' ) {
			if ( Object.keys(_cached).length > 1 && _cached.hasOwnProperty(type) ) {
				isClean.resolve( cleanCached(type) );
			} else {
				isClean.resolve(true);
			}
		} else {
			isClean.resolve(true);
		}

		return isClean.promise();
	}


	function cleanCached( objKey ) {
		var isClean = $.Deferred();

		if ( !objKey ) {
			for (var key in _cached) {
				if ( _cached.hasOwnProperty(key)) {
					delete _cached[key];
				}
			}
			isClean.resolve(true);
		} else {
			if ( _cached.hasOwnProperty(objKey)) {
				delete _cached[objKey];
			}
			isClean.resolve(true);
		}

		return isClean.promise();
	}


	function _addSearchOption(elID, ddlName) {
		var ddlAdded = $.Deferred();

		$.when(
			HF.dropdownList.init(elID, ddlName)
		).then(function (done) {
			if (done) {
				ddlAdded.resolve(done);
			}
		});

		return ddlAdded.promise();
	}



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		getData: getData,
		getCached: getCached,
		cleanCached: cleanCached,
		unload: unload
	};
})();
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
HF.tags = (function () {

	/*
	 *  Constants
	 */

	var apiKeywords = pathApi + 'suggestions/keywords?keyword=',
		apiSuggests = pathApi + 'suggestions/nearKeywords',
		noiseWords = ['a', 'about', 'after', 'all', 'also', 'an', 'another', 'any', 'are', 'as', 'and', 'at', 'be', 'because', 'been', 'before', 'being', 'between', 'but', 'both', 'by', 'came', 'can', 'come', 'could', 'did', 'do', 'each', 'even', 'for', 'from', 'further', 'furthermore', 'get', 'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'hi', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'indeed', 'just', 'like', 'made', 'many', 'me', 'might', 'more', 'moreover', 'most', 'much', 'must', 'my', 'never', 'not', 'now', 'of', 'on', 'only', 'other', 'our', 'out', 'or', 'over', 'said', 'same', 'see', 'should', 'since', 'she', 'some', 'still', 'such', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'therefore', 'they', 'this', 'those', 'through', 'to', 'too', 'thus', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'will', 'with', 'would'],
		listTags = {};



	/*
	 *  Cached DOM elements
	 */

	var $mainWrap;



	/*
	 *  Public methods
	 */

	function addGroup(elWrap, groupID, data) {
		console.groupCollapsed('Tag group => Adding new');
		var isReady	= $.Deferred(),
			$elWrap	= $('#' + elWrap);

		if ( !$mainWrap ) {
			$mainWrap = $elWrap;
		}

		$.when(
			HF.views.addModule($elWrap, 'tag_group', {groupId: groupID})
		).then(function (rendered) {
			if (rendered) {
				return _createTags(groupID, data);
			}
		}).then(function(created) {
			if (created) {
				return _eventsBind('tag-group-' + groupID);
			}
		}).then(function(binded) {
			if (!data) {
				_canExclude();
			}

			isReady.resolve(binded);
			console.groupEnd();
		});

		return isReady.promise();
	}


	function setGroups(elWrap, allData) {
		var isPopulated	= $.Deferred(),
			dataLen = allData.length - 1;

		allData.forEach(function(data, i) {
			$.when(
				addGroup(elWrap, i, data)
			).then(function(done) {
				console.log('Done adding group ' + i);
				if ( done ) {
					$('#tag-group-' + i).removeClass('loading');
				}
			});

			if (i === dataLen) {
				_canExclude();

				isPopulated.resolve(true);
			}
		});

		return isPopulated.promise();
	}


	function resetAll(elWrap, groupID) {
		console.groupCollapsed('Resolve reset tag groups');
		var isReset = $.Deferred();

		if ( !HF.utils.isEmptyObj(listTags) ) {
			console.log('Tag groups object ready');
			console.groupCollapsed('Destroy all');

			for (var key in listTags) {
				if ( listTags.hasOwnProperty(key) ) {
					_destroyGroup(key, false);
				}
			}

			console.groupEnd();

			if (elWrap) {
				console.log('Ready to load');
				$.when(
					addGroup(elWrap, groupID)
				).then(function (added) {
					if ( added ) {
						events.emit('groupStatus', 'noSearch');
						$('#' + elWrap).addClass('single-child');
					}

					isReset.resolve(added);
				});
			} else {
				$mainWrap = null;
				isReset.resolve(true);
			}
		} else {
			console.warn('Tag groups object error => No action taken');
			isReset.resolve(false);
		}

		console.groupEnd();
		return isReset.promise();
	}


	function getGroup(id) {
		var isReady	= $.Deferred();

		if ( !listTags[id] ) {
			console.error('Tags => Group does not exist');
			isReady.resolve(false);
		} else {
			isReady.resolve(listTags[id]);
		}

		return isReady.promise();
	}


	function getBool() {
		var isCreated = $.Deferred(),
			searchObj = [];

		if ( listTags.constructor === Object && Object.keys(listTags).length ) {
			for (var key in listTags) {
				if ( listTags.hasOwnProperty(key) && listTags[key].items.length ) {
					var isInclude = ( $('#' + key).hasClass('excluding') ) ? 0 : 1,
						options = [];

					for (var i = 0; i < listTags[key].items.length; i++) {
						var item = listTags[key].items[i];
						options.push( listTags[key].options[item] );
					}

					var group = options.map(function(item) {
						return {keyword: item.keyword, type: item.type};
					});

					searchObj.push({include: isInclude, keywords: group});
				}
			}
		}

		isCreated.resolve(searchObj);
		return isCreated.promise();
	}



	/*
	 *  Private methods
	 */

	function _createTags(groupID, data) {
		console.groupCollapsed('Creating group id | ' + groupID);
		var items;

		if (data) {
			if (!data.include) {
				var group = $('#tag-group-' + groupID);

				group.addClass('excluding');
				group.find('.toggle-input').prop('checked', false);
			}

			items = data.keywords.map(function(item) {
				return item.keyword;
			});
		}

		var isCreated = $.Deferred(),
			$tagGroup = $('#tag-list-' + groupID);

		$tagGroup.selectize({
			plugins: ['remove_button', 'drag_drop'],
			delimiter: ',',
			persist: false,
			openOnFocus: false,
			closeAfterSelect: true,
			openAfterItemRemove: false,
			options: (!data) ? [] : data.keywords,
			items: (!items) ? [] : items,
			valueField: 'keyword',
			labelField: 'keyword',
			searchField: 'keyword',
			render: {
				item: function(tag, escape) {
					return '<span data-value="' + tag.keyword + '" data-type="' + tag.type + '">' +
						escape(tag.keyword) +
					'</span>';
				}
			},
			score: function scoreFilter(search) {
				var ignore = search && search.length < 1;
				var score = this.getScoreFunction(search);
				return function onScore(item) {
					if (ignore) {
						return 0;
					} else {
						var result = score(item);
						return result;
					}
				};
			},
			createFilter: function(input) {
				input = input.toLowerCase();

				var minLen = input.length > 1,
					options = this.options,
					isOption = true,
					isUnique = $.grep(this.getValue(), function(value) {
						return value.toLowerCase() === input;
					}).length === 0;

				for (var key in options) {
					if (input === key) {
						isOption = false;
						return isOption;
					}
				}

				return (minLen && isUnique && isOption) ? true : false;
			},
			create: function(input, callback) {
				this.preload = true;

				if ( noiseWords.indexOf(input) > -1 ) {
					HF.views.modal({modalurl: 'noisewords', bgclose: false, isinfo: true});
					return false;
				} else {
					callback({
						keyword: input,
						type: 'unknown'
					});
				}
			},
			load: function(query, callback) {
				if (!query.length) {
					return this.close();
				}

				var self = this;

				$.ajax({
					type: 'GET',
					url: apiKeywords + encodeURIComponent(query),
					success: function(res) {
						if ( self.preload ) {
							callback();
						} else {
							callback(res.slice(0, 10));
						}

						self.preload = false;
					},
					error: function() {
						callback();
						self.preload = false;
					}
				});
			},
			onItemAdd: function(value, $item) {
				return this.close();
			},
			onDelete: function(values) {
				if (values.length > 1) {
					return confirm('Are you sure you want to remove these ' + values.length + ' tags?');
				}
			},
			onItemRemove: function(value) {
				return this.close();
			},
			onFocus: function() {
				var elID = $(this.$input).parent().attr('id'),
					container = $('#' + elID).children('.tag-suggestions');

				$mainWrap.find('.tag-suggestions').removeClass('open');
				container.addClass('open');
			},
			onBlur: function() {
				return this.close();
			},
			onDropdownClose: function(option) {
				return this.clearOptions();
			},
			onChange: function(value) {
				var elID = $(this.$input).parent().attr('id');
				_getSuggestions(elID);
				_checkGroupsStatus( elID, false );

				this.clearOptions();
				this.close();
			},
			onInitialize: function() {
				console.log('Initialized');
				listTags['tag-group-' + groupID] = $(this)[0];

				// $(this)[0].focus();
				isCreated.resolve(true);
			}
		});

		return isCreated.promise();
	}


	function _getGroupTags(elID) {
		var isCreated = $.Deferred(),
			groupOpts = [];

		for (var i = 0; i < listTags[elID].items.length; i++) {
			var item = listTags[elID].items[i];
			groupOpts.push( listTags[elID].options[item] );
		}

		var groupTags = groupOpts.map(function(item) {
			return {keyword: item.keyword, type: item.type};
		});

		isCreated.resolve(groupTags);
		return isCreated.promise();
	}


	function _fetchSuggestions(tagsExisting) {
		var def = $.ajax({
			type: 'POST',
			url: apiSuggests,
			data: {tags: JSON.stringify(tagsExisting), token: 'xtempx'},
			dataType: 'json',
			crossDomain: true
		});

		return def.promise();
	}


	function _parseSuggestions(elID, tags) {
		var container = $('#' + elID).children('.tag-suggestions');

		if (!tags || !tags.length || (tags.length === 1 && !tags[0].keyword)) {
			$('<span/>').text('No suggestions found').appendTo(container);
		} else {
			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];

				$('<a/>')
					.text(tag.keyword)
					.attr({
						'href': '#',
						'class': 'tag',
						'data-type': tag.type,
						'data-value': tag.keyword
					})
					.appendTo(container);
			}
		}

		$mainWrap.find('.tag-suggestions').removeClass('open');
		container.addClass('open');
	}


	function _getSuggestions(elID) {
		$('#' + elID).children('.tag-suggestions').empty();

		$.when(
			_getGroupTags(elID)
		).then(function(groupTags) {
			if (!groupTags.length) {
				return false;
			} else {
				return _fetchSuggestions(groupTags);
			}
		}).done(function(suggestions) {
			if (suggestions) {
				_parseSuggestions(elID, suggestions);
			}
		});
	}



	/*
	 *  Events
	 */

	function _eventsBind(groupID) {
		var $elGroup	= $('#' + groupID),
			$elSuggest	= $elGroup.children('.tag-suggestions'),
			$toggleBtn	= $elGroup.find('.toggle-input'),
			$removeBtn	= $elGroup.find('a.link');

		$mainWrap.toggleClass('single-child', $mainWrap.children().length < 2);

		$removeBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_destroyGroup(groupID, true);
		});

		$toggleBtn.on('change', function(e) {
			var toggleId = $(this).attr('id'),
				targetId = toggleId.replace('toggle', 'group'),
				$target = $('#' + targetId);

			$target.toggleClass('excluding', !this.checked);
		});

		$elSuggest.on('click', 'a.tag', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var tag = {keyword: $(this).data('value'), type: $(this).data('type')},
				sel = listTags[groupID];

			sel.addOption(tag);
			sel.addItem(tag.keyword);

			console.log('Clicked Tag: ', tag);
			console.log('Group: ', sel);
		});

		console.log('Events binded');
		console.groupEnd();
		return true;
	}


	function _destroyGroup(groupID, isClick) {
		console.log('Destroying | ' + groupID);
		var $elGroup	= $('#' + groupID),
			$toggleBtn	= $elGroup.find('.toggle-input'),
			$removeBtn	= $elGroup.find('a.link');

		// Unbind all events
		$removeBtn.off('click');
		$toggleBtn.off('change');
		// Remove from DOM
		$elGroup.remove();
		// Destroy selectize;
		listTags[groupID].destroy();
		// Remove instance from group object
		delete listTags[groupID];

		if ( isClick ) {
			_checkGroupsStatus(groupID, isClick);
		}
	}


	function _checkGroupsStatus( elID, isClick ) {
		var groupsLen, itemsLen, status;

		if ( listTags.constructor === Object ) {
			groupsLen = Object.keys(listTags).length;
			itemsLen = ( !isClick ) ? listTags[elID].items.length : 0;
		}

		if ( !isClick && groupsLen < 2 ) {
			$mainWrap.addClass('single-child');
			status = ( !itemsLen ) ? 'noSearch' : 'canAdd';
		} else {
			for (var key in listTags) {
				if ( listTags.hasOwnProperty(key) && key !== elID ) {
					if ( !listTags[key].items.length ) {
						status = 'isEmpty';

						if ( !isClick && !itemsLen ) {
							_destroyGroup(key, false);

							if ( groupsLen === 2 ) {
								status = 'noSearch';
								$mainWrap.addClass('single-child');
							} else {
								status = 'isEmpty';
							}
						} else if ( isClick ) {
							if ( groupsLen === 1 ) {
								status = 'noSearch';
								$mainWrap.addClass('single-child');
							} else {
								status = 'isEmpty';
							}
						}

						break;
					} else {
						if ( !isClick ) {
							status = ( !itemsLen ) ? 'isEmpty' : 'canAdd';
						} else {
							status = 'canAdd';
							$mainWrap.toggleClass('single-child', groupsLen < 2);
						}
					}
				}
			}
		}

		_canExclude(status);
		events.emit('groupStatus', status);
	}


	function _canExclude(status) {
		var _status = (!status) ? 'nostatus' : status,
			isDefaultEmpty = false,
			enable = false,
			itm = [],
			len = 0;

		if ( listTags.constructor === Object ) {
			itm = Object.keys(listTags);
			len = itm.length;
		}

		// Add 'defaultGroup' to first group
		$('#' + itm[0]).addClass('defaultGroup');

		// Check if first group is empty
		if ( listTags[itm[0]] ) {
			isDefaultEmpty = ( !listTags[itm[0]].items.length ) ? true : false;
		}

		if ( len === 1 ) {
			enable = false;
		} else if ( len === 2 ) {
			enable = ( _status === 'canAdd' ) ? true : false;
		} else {
			enable = ( _status === 'isEmpty' && isDefaultEmpty ) ? 'defaultEmpty' : true;
		}

		for (var key in listTags) {
			if ( listTags.hasOwnProperty(key) ) {
				var toggleId = key.replace('group', 'toggle'),
					$target = $('#' + toggleId),
					isFirst = $('#' + key).hasClass('defaultGroup');

				if ( !enable ) {
					$target.prop({
						checked: true,
						disabled: true
					}).change();
				} else if ( enable === 'defaultEmpty' && !isFirst ) {
					$target.prop({
						checked: true,
						disabled: true
					}).change();

					break;
				} else {
					$target.prop('disabled', false).change();
				}
			}
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		addGroup: addGroup,
		getGroup: getGroup,
		setGroups: setGroups,
		getBool: getBool,
		resetAll: resetAll
	};
})();
HF.map = (function () {

	/*
	 *  Cached DOM elements
	 */

	var elMapWrap, elMap, elPop, elLegend, elHideMap;



	/*
	 *  Private cached data
	 */

	var elMapData, _cc, elPopData = [];



	/*
	 *  Events
	 */

	// Subscriptions
	events.on('resultsReady', function(src) {
		$.when(
			_cleanMap()
		).then(function (cleaned) {
			if (cleaned) {
				elMapData = src;
				_updateSource(elMapData);
			}
		});
	});

	events.on('countryChanged', function(value) {
		_goToCountry(value);
	});

	events.on('cleanMap', function() {
		if (elMap && elMapData) {
			// Hide legend
			elHideMap.off('click',  _hideMapView);
			elLegend.off('click', '.toggle-btn', _toggleLegend);
			elLegend.attr('class', 'legend hidden');
			_cleanMap();
		}
	});



	/*
	 *  Public methods
	 */

	function init(el) {
		// Get main map wrapper
		elMapWrap = (!el) ? $('#alt') : $('#' + el);
		elLegend = $('#map-legend');
		elHideMap = elMapWrap.children('.toggle-map');
		// Prepare map wrapper
		elMapWrap.append('<div id="map"></div>');

		$.when(
			_renderMapBox()
		).then(function(rendered) {
			if (rendered) {
				console.log('Map Module => Loaded');
				elMapWrap.removeClass('loading');
			} else {
				console.log('Map Module => Error loading');

				elMapWrap
					.html(
						'<div class="module-error-msg">' +
						'There was an error loading the map module' +
						'</div>')
					.removeClass('loading');
			}
		});
	}


	function unload() {
		$.when(
			_cleanMap()
		).then(function (cleaned) {
			if (cleaned) {
				elHideMap.off('click',  _hideMapView);
				elLegend.off('click', '.toggle-btn', _toggleLegend);
				elLegend.attr('class', 'legend hidden');
				elMap.remove();
				elHideMap = null;
				elLegend = null;
				elMapWrap = null;
				elMap = null;
				elPop = null;
			}
		});

		console.log('Map destroyed');
	}


	function _renderMapBox() {
		var isLoaded = $.Deferred();

		mapboxgl.accessToken = 'pk.eyJ1IjoibWFwdXBqdHciLCJhIjoiY2lmbW9kM3MxMDE4ZHVlbHl3bDN2a2dsOSJ9.Mea9-MfQVZ_6XJM9bjuVMQ';

		elMap = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/light-v9',
			center: [-1, 53],
			minZoom: 1,
			zoom: 2,
			attributionControl: false,
			preserveDrawingBuffer: true
		});

		elMap.on('load', function() {
			isLoaded.resolve(true);

			_goToCountry('uk');

			elMap.addControl(new mapboxgl.NavigationControl(), 'top-left');

			elPop = new mapboxgl.Popup({
				closeButton: false
			});
		});

		return isLoaded.promise();
	}


	function _updateSource(mapData) {
		console.log('Map Data: ', mapData);

		var results = $.extend(true, {}, HF.results.list.getCached(mapData)),
			searchData = HF.results.list.getData('searchData'),
			geoBound = new mapboxgl.LngLatBounds(),
			filterID = ['in', 'id'],
			geoPoint = [],
			stopsArr = [],
			hasGeometry = (!results.overview.mapType) ? true : false,
			mapID = (mapData === 'level2') ? _mapID[mapData] : _mapID[searchData.geo[1] + '_level3'],
			layerSrc = (mapData === 'level2') ? results.overview.locationId + '_' + mapData : results.overview.locationId + '_level3',
			maxCount;

		// Check if there regions within the results
		if ( !HF.utils.isEmptyObj(results.regions) ) {
			// Iterate results to build region data
			for (var loc in results.regions) {
				// Assign first region candidates count if no maxCount available
				if (!maxCount) {
					maxCount = results.regions[loc].candidates;
				}

				var region = results.regions[loc],
					ratio = ( region.candidates / (maxCount * 10) ) * 6;

				// Create geojson with points if no geometry source exists
				if ( !hasGeometry ) {
					var geoFeat = {
						"type": "Feature",
						"properties": {
							"id": region.locationId,
							"displayName": region.location
						},
						"geometry": {
							"type": "Point",
							"coordinates": region.mapType
						}
					};

					geoPoint.push(geoFeat);
					geoBound.extend(region.mapType);
				}

				// Populate data array for location popups
				elPopData[region.locationId] = {
					"candidates": HF.utils.addCommas(region.candidates),
					"jobposts": HF.utils.addCommas(region.jobposts),
					"salary": (!region.salary.avg) ? 0 : HF.utils.addCommas(region.salary.avg, results.overview.currency),
					"level": region.levelOpts,
					"geoPath": region.locationPath
				};

				// Populate filter and stops arrays
				filterID.push(region.locationId);
				stopsArr.push([region.locationId, _setColor(ratio)]);
			}

			// If geometry source is available
			if ( hasGeometry ) {
				// Get json coordinates ( [sw, ne] ) file and extend bounds
				$.when(
					_getBounds(mapData, searchData.geo[1], results.overview.locationId)
				).then(function(data) {
					for (var key in data.bounds) {
						if ( data.bounds.hasOwnProperty(key) && ( filterID.indexOf(key) > -1 ) ) {
							var templl = new mapboxgl.LngLatBounds(data.bounds[key][0], data.bounds[key][1]);
							geoBound.extend(templl);
						}
					}

					// Fit map to results
					elMap.fitBounds(geoBound, {
						padding: 20
					});
				});

				// Add source to map
				elMap.addSource('regions', {
					'type': 'vector',
					'url': 'mapbox://mapupjtw.' + mapID
				});

				// Add map fill layers
				_addLayerFill('region', layerSrc, filterID, stopsArr);
				_addLayerFill('region-hover', layerSrc, filterID, stopsArr);
			} else {
				var geoJson = {
					"type": "FeatureCollection",
					"features": geoPoint
				};

				// Fit map to results
				elMap.fitBounds(geoBound, {
					padding: 60,
					maxZoom: 11
				});

				// Add source to map
				elMap.addSource('regions', {
					'type': 'geojson',
					'data': geoJson
				});

				// Add map circle layers
				_addLayerCircle('region', filterID, stopsArr);
				_addLayerCircle('region-hover', filterID, stopsArr);
			}

			// Show legend
			if ( elLegend.hasClass('hidden') ) {
				elLegend.on('click', '.toggle-btn', _toggleLegend);
				elLegend.removeClass('hidden').addClass('open');
			}

			// Bind hide map view button (mobile)
			elHideMap.on('click',  _hideMapView);

			// Bind map events
			elMap.on('mousemove', 'region', _popMove);
			elMap.on('mouseleave', 'region', _popLeave);
			elMap.on('click', 'region', _popClick);
		}
	}


	function _setColor(ratio) {
		var val	= (ratio > 0.6) ? 0.6 : ratio, hsl;

		if (val <= 0.10) {
			hsl = 'hsl(' +
				Math.ceil( val * 320 ) + ', ' +
				Math.ceil( 90 ) + '%, ' +
				Math.ceil( 50 ) + '%)';
		} else if (val > 0.10 && val <= 0.35) {
			hsl = 'hsl(' +
				Math.ceil( 23 + (val * 120) ) + ', ' +
				Math.ceil( 90 ) + '%, ' +
				Math.ceil( 50 ) + '%)';
		} else {
			hsl = 'hsl(' +
				Math.ceil( 4 + (val * 180) ) + ', ' +
				Math.ceil( 100 - (val * (val * 80)) ) + '%, ' +
				Math.ceil( 67 - (val * 48) ) + '%)';
		}

		return hsl;
	}


	function _addLayerFill(layerId, layerSrc, filter, stops) {
		elMap.addLayer({
			'id': layerId,
			'type': 'fill',
			'source': 'regions',
			'source-layer': layerSrc,
			'paint': {
				'fill-color': {
					'property': 'id',
					'type': 'categorical',
					'stops': stops,
					'default': 'rgba(0, 0, 0, 0)'
				},
				'fill-outline-color': (layerId === 'region') ? '#282828' : '#000000',
				'fill-opacity': (layerId === 'region') ? 0.8 : 0.9
			},
			'filter': (layerId === 'region') ? filter : ['==', 'id', '']
		}, 'bridge-motorway-2');
	}


	function _addLayerCircle(layerId, filter, stops) {
		elMap.addLayer({
			'id': layerId,
			'type': 'circle',
			'source': 'regions',
			'paint': {
				'circle-color': {
					'property': 'id',
					'type': 'categorical',
					'stops': stops,
					'default': 'rgba(0, 0, 0, 0)'
				},
				'circle-radius': {
					'type': 'exponential',
					'stops': [[1, 10], [22, 4]]
				},
				'circle-opacity': (layerId === 'region') ? 0.8 : 0.9
			},
			'filter': (layerId === 'region') ? filter : ['==', 'id', '']
		}, 'bridge-motorway-2');
	}


	function _popMove(e) {
		var feat = e.features[0].properties,
			salary = (elPopData[feat.id].salary) ? '<li>Avg. Salary: ' + elPopData[feat.id].salary + '</li>' : '',
			drillMsg = (elPopData[feat.id].level === 'goDeep') ? '<span>Click to drill down</span>' : '';

		elMap.getCanvas().style.cursor = 'pointer';
		elMap.setFilter('region-hover', ['==', 'id', feat.id]);

		elPop.setLngLat(e.lngLat)
			.setHTML('<div id=\'popup\' class=\'popup\' style=\'z-index: 10;\'>' +
			'<h5>' + feat.displayName + '</h5>' +
			'<ul><li>Candidates: ' + elPopData[feat.id].candidates + '</li>' +
			'<li>Adverts: ' + elPopData[feat.id].jobposts + '</li>' +
			salary + '</ul>' + drillMsg + '</div>')
			.addTo(elMap);
	}


	function _popLeave() {
		elMap.getCanvas().style.cursor = '';
		elPop.remove();
		elMap.setFilter('region-hover', ['==', 'id', '']);
	}


	function _popClick(e) {
		var feat = e.features[0].properties,
			name = (feat.displayName).toLowerCase(),
			lvl = elPopData[feat.id].level,
			geo = elPopData[feat.id].geoPath;

		if (lvl === 'goDeep') {
			events.emit('mapDrilled', [name, geo]);
		}
	}


	function _toggleLegend(e) {
		e.preventDefault();
		e.stopPropagation();

		var $this = $(e.target).closest('.legend');

		$this.toggleClass('open');
	}


	function _hideMapView(e) {
		e.preventDefault();
		e.stopPropagation();

		elMapWrap.removeClass('showing');
	}


	function _goToCountry(code) {
		// Store current country
		_cc = code;

		// Remove max bounds restriction
		elMap.setMaxBounds( null );

		// Fit map to selected country
		elMap.fitBounds(_ccBound[code], {
			padding: 20
		});

		elMap.once('moveend', function(e) {
			// Get map bounds after padding
			var tmp = elMap.getBounds(),
				max = [
					[tmp._sw.lng, tmp._sw.lat],
					[tmp._ne.lng, tmp._ne.lat]
				];

			// Set max bounds restriction
			// elMap.setMaxBounds( max );
		});
	}


	function _getBounds(level, country, locId) {
		var pathUrl = (level === 'level2') ? '/level2/' + locId + '.json' : '/level3/' + country + '/' + locId + '.json';

		return $.ajax({
			type: 'GET',
			// url: pathAws + 'bounds' + pathUrl,
			url: 'https://s3.eu-west-2.amazonaws.com/horsefly-dev/bounds' + pathUrl,
			dataType: 'json',
			crossDomain: true
		});
	}


	function _cleanMap() {
		var isClean = $.Deferred();

		var mapSource = elMap.getSource('regions');

		if ( !elMapData || !mapSource ) {
			isClean.resolve(true);
		} else {
			elMap.off('mousemove', 'region', _popMove);
			elMap.off('mouseleave', 'region', _popLeave);
			elMap.off('click', 'region', _popClick);
			elMap.removeLayer('region');
			elMap.removeLayer('region-hover');
			elMap.removeSource('regions');
			elPopData.length = 0;
			elMapData = null;

			isClean.resolve(true);
		}

		return isClean.promise();
	}



	/*
	 *  Geometry source id
	 */

	var _mapID = {
		'level2': '69e5402c',
		'uk_level3': 'c8708372',
		'us_level3': 'b5294f92'
	};

	var _ccBound = {
		"ae": [[51.56934655000006,22.62094594300011],[56.383636915000096,26.074791972000142]],
		"ar": [[-73.58803584899991,-55.05201588299981],[-53.66155187999993,-21.786937763999916]],
		"au": [[112.911057,-54.770634],[159.111282,-9.222043]],
		"be": [[2.544855,49.496982],[6.408097,51.505114]],
		"bg": [[22.3805257504,41.2344859889],[28.5580814959,44.2349230007]],
		"br": [[-73.990238,-33.751358],[-32.390875,5.270972]],
		"ca": [[-140.99778,41.6751050889],[-52.6480987209,72.098075]],
		"ch": [[5.958,45.819],[10.493,47.81]],
		"cl": [[-109.45372473899987,-55.91850422299979],[-66.42080644399994,-17.506588197999974]],
		"cn": [[73.451005,18.163247],[134.976798,53.531943]],
		"cz": [[12.0901107788,48.55218276675],[18.8592338562,51.0555310416]],
		"de": [[5.871619,47.269859],[15.038112,55.056526]],
		"dk": [[8.08997684086,54.8000145534],[12.6900061378,57.730016588]],
		"es": [[-18.167225715,27.642238674],[4.337087436,43.79344310]],
		"fi": [[20.62316451,59.811224677],[31.56952478,70.075310364]],
		"fr": [[-4.788050159229584,41.362165],[9.56001631027,51.1485061713]],
		"gt": [[-92.229249,13.735338],[-88.225023,17.819326]],
		"hk": [[113.837331576,22.177069403],[114.40129642,22.56394603]],
		"hu": [[16.094035278,45.741343486],[22.877600546,48.56923289]],
		"ie": [[-10.66285,51.419897],[-5.996284,55.446575]],
		"in": [[68.1766451354,7.96553477623],[97.4025614766,35.4940095078]],
		"it": [[6.627731,35.494864],[18.521147,47.09264]],
		"jp": [[122.938161655,24.212103583],[153.985606316,45.520412502]],
		"mx": [[-118.40765,14.532098],[-86.710405,32.718654]],
		"my": [[99.64522806,0.851370341],[119.278086785,7.355780341]],
		"nl": [[3.307937,50.750367],[7.227498,53.576423]],
		"no": [[-9.11742102799991,-54.46249765399993],[33.64039147200011,80.7700869810]],
		"nz": [[166.4258270,-47.2871319],[178.5504760,-34.1439329]],
		"pe": [[-81.33755752899992,-18.33774620693788],[-68.68425248299991,-0.029092711999866]],
		"ph": [[116.928337,4.58694],[126.605347,21.070141]],
		"pl": [[14.12127,49.00613],[24.153276,54.835693]],
		"pt": [[-9.549835,36.959879],[-6.189159,42.154311]],
		"ro": [[20.242825969,43.650049948],[29.699554884,48.274832256]],
		"ru": [[19.66064,41.151416],[180,81.2504]],
		"sa": [[34.632336,16.347891],[55.666659,32.161009]],
		"se": [[11.10816491,55.342678127],[24.163413534,69.036355693]],
		"sg": [[103.605694535,1.15869869159],[104.4064174364,1.4720660897]],
		"sv": [[-90.095555,13.149017],[-87.723503,14.424133]],
		"ua": [[22.1328277588,44.3810424805],[40.1595153809,52.368927001]],
		"uk": [[-8.179851160822153,49.959999905],[1.768912,60.845474]],
		"us": [[-171.791110603,18.91619],[-66.96466,71.3577635769]],
		"za": [[16.45194,-34.83417],[32.891697,-22.12503]]
	};



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		unload: unload
	};
})();
HF.locs = (function () {

	/*
	 *  Constants
	 */

	var apiLocation = pathApi + 'horsefly/suggestions/city?keyword=',
		withGeometry = ['uk', 'us', 'ca', 'br', 'mx', 'au'],
		locGroupLen = 0,
		listLocs = {};



	/*
	 *  Cached DOM elements
	 */

	var $mainWrap;



	/*
	 *  Public methods
	 */

	function addGroup(elWrap, groupID, data) {
		console.groupCollapsed('Loc group => Adding new');
		var completed = $.Deferred(),
			$elWrap	= $('#' + elWrap);

		if ( !$mainWrap ) {
			$mainWrap = $elWrap;
		}

		$.when(
			HF.views.addModule($elWrap, 'loc_group', {groupId: groupID})
		).then(function (rendered) {
			if ( rendered ) {
				return _createAll(groupID, data);
			}
		}).then(function(created) {
			if (created) {
				return _eventsBind(groupID);
			}
		}).then(function(binded) {
			if (binded) {
				completed.resolve(binded);
				console.groupEnd();
			}
		});

		return completed.promise();
	}


	function setGroups(elWrap, allData) {
		var isPopulated	= $.Deferred(),
			dataLen = allData.length - 1;

		allData.forEach(function(data, i) {
			$.when(
				addGroup(elWrap, i, data)
			).then(function(done) {
				console.log('Done adding group ' + i);
				if ( done ) {
					$('#loc-group-' + i).removeClass('loading');
				}
			});

			if (i === dataLen) {
				isPopulated.resolve(true);
			}
		});

		return isPopulated.promise();
	}


	function getGroups() {
		var isCreated = $.Deferred(),
			$wrapper = $('#loc-groups'),
			locGroupArray = [];

		if ( $wrapper.find('.loc-group-wrapper').length ) {
			var locGroups = $wrapper.find('.loc-group-wrapper');

			locGroups.each(function() {
				var groupID = $(this).attr('id').split('loc-group-');
				var fieldCountry = $(this).find('#search-country-' + groupID[1]).val();
				var fieldLocation = $(this).find('#search-location-' + groupID[1]).val();
				var fieldRadius = $(this).find('#search-radius-' + groupID[1]).val();

				if ( fieldCountry ) {
					var groupItem = {
						subContinent: 0,
						country: 0,
						region: 0,
						city: 0,
						locationId: 0,
						radius: ''
					};

					var dataCountry = listLocs['country-' + groupID[1]].options[fieldCountry];
					groupItem.subContinent = dataCountry.continent;
					groupItem.country = dataCountry.code;

					if ( fieldLocation ) {
						var dataLocation = listLocs['location-' + groupID[1]].options[fieldLocation];

						console.log('Get Groups | Data Location: ', dataLocation);

						groupItem.region = dataLocation.region;
						groupItem.city = dataLocation.city;
						groupItem.locationId = dataLocation.locationId;
						groupItem.radius = fieldRadius;
					} else {
						if ( withGeometry.indexOf(fieldCountry) === -1 ) {
							groupItem.region = 'all';
						}
					}

					locGroupArray.push(groupItem);
				}
			});

			isCreated.resolve(locGroupArray);
			return isCreated.promise();
		}
	}



	/*
	 *  Private methods
	 */

	function _createAll(groupID, data) {
		console.groupCollapsed('Creating location group');
		locGroupLen = groupID;

		selConf.country.options = _country;

		console.log('Create all location fields');
		var allSelects = ['country', 'location', 'radius'];

		allSelects.forEach(function(itemSel) {
			_createEach( itemSel );
		});

		if ( data ) {
			listLocs['country-' + groupID].setValue(data.country);

			if ( data.city && data.city !== '0' ) {
				var locName = ( withGeometry.indexOf(data.country) !== -1 )
					? HF.utils.locationFormat( [data.city, data.region] )
					: HF.utils.capAll( data.city );

				console.log('Country: ', data.country);
				console.log('Region: ', data.region);
				console.log('City: ', data.city);
				console.log('Location Name: ', locName);

				listLocs['location-' + groupID].addOption({
					displayName: locName,
					city: data.city,
					region: data.region,
					locationId: data.locationId
				});

				listLocs['location-' + groupID].setValue(locName);
				listLocs['radius-' + groupID].setValue(data.radius);
			}
		} else {
			if ( groupID < 1 ) {
				listLocs['country-0'].setValue('uk');
			}
		}

		console.groupEnd();
		return true;
	}


	function _createEach(selName) {
		console.log('----------------------------------');
		console.log('Creating ' + selName + ' select');
		var $elSel = $('#search-' + selName + '-' + locGroupLen).selectize(selConf[selName]);
	}



	/*
	 *  Select configurations
	 */

	var selConf = {
		'country': {
			valueField: 'code',
			labelField: 'name',
			searchField: 'name',
			options: [],
			disableDelete: true,
			placeholder: 'Country',
			onChange: function(value) {
				var groupLen = this.$input[0].id.split('search-country-');

				listLocs['location-' + groupLen[1]].clear();
				listLocs['location-' + groupLen[1]].clearOptions();

				$('#create-loc-group').toggleClass('disabled', !value.length);
			},
			onInitialize: function() {
				var selName = 'country-' + locGroupLen;
				console.log('Created => ' + selName);
				listLocs[selName] = $(this)[0];
			}
		},
		'location': {
			plugins: ['restore_on_backspace'],
			persist: false,
			openOnFocus: false,
			closeAfterSelect: true,
			maxItems: 1,
			valueField: 'displayName',
			labelField: 'displayName',
			searchField: 'displayName',
			options: [],
			create: false,
			render: {
				option: function(item, escape) {
					return '<div>' + escape(item.displayName) + '</div>';
				}
			},
			load: function(query, callback) {
				var groupLen = this.$input[0].id.split('search-location-');

				if (!query.length) {
					return this.close();
				}

				$.ajax({
					type: 'GET',
					url: apiLocation + encodeURIComponent(query) + '&country=' + listLocs['country-' + groupLen[1]].getValue(),
					success: function(res) {
						callback(res.slice(0, 10));
					},
					error: function() {
						callback();
					}
				});
			},
			onDropdownClose: function(option) {
				return this.clearOptions();
			},
			onChange: function(value) {
				var groupLen = this.$input[0].id.split('search-location-');

				if ( !value.length ) {
					listLocs['radius-' + groupLen[1]].setValue('');
					listLocs['radius-' + groupLen[1]].disable();
				} else {
					listLocs['radius-' + groupLen[1]].enable();

					var locData = this.options[value];
					console.log('Multi Location locData: ', locData);
				}
			},
			onInitialize: function() {
				var selName = 'location-' + locGroupLen;
				console.log('Created => ' + selName);
				listLocs[selName] = $(this)[0];
			}
		},
		'radius': {
			valueField: 'value',
			labelField: 'name',
			searchField: 'name',
			options: [
				{name: 'Radius', value: ''},
				{name: '0 mi', value: 0},
				{name: '5 mi', value: 5},
				{name: '10 mi', value: 10},
				{name: '15 mi', value: 15},
				{name: '20 mi', value: 20},
				{name: '25 mi', value: 25},
				{name: '30 mi', value: 30},
				{name: '50 mi', value: 50},
				{name: '100 mi', value: 100}
			],
			onChange: function(value) {
				HF.search.build.setData('rad', this.options[value].value);
			},
			onInitialize: function() {
				var selName = 'radius-' + locGroupLen;
				console.log('Created => ' + selName);
				$(this)[0].setValue('');
				listLocs[selName] = $(this)[0];
			}
		}
	};



	/*
	 *  Events
	 */

	function _eventsBind(groupID) {
		var $elGroup	= $('#loc-group-' + groupID),
			$removeBtn	= $elGroup.find('a.link');

		$removeBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_destroyGroup(groupID);
		});

		if ( groupID === 0 ) {
			listLocs['country-' + groupID].on('change', function() {
				var countryValue = listLocs['country-' + groupID].getValue();
				events.emit('countryChanged', countryValue);
			});
		}

		console.log('Events binded');
		console.groupEnd();
		return true;
	}


	function resetAll() {
		console.groupCollapsed('Resolve reset loc groups');
		var isReset = $.Deferred();

		if ( !HF.utils.isEmptyObj(listLocs) ) {
			console.log('Loc groups object ready');
			console.groupCollapsed('Destroy all');

			for (var key in listLocs) {
				if ( listLocs.hasOwnProperty(key) ) {
					var keyParts = key.split('-');

					if ( keyParts[1] !== '0' ) {
						_destroyGroup(keyParts[1]);
					} else {
						_resetField(key);
					}
				}
			}

			isReset.resolve(true);
			console.groupEnd();
		} else {
			console.warn('Loc groups object error => No action taken');
			isReset.resolve(false);
		}

		console.groupEnd();
		return isReset.promise();
	}


	function _destroyGroup(groupID) {
		console.log('Destroying | loc-group-' + groupID);
		var $elGroup	= $('#loc-group-' + groupID),
			$removeBtn	= $elGroup.find('a.link');

		// Unbind all events
		$removeBtn.off('click');
		// Remove from DOM
		$elGroup.remove();
		// Destroy selectize;
		listLocs['country-' + groupID].destroy();
		listLocs['location-' + groupID].destroy();
		listLocs['radius-' + groupID].destroy();
		// Remove instance from group object
		delete listLocs['country-' + groupID];
		delete listLocs['location-' + groupID];
		delete listLocs['radius-' + groupID];

		console.log('listLocs: ', listLocs);
	}


	function _resetGroup(groupID) {
		console.log('Reseting | loc-group-' + groupID);

		listLocs['radius-' + groupID].setValue('');
		listLocs['location-' + groupID].setValue('');
		listLocs['country-' + groupID].setValue('uk');
	}


	function _resetField(fieldName) {
		console.log('Reseting | ' + fieldName);
		var type = fieldName.split('-');

		if ( type[0] === 'country' ) {
			listLocs[fieldName].setValue('uk');
		} else {
			listLocs[fieldName].setValue('');
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		addGroup: addGroup,
		getGroups: getGroups,
		setGroups: setGroups,
		resetAll: resetAll
	};
})();
HF.dropdownList = (function () {

	/*
	 *  Events
	 */

	// Bind
	function _eventsBind($el) {
		elOption = $el.find('ul.child-list');

		elOption.on('click', 'li > a', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var action = $(this).data('action');

			if (action === 'search-save') {
				HF.views.modal({modalurl: 'saveSearch', bgclose: false});
			}

			if (action === 'search-edit') {
				events.emit('cleanMap');
				HF.views.set('search', 'build');
			}

			if (action === 'search-new') {
				events.emit('cleanMap');
				HF.search.build.setData(action);
			}

			if (action === 'export-results') {
				HF.views.modal({modalurl: 'exportPDF'});
			}

			if (action === 'export-csv') {
				HF.export.exportCSV();
			}

			if (action === 'run-campaign') {
				HF.views.setDetails('wammee', 'run', null, 'parent', 'ext');
			}
		});

		console.log('Events successfully binded');
		return true;
	}


	// Unbind
	function _eventsUnbind(elID) {
		var $el = $('#' + elID),
			elOption = $el.find('ul.child-list');

		elOption.off('click');

		console.log('DDL events successfully unbinded');
		return true;
	}


	/*
	 *  Public methods
	 */

	function init(elID, ddlName) {
		console.groupCollapsed('Dropdown list => Initializing');
		var completed = $.Deferred(),
			$el = $('#' + elID);

		$.when(
			HF.views.addModule($el, 'dropdown_list', _ddlConf[ddlName])
		).then(function(added) {
			if ( added ) {
				return _eventsBind($el);
			}
		}).then(function(binded) {
			if ( binded ) {
				completed.resolve(binded);
				console.groupEnd();
			}
		});

		return completed.promise();
	}


	function unload(elID) {
		var completed = $.Deferred();

		$.when(
			_eventsUnbind(elID)
		).then(function(unbinded) {
			if (unbinded) {
				completed.resolve(unbinded);
			}
		});

		return completed.promise();
	}



	/*
	 *  Dropdown configurations
	 */

	var _ddlConf = {
		'searchOpt': {
			ddlId: 'search-options',
			ddlName: 'Search Options',
			ddlItems: [
				{name: 'Save this search', action: 'search-save', icon: 'save'},
				{name: 'Edit search criteria', action: 'search-edit', icon: 'edit_mode'},
				{name: 'Create new search', action: 'search-new', icon: 'search'},
				{name: 'Run campaign', action: 'run-campaign', icon: 'play_arrow'},
				{name: 'Export results to PDF', action: 'export-results', icon: 'picture_as_pdf'},
				{name: 'Export results to CSV', action: 'export-csv', icon: 'format_line_spacing'}
			]
		}
	};



	/*
	 *  Exposed public methods
	 */

	return {
		init: init,
		unload: unload
	};
})();
HF.export = (function () {

	/*
	 *  Public methods
	 */

	function exportCSV() {
		var itemsFormatted = [];
		var tmpData = HF.results.list.getData('searchData');
		var tmpID = HF.results.list.getData('searchId');
		var tmpDate = Date.now();
		var tmpLevel = tmpData.geo.filter(function(val) {
			return (val !== 0 && val !== '0');
		}).length;
		var currencyCode = HF.utils.getCurrencyCode(tmpData.cur);
		var searchLevel = ( !tmpLevel ) ? 'level1' : 'level' + tmpLevel;
		var unformatted = HF.results.list.getCached(searchLevel);
		var regions = unformatted.regions;
		var csvCounter = 0;

		var headers = {
			location: 'Location'.replace(/,/g, ''), // remove commas to avoid errors
			candidates: 'Supply Count',
			min_salary: 'Avg Low Salary (' + currencyCode + ')',
			avg_salary: 'Avg Salary (' + currencyCode + ')',
			max_salary: 'Avg High Salary (' + currencyCode + ')',
			adverts: 'Job Count',
			supply_demand: 'Candidates per Role',
			gen_0: 'Gender (male %)',
			gen_1: 'Gender (female %)',
			exp_0: 'YoE (0-3 years %)',
			exp_1: 'YoE (4-7 years %)',
			exp_2: 'YoE (8+ years %)'
		};

		for (var key in regions) {
			if ( regions.hasOwnProperty(key) ) {

				var snd = Math.round(regions[key].candidates/regions[key].jobposts);

				itemsFormatted.push({
					location: HF.utils.capAll(regions[key].location),
					candidates: regions[key].candidates,
					min_salary: regions[key].salary.min,
					avg_salary: regions[key].salary.avg,
					max_salary: regions[key].salary.max,
					adverts: regions[key].jobposts,
					supply_demand: ( !snd || snd === Infinity ) ? 'n/a' : snd,
					gen_0: getPercentage( regions[key].gender[1], regions[key].gender[2] ),
					gen_1: getPercentage( regions[key].gender[0], regions[key].gender[2] ),
					exp_0: getPercentage( regions[key].explevel[0], regions[key].explevel[3] ),
					exp_1: getPercentage( regions[key].explevel[1], regions[key].explevel[3] ),
					exp_2: getPercentage( regions[key].explevel[2], regions[key].explevel[3] )
				});

				if ( ++csvCounter >= csvLimit ) {
					break;
				}
			}
		}

		var fileTitle = 'horsefly_' + tmpID + '_' + tmpDate;

		exportCSVFile(headers, itemsFormatted, fileTitle);
	}


	function getPercentage(value, total) {
		var percent = (value * 100) / total,
			multiplier = Math.pow(10, 0);

		return Math.round(percent * multiplier) / multiplier;
	}



	/*
	 *  Private methods
	 */

	function convertToCSV(objArray) {
		var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
		var str = '';

		for (var i = 0; i < array.length; i++) {
			var line = '';

			for (var index in array[i]) {
				if  (line !== '' ) {
					line += ',';
				}

				line += array[i][index];
			}

			str += line + '\r\n';
		}

		return str;
	}


	function exportCSVFile(headers, items, fileTitle) {
		if ( headers ) {
			items.unshift(headers);
		}

		// Convert Object to JSON
		var jsonObject = JSON.stringify(items);
		var csv = convertToCSV(jsonObject);
		var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
		var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		if ( navigator.msSaveBlob ) { // IE 10+
			navigator.msSaveBlob(blob, exportedFilenmae);
		} else {
			var link = document.createElement('a');

			if ( link.download !== undefined ) { // feature detection
				// Browsers that support HTML5 download attribute
				var url = URL.createObjectURL(blob);
				link.setAttribute('href', url);
				link.setAttribute('download', exportedFilenmae);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}



	/*
	 *  Exposed public methods
	 */

	return {
		exportCSV: exportCSV
	};
})();
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
HF.modal.deleteSearch = (function () {

	/*
	 *  Constants
	 */

	var elModal, deleteBtn, toDelete;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		console.log('Binding modal events');

		deleteBtn = elModal.find('#delete-confirm');

		deleteBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			_processRemove();
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
		HF.search.saved.updateData(true);
		deleteBtn.off('click');
		deleteBtn = null;
		modalNow = '';

		return true;
	}



	/*
	 *  Private methods
	 */

	function _processRemove() {
		elModal.find('.m-foot').css('display', 'none');
		elModal.addClass('loading');

		$.when(
			_removeSearch()
		).then(function(done) {
			return HF.search.saved.updateData();
		}).then(function(updated) {
			elModal.find('.m-body').html('<h3>Delete complete</h3>');
			elModal.removeClass('loading');

			setTimeout(function() {
				elModal.find('.m-foot > a.m-close').trigger('click');
			}, 2000);
		});
	}

	function _removeSearch() {
		var toDelete = HF.search.saved.getData('toDelete'),
			payload = {searchIds: JSON.stringify(toDelete)};

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/search/delete',
			data: payload,
			crossDomain: true
		});
	}



	/*
	 *  Exposed public methods
	 */

	return {
		load: load,
		unload: unload
	};
})();
HF.modal.saveSearch = (function () {

	/*
	 *  Constants
	 */

	var elModal, saveBtn, saveName;



	/*
	 *  Events
	 */

	// Bind
	function _eventsBind() {
		console.log('Binding modal events');

		saveBtn = elModal.find('#save-confirm');
		saveName = elModal.find('#save_search');

		saveName.on('keyup', function(e) {
			var elValue = $(this).val();

			if ( elValue.trim().length > 2 ) {
				saveBtn.removeClass('disabled');
			} else {
				saveBtn.addClass('disabled');
			}
		});

		saveBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ( $(this).hasClass('disabled') ) {
				return false;
			}

			_processSave();
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
		saveName.off('keyup');
		saveBtn.off('click');
		saveName = null;
		saveBtn = null;
		modalNow = '';

		return true;
	}



	/*
	 *  Private methods
	 */

	function _processSave() {
		elModal.find('.m-foot').css('display', 'none');
		elModal.addClass('loading');

		$.when(
			_saveSearch()
		).then(function(done) {
			HF.search.saved.resetCached();

			elModal.find('.m-body').html('<h3>Search was saved successfully</h3>');
			elModal.removeClass('loading');

			setTimeout(function() {
				elModal.find('.m-foot > a.m-close').trigger('click');
			}, 2000);
		});
	}


	function _saveSearch() {
		var elName = saveName.val().trim(),
			elID = HF.results.list.getData('searchId'),
			payload = {searchName: elName, searchId: elID};

		return $.ajax({
			type: 'POST',
			url: pathApi + 'horsefly/search/save',
			data: payload,
			crossDomain: true
		});
	}



	/*
	 *  Exposed public methods
	 */

	return {
		load: load,
		unload: unload
	};
})();
HF.modal.exportPDF = (function () {

	/*
	 *  Constants
	 */

	var pdfBtn, mapBtn, _pdfPath = '';



	/*
	 *  Public methods
	 */

	function load($el) {
		var loaded = $.Deferred(),
			searchId = HF.results.list.getData('searchId'),
			searchData = HF.results.list.getData('searchData'),
			filters = JSON.parse(searchData.payload.filters),
			geoPath = searchData.geo.join('/'),
			radius	= (!searchData.rad) ? 0 : searchData.rad;

		_pdfPath =
			'?sid=' + searchId +
			'&geo=' + geoPath +
			'&cur=' + searchData.cur +
			'&rad=' + radius +
			'&male=' + filters.male +
			'&female=' + filters.female +
			'&yoe0=' + filters.yoe0 +
			'&yoe1=' + filters.yoe1 +
			'&yoe2=' + filters.yoe2;

		$.when(
			_eventsBind($el)
		).then(function(binded) {
			loaded.resolve(binded);
		});

		return loaded.promise();
	}


	function unload() {
		pdfBtn.off('click');
		mapBtn.off('change');
		_pdfPath = '';
		modalNow = '';

		pdfBtn = null;
		mapBtn = null;

		return true;
	}



	/*
	 *  Private methods
	 */

	function _getCanvas() {
		var isReady = $.Deferred();

		html2canvas( $('#map').get(0), {
			useCORS: true,
			ignoreElements: function(element) {
				return element.className === 'mapboxgl-control-container';
			}
		}).then(function(canvas) {
			isReady.resolve(canvas);
		});

		return isReady.promise();
	}


	function _b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);

			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		var blob = new Blob(byteArrays, {type: contentType});

		return blob;
	}


	function _eventsBind($el) {
		pdfBtn = $el.find('#make-pdf-preview');
		mapBtn = $('#add-mapdata');

		if ( !window.hasEthnicity ) {
			$('#add-chart-ethnicity').prop('checked', false);
		}

		mapBtn.on('change', function(e) {
			$('span.warning').toggleClass('show', this.checked);
		});

		pdfBtn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var checkbox = $el.find('input[name="addToPDF"]'),
				targetUrl = 'pdf_report.html' + _pdfPath;

			checkbox.each(function () {
				var isChecked = ( $(this).prop('checked') ) ? '=1' : '=0';

				targetUrl += '&' + $(this).val() + isChecked;
			});

			// Map Results option is checked
			if ( mapBtn.prop('checked') ) {
				$.when(
					_getCanvas()
				).then(function(canvas) {

					document.body.appendChild(canvas);

					// Extract base64 from canvas element
					var imageURL = canvas.toDataURL('image/png');
					// Split base64 string in data and contentType
					var block = imageURL.split(';');
					// Get the content type
					var contentType = block[0].split(':')[1];
					// Get the real base64 content of the file
					var realData = block[1].split(',')[1];

					// Convert to blob
					var blob = _b64toBlob(realData, contentType);

					// Create a FormData and append searchId and file data
					var fileData = new FormData();
					fileData.append('searchId', HF.results.list.getData('searchId'));
					fileData.append('map', blob);

					console.log('Map file data: ', fileData);

					$.ajax({
						type: 'POST',
						url: pathApi + 'horsefly/renderMap',
						data: fileData,
						crossDomain: true,
						contentType: false,
						processData: false,
						async: false,
						cache: false,
						complete: function(data) {
							window.open(targetUrl, '');
						}
					});
				});
			} else {
				window.open(targetUrl, '');
			}
		});

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