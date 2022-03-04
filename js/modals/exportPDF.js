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