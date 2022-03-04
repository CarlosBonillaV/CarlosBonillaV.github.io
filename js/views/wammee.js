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