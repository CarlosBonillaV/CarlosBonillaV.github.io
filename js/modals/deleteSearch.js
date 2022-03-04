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