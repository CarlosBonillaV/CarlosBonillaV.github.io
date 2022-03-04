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