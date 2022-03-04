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