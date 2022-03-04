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