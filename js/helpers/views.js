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