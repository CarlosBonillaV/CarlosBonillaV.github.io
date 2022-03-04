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