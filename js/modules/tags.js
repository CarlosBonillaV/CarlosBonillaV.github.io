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