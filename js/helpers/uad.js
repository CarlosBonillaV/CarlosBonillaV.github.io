(function (global) {

	/*
	 *  Constants
	 */

	var CONSOLE		= 'console',
		EMBEDDED	= 'embedded',
		MOBILE		= 'mobile',
		MODEL		= 'model',
		NAME		= 'name',
		SMARTTV		= 'smarttv',
		TABLET		= 'tablet',
		TYPE		= 'type',
		VENDOR		= 'vendor',
		VERSION		= 'version',
		WEARABLE	= 'wearable';


	/*
	 *  Utils
	 */

	var utils = {
		has : function (str1, str2) {
			if (typeof str1 === 'string') {
				return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
			} else {
				return false;
			}
		},
		lowerize : function (str) {
			return str.toLowerCase();
		},
		trim : function (str) {
			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		}
	};


	/*
	 *  Map helper
	 */

	var mapper = {
		rgx : function (ua, arrays) {
			var i = 0, j, k, p, q, matches, match;	//, args = arguments;

			// loop through all regexes maps
			while (i < arrays.length && !matches) {
				var regex = arrays[i],				// even sequence (0,2,4,..)
					props = arrays[i + 1];			// odd sequence (1,3,5,..)
				j = k = 0;

				// try matching uastring with regexes
				while (j < regex.length && !matches) {

					matches = regex[j++].exec(ua);

					if (!!matches) {
						for (p = 0; p < props.length; p++) {
							match = matches[++k];
							q = props[p];
							// check if given property is actually array
							if (typeof q === 'object' && q.length > 0) {
								if (q.length === 2) {
									if (typeof q[1] === 'function') {
										// assign modified match
										this[q[0]] = q[1].call(this, match);
									} else {
										// assign given value, ignore regex match
										this[q[0]] = q[1];
									}
								} else if (q.length === 3) {
									// check whether function or regex
									if (typeof q[1] === 'function' && !(q[1].exec && q[1].test)) {
										// call function (usually string mapper)
										this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
									} else {
										// sanitize match using given regex
										this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
									}
								} else if (q.length === 4) {
										this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
								}
							} else {
								this[q] = match ? match : undefined;
							}
						}
					}
				}
				i += 2;
			}
		},

		str : function (str, map) {
			for (var i in map) {
				// check if array
				if (typeof map[i] === 'object' && map[i].length > 0) {
					for (var j = 0; j < map[i].length; j++) {
						if (utils.has(map[i][j], str)) {
							return (i === '?') ? undefined : i;
						}
					}
				} else if (utils.has(map[i], str)) {
					return (i === '?') ? undefined : i;
				}
			}
			return str;
		}
	};


	/*
	 *  String map
	 */

	var maps = {

		browser : {
			oldsafari : {
				version : {
					'1.0'   : '/8',
					'1.2'   : '/1',
					'1.3'   : '/3',
					'2.0'   : '/412',
					'2.0.2' : '/416',
					'2.0.3' : '/417',
					'2.0.4' : '/419',
					'?'     : '/'
				}
			}
		},

		device : {
			amazon : {
				model : {
					'Fire Phone' : ['SD', 'KF']
				}
			},
			sprint : {
				model : {
					'Evo Shift 4G' : '7373KT'
				},
				vendor : {
					'HTC'       : 'APA',
					'Sprint'    : 'Sprint'
				}
			}
		},

		os : {
			windows : {
				version : {
					'ME'        : '4.90',
					'NT 3.11'   : 'NT3.51',
					'NT 4.0'    : 'NT4.0',
					'2000'      : 'NT 5.0',
					'XP'        : ['NT 5.1', 'NT 5.2'],
					'Vista'     : 'NT 6.0',
					'7'         : 'NT 6.1',
					'8'         : 'NT 6.2',
					'8.1'       : 'NT 6.3',
					'10'        : ['NT 6.4', 'NT 10.0'],
					'RT'        : 'ARM'
				}
			}
		}
	};


	/*
	 *  Regex map
	 */

	var regexes = {

		browser : [[
			// Presto based
			/(opera\smini)\/([\w\.-]+)/i,										// Opera Mini
			/(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,						// Opera Mobi/Tablet
			/(opera).+version\/([\w\.]+)/i,										// Opera > 9.80
			/(opera)[\/\s]+([\w\.]+)/i											// Opera < 9.80
			], [NAME, VERSION], [

			/(opios)[\/\s]+([\w\.]+)/i											// Opera mini on iphone >= 8.0
			], [[NAME, 'Opera Mini'], VERSION], [

			/\s(opr)\/([\w\.]+)/i												// Opera Webkit
			], [[NAME, 'Opera'], VERSION], [

			// Mixed
			/(kindle)\/([\w\.]+)/i,												// Kindle
			/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,	// Lunascape/Maxthon/Netfront/Jasmine/Blazer

			// Trident based
			/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,		// Avant/IEMobile/SlimBrowser/Baidu
			/(?:ms|\()(ie)\s([\w\.]+)/i,										// Internet Explorer

			// Webkit/KHTML based
			/(rekonq)\/([\w\.]+)*/i,											// Rekonq
			/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser)\/([\w\.-]+)/i
																				// Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser
			], [NAME, VERSION], [

			/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i							// IE11
			], [[NAME, 'IE'], VERSION], [

			/(edge)\/((\d+)?[\w\.]+)/i											// Microsoft Edge
			], [NAME, VERSION], [

			/(yabrowser)\/([\w\.]+)/i											// Yandex
			], [[NAME, 'Yandex'], VERSION], [

			/(puffin)\/([\w\.]+)/i												// Puffin
			], [[NAME, 'Puffin'], VERSION], [

			/((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i			// UCBrowser
			], [[NAME, 'UCBrowser'], VERSION], [

			/(comodo_dragon)\/([\w\.]+)/i										// Comodo Dragon
			], [[NAME, /_/g, ' '], VERSION], [

			/(micromessenger)\/([\w\.]+)/i										// WeChat
			], [[NAME, 'WeChat'], VERSION], [

			/m?(qqbrowser)[\/\s]?([\w\.]+)/i									// QQBrowser
			], [NAME, VERSION], [

			/xiaomi\/miuibrowser\/([\w\.]+)/i									// MIUI Browser
			], [VERSION, [NAME, 'MIUI Browser']], [

			/;fbav\/([\w\.]+);/i												// Facebook App for iOS & Android
			], [VERSION, [NAME, 'Facebook']], [

			/(headlesschrome) ([\w\.]+)/i										// Chrome Headless
			], [VERSION, [NAME, 'Chrome Headless']], [

			/\swv\).+(chrome)\/([\w\.]+)/i										// Chrome WebView
			], [[NAME, /(.+)/, '$1 WebView'], VERSION], [

			/((?:oculus|samsung)browser)\/([\w\.]+)/i
			], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [				// Oculus / Samsung Browser

			/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i		// Android Browser
			], [VERSION, [NAME, 'Android Browser']], [

			/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i		// Chrome/OmniWeb/Arora/Tizen/Nokia
			], [NAME, VERSION], [

			/(dolfin)\/([\w\.]+)/i												// Dolphin
			], [[NAME, 'Dolphin'], VERSION], [

			/((?:android.+)crmo|crios)\/([\w\.]+)/i								// Chrome for Android/iOS
			], [[NAME, 'Chrome'], VERSION], [

			/(coast)\/([\w\.]+)/i												// Opera Coast
			], [[NAME, 'Opera Coast'], VERSION], [

			/fxios\/([\w\.-]+)/i												// Firefox for iOS
			], [VERSION, [NAME, 'Firefox']], [

			/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i						// Mobile Safari
			], [VERSION, [NAME, 'Mobile Safari']], [

			/version\/([\w\.]+).+?(mobile\s?safari|safari)/i					// Safari & Safari Mobile
			], [VERSION, NAME], [

			/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i						// Safari < 3.0
			], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

			/(konqueror)\/([\w\.]+)/i,											// Konqueror
			/(webkit|khtml)\/([\w\.]+)/i
			], [NAME, VERSION], [

			// Gecko based
			/(navigator|netscape)\/([\w\.-]+)/i									// Netscape
			], [[NAME, 'Netscape'], VERSION], [
			/(swiftfox)/i,														// Swiftfox
			/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
																				// IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
			/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
																				// Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
			/(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,							// Mozilla

			// Other
			/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
																				// Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
			/(links)\s\(([\w\.]+)/i,											// Links
			/(gobrowser)\/?([\w\.]+)*/i,										// GoBrowser
			/(ice\s?browser)\/v?([\w\._]+)/i,									// ICE Browser
			/(mosaic)[\/\s]([\w\.]+)/i											// Mosaic
			], [NAME, VERSION]
		],

		device : [[
			/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i							// iPad/PlayBook
			], [MODEL, VENDOR, [TYPE, TABLET]], [

			/applecoremedia\/[\w\.]+ \((ipad)/									// iPad
			], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

			/(apple\s{0,1}tv)/i													// Apple TV
			], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [

			/(archos)\s(gamepad2?)/i,											// Archos
			/(hp).+(touchpad)/i,												// HP TouchPad
			/(hp).+(tablet)/i,													// HP Tablet
			/(kindle)\/([\w\.]+)/i,												// Kindle
			/\s(nook)[\w\s]+build\/(\w+)/i,										// Nook
			/(dell)\s(strea[kpr\s\d]*[\dko])/i									// Dell Streak
			], [VENDOR, MODEL, [TYPE, TABLET]], [

			/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i								// Kindle Fire HD
			], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
			/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i					// Fire Phone
			], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [

			/\((ip[honed|\s\w*]+);.+(apple)/i									// iPod/iPhone
			], [MODEL, VENDOR, [TYPE, MOBILE]], [
			/\((ip[honed|\s\w*]+);/i											// iPod/iPhone
			], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

			/(blackberry)[\s-]?(\w+)/i,											// BlackBerry
			/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
																				// BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
			/(hp)\s([\w\s]+\w)/i,												// HP iPAQ
			/(asus)-?(\w+)/i													// Asus
			], [VENDOR, MODEL, [TYPE, MOBILE]], [
			/\(bb10;\s(\w+)/i													// BlackBerry 10
			], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
																				// Asus Tablets
			/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone)/i
			], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

			/(sony)\s(tablet\s[ps])\sbuild\//i,									// Sony
			/(sony)?(?:sgp.+)\sbuild\//i
			], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
			/android.+\s([c-g]\d{4}|so[-l]\w+)\sbuild\//i
			], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [

			/\s(ouya)\s/i,														// Ouya
			/(nintendo)\s([wids3u]+)/i											// Nintendo
			], [VENDOR, MODEL, [TYPE, CONSOLE]], [

			/android.+;\s(shield)\sbuild/i										// Nvidia
			], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

			/(playstation\s[34portablevi]+)/i									// Playstation
			], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

			/(sprint\s(\w+))/i													// Sprint Phones
			], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

			/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i							// Lenovo tablets
			], [VENDOR, MODEL, [TYPE, TABLET]], [

			/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,								// HTC
			/(zte)-(\w+)*/i,													// ZTE
			/(alcatel|geeksphone|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
																				// Alcatel/GeeksPhone/Lenovo/Nexian/Panasonic/Sony
			], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

			/(nexus\s9)/i														// HTC Nexus 9
			], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

			/d\/huawei([\w\s-]+)[;\)]/i,
			/(nexus\s6p)/i														// Huawei
			], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [

			/(microsoft);\s(lumia[\s\w]+)/i										// Microsoft Lumia
			], [VENDOR, MODEL, [TYPE, MOBILE]], [

			/[\s\(;](xbox(?:\sone)?)[\s\);]/i									// Microsoft Xbox
			], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
			/(kin\.[onetw]{3})/i												// Microsoft Kin
			], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

																				// Motorola
			/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,
			/mot[\s-]?(\w+)*/i,
			/(XT\d{3,4}) build\//i,
			/(nexus\s6)/i
			], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
			/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
			], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

			/hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i			// HbbTV devices
			], [[VENDOR, utils.trim], [MODEL, utils.trim], [TYPE, SMARTTV]], [

			/hbbtv.+maple;(\d+)/i
			], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [

			/\(dtv[\);].+(aquos)/i												// Sharp
			], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [

			/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
			/((SM-T\w+))/i
			], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [					// Samsung
			/smart-tv.+(samsung)/i
			], [VENDOR, [TYPE, SMARTTV], MODEL], [
			/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
			/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
			/sec-((sgh\w+))/i
			], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [

			/sie-(\w+)*/i														// Siemens
			], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

			/(maemo|nokia).*(n900|lumia\s\d+)/i,								// Nokia
			/(nokia)[\s_-]?([\w-]+)*/i
			], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

			/android\s3\.[\s\w;-]{10}(a\d{3})/i									// Acer
			], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

			/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i						// LG Tablet
			], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
			/(lg) netcast\.tv/i													// LG SmartTV
			], [VENDOR, MODEL, [TYPE, SMARTTV]], [
			/(nexus\s[45])/i,													// LG
			/lg[e;\s\/-]+(\w+)*/i
			], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

			/android.+(ideatab[a-z0-9\-\s]+)/i									// Lenovo
			], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

			/linux;.+((jolla));/i												// Jolla
			], [VENDOR, MODEL, [TYPE, MOBILE]], [

			/((pebble))app\/[\d\.]+\s/i											// Pebble
			], [VENDOR, MODEL, [TYPE, WEARABLE]], [

			/android.+;\s(oppo)\s?([\w\s]+)\sbuild/i							// OPPO
			], [VENDOR, MODEL, [TYPE, MOBILE]], [

			/crkey/i															// Google Chromecast
			], [[MODEL, 'Chromecast'], [VENDOR, 'Google']], [

			/android.+;\s(glass)\s\d/i											// Google Glass
			], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

			/android.+;\s(pixel c)\s/i											// Google Pixel C
			], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [

			/android.+;\s(pixel xl|pixel)\s/i									// Google Pixel
			], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [

			/android.+(\w+)\s+build\/hm\1/i,									// Xiaomi Hongmi 'numeric' models
			/android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,				// Xiaomi Hongmi
			/android.+(mi[\s\-_]*(?:one|one[\s_]plus|note lte)?[\s_]*(?:\d\w)?)\s+build/i	// Xiaomi Mi
			], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [

			/android.+;\s(m[1-5]\snote)\sbuild/i								// Meizu Tablet
			], [MODEL, [VENDOR, 'Meizu'], [TYPE, TABLET]], [

			/android.+a000(1)\s+build/i											// OnePlus
			], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

			/\s(tablet)[;\/]/i,													// Unidentifiable Tablet
			/\s(mobile)(?:[;\/]|\ssafari)/i										// Unidentifiable Mobile
			], [[TYPE, utils.lowerize], VENDOR, MODEL]
		],

		engine : [[
			/windows.+\sedge\/([\w\.]+)/i										// EdgeHTML
			], [VERSION, [NAME, 'EdgeHTML']], [

			/(presto)\/([\w\.]+)/i,												// Presto
			/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,		// WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
			/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,							// KHTML/Tasman/Links
			/(icab)[\/\s]([23]\.[\d\.]+)/i										// iCab
			], [NAME, VERSION], [

			/rv\:([\w\.]+).*(gecko)/i											// Gecko
			], [VERSION, NAME]
		],

		os : [[
			// Windows based
			/microsoft\s(windows)\s(vista|xp)/i									// Windows (iTunes)
			], [NAME, VERSION], [
			/(windows)\snt\s6\.2;\s(arm)/i,										// Windows RT
			/(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s]+\w)*/i,					// Windows Phone
			/(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
			], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
			/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
			], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

			// Mobile/Embedded OS
			/\((bb)(10);/i														// BlackBerry 10
			], [[NAME, 'BlackBerry'], VERSION], [
			/(blackberry)\w*\/?([\w\.]+)*/i,									// Blackberry
			/(tizen)[\/\s]([\w\.]+)/i,											// Tizen
			/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
																				// Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
			/linux;.+(sailfish);/i												// Sailfish OS
			], [NAME, VERSION], [
			/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i					// Symbian
			], [[NAME, 'Symbian'], VERSION], [
			/\((series40);/i													// Series 40
			], [NAME], [
			/mozilla.+\(mobile;.+gecko.+firefox/i								// Firefox OS
			], [[NAME, 'Firefox OS'], VERSION], [

			// Console
			/(nintendo|playstation)\s([wids34portablevu]+)/i,					// Nintendo/Playstation

			// GNU/Linux based
			/(mint)[\/\s\(]?(\w+)*/i,											// Mint
			/(mageia|vectorlinux)[;\s]/i,										// Mageia/VectorLinux
			/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]+)*/i,
																				// Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
																				// Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
			/(hurd|linux)\s?([\w\.]+)*/i,										// Hurd/Linux
			/(gnu)\s?([\w\.]+)*/i												// GNU
			], [NAME, VERSION], [

			/(cros)\s[\w]+\s([\w\.]+\w)/i										// Chromium OS
			], [[NAME, 'Chromium OS'], VERSION],[

			// Solaris
			/(sunos)\s?([\w\.]+\d)*/i											// Solaris
			], [[NAME, 'Solaris'], VERSION], [

			// BSD based
			/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i					// FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
			], [NAME, VERSION],[

			/(haiku)\s(\w+)/i													// Haiku
			], [NAME, VERSION],[

			/cfnetwork\/.+darwin/i,
			/ip[honead]+(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i				// iOS
			], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [

			/(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
			/(macintosh|mac(?=_powerpc)\s)/i									// Mac OS
			], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

			// Other
			/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,							// Solaris
			/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,								// AIX
			/(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,		// Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
			/(unix)\s?([\w\.]+)*/i												// UNIX
			], [NAME, VERSION]
		]
	};


	/*
	 * Constructor
	 */

	var Browser = function (name, version) {
		this[NAME] = name;
		this[VERSION] = version;
	};
	var Device = function (vendor, model, type) {
		this[VENDOR] = vendor;
		this[MODEL] = model;
		this[TYPE] = type;
	};
	var Engine = Browser;
	var OS = Browser;

	var UAD = function (userAgentString) {

		var ua = userAgentString || ((navigator && navigator.userAgent) ? navigator.userAgent : '');
		var browser = new Browser();
		var device = new Device();
		var engine = new Engine();
		var os = new OS();

		this.getBrowser = function () {
			mapper.rgx.call(browser, ua, regexes.browser);
			return browser;
		};
		this.getDevice = function () {
			mapper.rgx.call(device, ua, regexes.device);
			return device;
		};
		this.getEngine = function () {
			mapper.rgx.call(engine, ua, regexes.engine);
			return engine;
		};
		this.getOS = function () {
			mapper.rgx.call(os, ua, regexes.os);
			return os;
		};

		return {
			ua      : ua,
			browser : this.getBrowser(),
			engine  : this.getEngine(),
			os      : this.getOS(),
			device  : this.getDevice()
		};
	};

	if (typeof window !== 'undefined') {
		var temp = new UAD();
		window.uad = temp;
	}

})(this);