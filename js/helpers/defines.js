var DEBUG = HF.isDev;
var pathNow	= '';
var modalNow = '';
var extNow = [];
var perspective = ['chart', 'demand'];
var sessionTimer = null;
var csvLimit = Number(window.csvLocs);
// var pathAws = ( !HF.isDev ) ? 'https://s3.eu-west-2.amazonaws.com/horsefly-web/' : 'https://s3.eu-west-2.amazonaws.com/horsefly-dev/';
// var pathAws = '/assets/horsefly/';
var pathAws = '';
var pathApi = 'http://107.21.39.157:9751/';
var $app = $('#horsefly-app');
var _country = [
	{code: 'ae', currency: 'aed'},
	{code: 'ar', currency: 'ars'},
	{code: 'au', currency: 'aud'},
	{code: 'be', currency: 'euro'},
	{code: 'bg', currency: 'bgn'},
	{code: 'br', currency: 'br'},
	{code: 'ca', currency: 'cad'},
	{code: 'ch', currency: 'chf'},
	{code: 'cl', currency: 'clp'},
	{code: 'cn', currency: 'cny'},
	{code: 'cz', currency: 'czk'},
	{code: 'de', currency: 'euro'},
	{code: 'dk', currency: 'euro'},
	{code: 'es', currency: 'euro'},
	{code: 'fi', currency: 'euro'},
	{code: 'fr', currency: 'euro'},
	{code: 'gt', currency: 'gtq'},
	{code: 'hu', currency: 'huf'},
	{code: 'ie', currency: 'euro'},
	{code: 'in', currency: 'in'},
	{code: 'it', currency: 'euro'},
	{code: 'jp', currency: 'jpy'},
	{code: 'hk', currency: 'hkd'},
	{code: 'mx', currency: 'mxn'},
	{code: 'my', currency: 'myr'},
	{code: 'nl', currency: 'euro'},
	{code: 'no', currency: 'nok'},
	{code: 'nz', currency: 'nzd'},
	{code: 'pe', currency: 'sol'},
	{code: 'ph', currency: 'ph'},
	{code: 'pl', currency: 'pln'},
	{code: 'pt', currency: 'euro'},
	{code: 'ro', currency: 'ron'},
	{code: 'ru', currency: 'rub'},
	{code: 'sa', currency: 'sar'},
	{code: 'se', currency: 'sek'},
	{code: 'sg', currency: 'sgd'},
	{code: 'sv', currency: 'dollar'},
	{code: 'ua', currency: 'uah'},
	{code: 'uk', currency: 'pound'},
	{code: 'us', currency: 'dollar'},
	{code: 'za', currency: 'zar'}
];
var _currency = [
	{id: 'euro', code: 'EUR', symbol: '€', name: 'Euro'},
	{id: 'pound', code: 'GBP', symbol: '£', name: 'British pound sterling'},
	{id: 'dollar', code: 'USD', symbol: '$', name: 'United States dollar'},
	{id: 'aed', code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates dirham'},
	{id: 'ars', code: 'ARS', symbol: '$', name: 'Argentine peso'},
	{id: 'aud', code: 'AUD', symbol: '$', name: 'Australian dollar'},
	{id: 'bgn', code: 'BGN', symbol: 'лв', name: 'Bulgarian lev'},
	{id: 'br', code: 'BRL', symbol: 'R$', name: 'Brazilian real'},
	{id: 'cad', code: 'CAD', symbol: '$', name: 'Canadian dollar'},
	{id: 'chf', code: 'CHF', symbol: 'SFr.', name: 'Swiss franc'},
	{id: 'clp', code: 'CLP', symbol: '$', name: 'Chilean peso'},
	{id: 'cny', code: 'CNY', symbol: '¥', name: 'Chinese yuan renminbi'},
	{id: 'czk', code: 'CZK', symbol: 'Kč', name: 'Czech koruna'},
	{id: 'gtq', code: 'GTQ', symbol: 'Q', name: 'Guatemalan quetzal'},
	{id: 'hkd', code: 'HKD', symbol: 'HK$', name: 'Hong Kong dollar'},
	{id: 'huf', code: 'HUF', symbol: 'Ft', name: 'Hungarian forint'},
	{id: 'in', code: 'INR', symbol: '₹', name: 'Indian rupee'},
	{id: 'jpy', code: 'JPY', symbol: '¥', name: 'Japanese yen'},
	{id: 'mxn', code: 'MXN', symbol: '$', name: 'Mexican peso'},
	{id: 'myr', code: 'MYR', symbol: 'RM', name: 'Malaysian ringgit'},
	{id: 'nok', code: 'NOK', symbol: 'kr', name: 'Norwegian krone'},
	{id: 'nzd', code: 'NZD', symbol: '$', name: 'New Zealand dollar'},
	{id: 'sol', code: 'SOL', symbol: 'S/', name: 'Peruvian Sol'},
	{id: 'ph', code: 'PHP', symbol: '₱', name: 'Philippine peso'},
	{id: 'pln', code: 'PLN', symbol: 'zł', name: 'Polish zloty'},
	{id: 'ron', code: 'RON', symbol: 'lei', name: 'Romanian leu'},
	{id: 'rub', code: 'RUB', symbol: '₽', name: 'Russian ruble'},
	{id: 'sar', code: 'SAR', symbol: 'SR', name: 'Saudi riyal'},
	{id: 'sek', code: 'SEK', symbol: 'kr', name: 'Swedish krona'},
	{id: 'sgd', code: 'SGD', symbol: 'S$', name: 'Singapore dollar'},
	{id: 'uah', code: 'UAH', symbol: '₴', name: 'Ukrainian hryvnia'},
	{id: 'zar', code: 'ZAR', symbol: 'R', name: 'South African rand'}
];