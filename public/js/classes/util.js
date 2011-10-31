/**
* Utility class. These are commonly used functions that 
* help support the other classes. 
*
* @author Pete Fredricks
*
**/
(function($) {
	
	var Util = function() {
		this.deferreds = [];
	};

	Util.prototype = {

		/**
		 * Truncates a string to a give number of chars. 
		 * 
		 * @author Matt Null / Pete Fredricks
		 * @param {string} str
		 * @param {int} len
		 */	
		trim: function(str, len) {

			len = len || 16;
			str = String(str);

			return str.substr(0, len-1) + ((str.length > len) ? '...' : '');
		},

		/**
		 * Returns all the different types, including null, date, and array.
		 * 
		 * @author Pete Fredricks
		 * @param {any} obj
		 */	
		whatIs: function(obj) {
			
			if (obj instanceof Array) return "array";	
			if (obj instanceof Date) return "date";
			if (obj instanceof $) return "jquery";
			if (obj === null) return "null";
			
			// Backbone.js helpers
			if (Backbone) {
				if (obj instanceof Backbone.Model) return "model";
				if (obj instanceof Backbone.View) return "view";
				if (obj instanceof Backbone.Collection) return "collection";
			}
			
			if ((typeof(HTMLElement) === "object" && obj instanceof HTMLElement) ||
				(typeof(obj) === "object" && obj.nodeType === 1 && typeof(obj.nodeName) === "string")) return 'element';
			
			
			return typeof(obj);	
		},
				
		/**
		 * Randomly generate a unique ID
		 * @author Pete Fredricks
		 */
		newUID: function(len) {
			len = len || 5;
			
			var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			var alphaLen = alpha.length;
			var uid = [];
			var c;
			
			for (var x = 0; x < len; x++){
			   c = alpha.charAt(Math.floor(Math.random() * alphaLen));
			   uid.push((Math.random() > .5) ? c : c.toLowerCase());
			}
			
			return uid.join("");
		},	

		/**
		 * This is a wrapper for commonly used ajax requests. 
		 * 
		 * @author Pete Fredricks
		 */	
		update: function(oArgs) {

			oArgs = oArgs || {};			
			var data = oArgs.data || {};
			var url = oArgs.url || target.attr("sg-path");			
			var containers = (oArgs.parent) ? oArgs.parent : oArgs.target;
			var self = this;
				
			this.showLoading(containers);

			return $.ajax({
				url: url,
				data: data,
				method: "GET",
				dataType: "json",
				complete: function() {
					self.hideLoading(containers);
				}
			});
		},
		
		showLoading: function(elmts, advanced) {
			if (!advanced) {
				elmts.addClass("loader")
			}
		},
		
		hideLoading: function(elmts, advanced) {
			if (!advanced) {
				elmts.removeClass("loader")
			}
		},
		
		/**
		 * Simple number rounder.
		 * @author Pete Fredricks
		 */
		round: function(value, dec) {
			return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
		},
	
		oppositeDay: function oppositeDay(value) {

			switch(value) {
				case 'left':return 'right';
				case 'right':return 'left';
				case 'top':return 'bottom';
				case 'bottom':return 'top';
				case 'open':return 'close';
				case 'close':return 'open';
			}

			if (typeof(value) == 'number') {
				return value * -1;
			}

			return value;
		},
		
		getHeight: function(el) {
			
			var temp = el.clone();
			
			temp.css({
				position: 'absolute',
				top: -5000,
				left: -5000
			})
			.appendTo('body');
			
			var height = temp.height();
			
			temp.remove();
			
			return height;
		}
	};

	/**
	* The Format class contains methods for formatting numbers and dates.  
	*
	* @author Pete Fredricks
	**/
	var Format = function() {};
	
	Format.prototype = (function() {		
		
		// constants for the formatDate method
		var _days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
		var _months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];			
	
		/**
		 * Format numbers based on a VB string.
		 * 
		 * @param {number} value Number to be formatted
		 * @param {string} format VB format string
		 */
		function formatNumber(value, format) {

			if (isNaN(value)) {
				return value;
			}

			value = Number(value);
			var type = 'default';

			if (format instanceof Array) {

				if (value == 0 && format.length > 2 && format[2]) {
					return format[2];
				} 
				else if (value < 0 && format.length > 1 && format[1]) {
					format = format[1];
					type = 'neg';
				} 
				else {
					format = format[0];
				}
			}

			var parsedFormat = format.match(/([^#0]*)([#0][#0,]*)(\.?)([#0]*)([\s\S]*)/);

			var headFormat = parsedFormat[1];  // Prepended string
			var leftFormat = parsedFormat[2];  // Format to left of decimal place
			var rightFormat = parsedFormat[4]; // Format to right of decimal place
			var tailFormat = parsedFormat[5];  // Appended string

			var negative = (value < 0);

			if (negative) {
				value *= -1;			
			} 

			var reComma = /,/g;
			var showCommas = reComma.test(leftFormat);

			if (showCommas)	{
				leftFormat = leftFormat.replace(reComma, '');
				reComma.lastIndex = 0;
			}

			var isPercentage = /^\s*%/.test(tailFormat);

			if (isPercentage) {
				value *= 100;
			}

			var magSuffixes = tailFormat.match(/^\s*\[([\w\s\\|]+)\]/);
			var magBase = 1000, suffix = '';

			if (magSuffixes) {

				if (value) {
					magSuffixes = magSuffixes[1];

					if (magSuffixes.toLowerCase() == 'bytes') {
						magSuffixes = ['b','KB','MB','GB','TB','PB','EB','ZB'];
						magBase = 1024;
					} 
					else {
						magSuffixes = magSuffixes.split('|');
					}
					var mag = Math.floor(Math.log(value) / Math.log(magBase));
					mag = Math.max(0, Math.min(magSuffixes.length - 1, mag));
					suffix = magSuffixes[mag];

					if (suffix.length) {
						value /= Math.pow(magBase, mag);
					}
				}
				tailFormat = tailFormat.replace(/\[([\w\s|]+)\]/, suffix);
			}

			var unescape = /\\([\s\S])/g;
			tailFormat = tailFormat.replace(unescape, '$1');
			headFormat = headFormat.replace(unescape, '$1');

			// The minimum number of digits to left of decimal (we pad with zeros)
			var leftFixed = leftFormat.match(/0*$/)[0].length;

			parsedFormat = rightFormat.match(/^(0*)#*/);
			var rightAllowed = parsedFormat[0].length; // The maximum number of digits to right of decimal (we round here)
			var rightFixed = parsedFormat[1].length; // The minimum number of digits to right of decimal (we pad with zeros)

			// Perform any rounding and pad right with zeros
			value = value.toFixed(rightAllowed);

			// Prepended string
			var result = [ headFormat ];

			// Left of decimal
			var leftValue = parseInt("0"+value, 10).toString();

			if (leftValue == '0' && leftFixed < 1) {
				leftValue = '';
			} 
			else {
				while (leftValue.length < leftFixed) {
					leftValue = '0' + leftValue;
				}

				if (showCommas) {
					var reCommatize = /(\d+)(\d{3}[\d,]*)$/g;
					while (reCommatize.test(leftValue)) {
						leftValue = leftValue.replace(reCommatize, '$1,$2');
						reCommatize.lastIndex=0;
					}
				}
			}
			result.push(negative && type != 'neg' ? '-' : '', leftValue);

			// Decimal point plus digits to right of decimal
			if (rightFixed > 0 || (rightAllowed > 0 && (value % 1) != 0)) {
				var rightValue = String(value).match(/\.\d*$/)[0];

				if (rightFixed < rightAllowed) {
					rightValue = rightValue.replace(new RegExp('0{0,' + (rightAllowed - rightFixed) + '}$'), '');
				}
				result.push(rightValue);
			}

			// Appended string
			result.push(tailFormat);

			return result.join('');
		}

		/**
		 * Format dates based on a VB string.
		 * 
		 * @param {date/string} value Date to be formatted 
		 * @param {string} format VB Format string
		 */
		function formatDate(value, format) {

			// if value is a string, convert it to a data object
			if (!(value instanceof Date)) {
				value = new Date(value);
			}		

			// Looking for AM/PM in the format string
			var hasAMPM = /A(M?)\/?P\1/i.test(format);
			// Splitting the format string into an array of tokens 
			var nextToken = /^(?:([DM])\1{0,3}|(?:Y{4}|YY?)|([WHNS])\2?|Q|(A)(M?)\/?P\4|\\?([^\\]))/i;  	

			function fixCase(value, token) {
				var checkCase = /^(?:([MD]+)|([md]+))$/;
				var result = token.match(checkCase);

				if (!result) return value;
				if (result[1]) return value.toUpperCase();

				return value.toLowerCase();
			}

			var parsedToken, curVal, result = [];

			// this will loop through all the matching regex statements
			while (parsedToken = format.match(nextToken)) {

				if (parsedToken[5]) { // Raw text case
					result.push(parsedToken[5]);
				} 
				else if (parsedToken[3]) { // Ante/Post Meridiem (a/p | A/P | am/pm | AM/PM)
					if (value.getHours() < 12) { 
						curVal = 'a' + parsedToken[4];
					} 
					else {
						curVal = 'p' + parsedToken[4];
					}
					result.push(parsedToken[3] == 'A' ? curVal.toUpperCase() : curVal.toLowerCase());
				} 
				else {
					parsedToken = parsedToken[0];

					switch (parsedToken.toLowerCase()) {

						case 'd': // Single digit day (1 - 31)
							result.push(value.getDate());
							break;

						case 'dd': // Two digit day (01 - 31)
							curVal = value.getDate();
							if (curVal < 10) result.push('0');
							result.push(curVal);
							break;

						case 'ddd': // Abbreviated day (Sun - Sat)
							result.push(fixCase(_days[value.getDay()].substring(0, 3), parsedToken));
							break;

						case 'dddd': // Full day (Sunday - Saturday)
							result.push(fixCase(_days[value.getDay()], parsedToken));
							break;

						case 'm': // Single digit month (1 - 12)
							result.push(value.getMonth() + 1);
							break;

						case 'mm': // Two digit month (01 - 12)
							curVal = value.getMonth() + 1;
							if (curVal < 10) result.push('0');
							result.push(curVal);
							break;

						case 'mmm': // Abbreviated month (Jan - Dec)
							result.push(fixCase(_months[value.getMonth()].substring(0, 3), parsedToken));
							break;

						case 'mmmm': // Full month (January - December)
							result.push(fixCase(_months[value.getMonth()], parsedToken));
							break;

						case 'y': // Day of the year (1 - 366)
							curVal = new Date(value.getFullYear(), 0, 1);
							result.push(Math.ceil((value - curVal) / 86400000) + 1);
							break;

						case 'yy': // Two digit year (00 - 99)
							curVal = value.getFullYear().toString();
							result.push(curVal.substring(curVal.length - 2));
							break;

						case 'yyyy': // Four digit year (100 - 9666)
							result.push(value.getFullYear());
							break;

						case 'w': // Day of the week (1 - 7)
							result.push(value.getDay() + 1);
							break;

						case 'ww': // Week of the year (1 - 53)
							curVal = new Date(value.getFullYear(), 0, 1);
							result.push(Math.ceil(((value - curVal) / 86400000 + curVal.getDay() + 1) / 7));
							break;

						case 'h': // Single digit (0 - 23)
							curVal = value.getHours();
							if (hasAMPM) {
								if (curVal == 0) {
									curVal = 12;
								} 
								else if (curVal > 12) {
									curVal -= 12;
								}
							}
							result.push(curVal);
							break;

						case 'hh': // Two digit (00 - 23)
							curVal = value.getHours();
							if (hasAMPM) {
								if (curVal == 0) {
									curVal = 12;
								} 
								else if (curVal > 12) {
									curVal -= 12;
								}
							}
							if(curVal < 10) result.push('0');
							result.push(curVal);
							break;

						case 'n': // Single digit (0 - 59)
							result.push(value.getMinutes());
							break;

						case 'nn': // Two digit (00 - 59)
							curVal = value.getMinutes();
							if (curVal < 10) result.push('0');
							result.push(curVal);
							break;

						case 's': // Single digit (0 - 59)
							result.push(value.getSeconds());
							break;

						case 'ss': // Two digit second (00 - 59)
							curVal = value.getSeconds();
							if (curVal < 10) result.push('0');
							result.push(curVal);
							break;

						case 'q': // Quarter of the year (1 - 4)
							result.push(Math.floor(value.getMonth() / 3) + 1);
							break;

						default:
							result.push(parsedToken);
					}
				}

				format = format.replace(nextToken, '');
			}

			return result.join('');
		}
		
		return {
			formatNumber: formatNumber,
			formatDate: formatDate
		}
	})();	

	/**
	* The Array class contains methods for manipulating arrays.  
	*
	* @author Matt Null / Pete Fredricks
	**/
	var ArrayClass = function() {};
   
	ArrayClass.prototype = {

		unique: function unique(arr) {

			// loop through elements of array
			for (var i=0, len=arr.length; i<len; i++) {
				currentEl = arr[i]

				// loop through the array again looking for matches
				for (var j=i+1; j<len; j++) {

					// if the current element matches another element of the array...
					if (currentEl === arr[j]) {
						// delete element and save new array length
						len = this.remove(arr, j)
					}
				}
			}

			return arr;
		},
		
		compare: function compare(a, b) {
			
			if (!a || !b) {
				return false;
			}
			
			var len = a.length;
			
			if (len != b.length) { 
				return false; 
			}
			
			var aTest = a.sort();
			var bTest = b.sort();
				
			for (var i = 0; i < len; i++) {
				
				if (aTest[i] !== bTest[i]) { 
					return false;
				}
			}
			
			return true;
		},

		union:  function union() {
			var newArr = [],
			len = arguments.length, 
			arg;

			for (var i=0; i<len; i++) {			

				arg = arguments[i];

				if (arg instanceof Array) {

					for (var k=0, l=arg.length; k<l; k++) {

						newArr = newArr.concat(this.union(arg[k]));
					}
				}
				else {
					newArr.push(arg)
				}
			}
			return this.unique(newArr);
		},

		/**
		 * Removes an element from an array.
		 * 
		 *  @author John Resig (MIT Licensed)
		 */
		remove: function remove(array, from, to) {
			var rest = array.slice((to || from) + 1 || array.length);
			array.length = from < 0 ? array.length + from : from;

			return array.push.apply(array, rest);
		}
	}	

	/**
	* The Serializer class contains methods for creating and parsing JSON, 
	* as well as encoding and decoding with base64.  
	*
	* @author Pete Fredricks
	**/
	var Serializer = function() {};
	
	Serializer.prototype = (function() {		
		
		var sBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";	
		
		/**
		 * This converts characters (usually passed in via regex) into unicode.
		 * 
		 * @param {string} str
		 */
		function unicodeEscape(str) {
			
			var dec = str.charCodeAt(0),
				hexStr = ["\\u"],
				hexVals = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' ],
				hexPlaces = [4096, 256, 16, 1],
				place;

			for (var i = 0; i < 4; i++) {
				place = hexPlaces[i];
				hexStr.push(hexVals[Math.floor(dec / place)]);
				dec = dec % place;
			}

			return hexStr.join("");
		}
		
		/**
		 * This escapes bad chars and adds double quotes to any string. 
		 * 
		 * @param {string} str
		 */
		function quoteString(str) {

			return ['"', str.replace(/[^ -~]|[\"\\]/g, unicodeEscape), '"'].join("");
		}

		/**
		 * This takes your object and turns it into a JSON string.
		 * 
		 * @param {any} obj
		 * @param {bool} encode - optional to run through b64 encode after JSON
		 * @return string
		 */
		function serialize(obj, encode) { 

			// if encode, run function again wrapped in b64 encoding
			if (encode) {
				return base64encode(serialize(obj));
			}			
			
			var type = UTIL.whatIs(obj);

			switch (type) {
				case "function": case "undefined":
					return undefined;

				case "string":
					return quoteString(obj);

				case "array":
					var ret = [];

					for (var i=0, len=obj.length; i<len; i++) {
						ret.push(serialize(obj[i]));
					}                   

					return "[" + ret.join(",") + "]";

				case "date":
					return obj.getTime();

				case "object":
					var name, val, pairs = [];

					for (var key in obj) {

						name = quoteString(key);
						val = serialize(obj[key]);

						if (val) {
							pairs.push(name + ":" + val);
						}						
					}

					return "{" + pairs.join(",") + "}";

				default:
					return String(obj);
			}
		}
		
		/**
		 * This takes your serialized string and turns it into a JS object.
		 * 
		 * @param {string} str
		 * @param {bool} decode - optional to run through b64 decode first
		 * @return object
		 */
		function deserialize(str, decode) { 
			
			if (decode) {
				str = base64decode(str);
			}
			
			return $.parseJSON(str);
		}
		
		/**
		 * Takes a string and encodes it into base64. 
		 * 
		 * @param {string} str
		 * @return string
		 */	
		function base64encode(str) {

			var i, iBits, out = [];

			for (i = 0, len = str.length; i < len; i += 3) {

				iBits = (str.charCodeAt(i) << 16) +
					((str.charCodeAt(i + 1) & 0xff) << 8) +
					(str.charCodeAt(i + 2) & 0xff);

				out.push(sBase64.charAt(iBits >> 18 & 0x3f));
				out.push(sBase64.charAt(iBits >> 12 & 0x3f));
				out.push((i > str.length - 2) ? "=" : sBase64.charAt(iBits >> 6 & 0x3f));
				out.push((i > str.length - 3) ? "=" : sBase64.charAt(iBits & 0x3f));
			}

			return out.join("");
		}
		
		/**
		 * Takes a base64 encoded string and decodes it. 
		 * 
		 * @param {string} str
		 * @return string
		 */		
		function base64decode(str) {

			var i, iBits, out = [];

			str = str.replace(/=/g, "");

			for (i = 0, len = str.length; i < len; i += 4) {

				iBits = (sBase64.indexOf(str.charAt(i)) << 18) |
					(sBase64.indexOf(str.charAt(i + 1)) << 12) |
					((sBase64.indexOf(str.charAt(i + 2)) & 0xff) << 6) |
					(sBase64.indexOf(str.charAt(i + 3)) & 0xff);

				out.push(String.fromCharCode(iBits >> 16 & 0xff));
				out.push((i > str.length - 3) ? "" : String.fromCharCode(iBits >> 8 & 0xff));
				out.push((i > str.length - 4) ? "" : String.fromCharCode(iBits & 0xff));
			}

			return out.join("");
		}
		
		return {
			serialize: serialize,
			deserialize: deserialize,
			base64encode: base64encode,
			base64decode: base64decode
		}
	})();	

	// this defines what's in the global util variable
	window.UTIL = $.extend(new Util(), {
		format: new Format(),
		array: new ArrayClass(),	
		serializer: new Serializer()
	});

})(jQuery);