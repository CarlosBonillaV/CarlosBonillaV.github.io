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