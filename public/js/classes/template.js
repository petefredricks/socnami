/**
 * Client-side generation of markup from templates.  Templates are written using a classic ASP/JScript syntax.
 *
 * @auther Pete Fredricks
 */

SGAPI.TemplateManager = (function($) {

	var templateRoot = '',
		debugging = false,
		loadedTemplates = {},
		loadedTemplatePaths = {}

	function setRoot(root) {templateRoot = root;}
	function setDebug(debug) {debugging = !!debug;}

	/**
	 * This function draws the template using the data (obj) that you pass to it.
	 *
	 * @param {string} name
	 * @param {obj} obj
	 * @param {any} context
	 */
	function fillTemplate(name, obj, context) {
		var tmpl = loadedTemplates[name];

		if (typeof tmpl != 'function') {
			console.warn('Unable to locate template! (' + name + ')');
			return null;
		}

		obj = [].concat(obj || null);
		var res = [];

		for (var i = 0, len = obj.length; i < len; i++) {

			res.push(tmpl.call(context || null, obj[i] || null, {
				array: obj,
				index: i,
				iteration: i + 1,
				count: len,
				first: i == 0,
				last: i == (len - 1),
				odd: !(i % 2)
			}));
		}

		return res.join('');
	}

	/**
	 * This function takes template files (either by ajax "paths" or string "files")
	 * and turns them into individiual templates.
	 *
	 * @param {obj} oArgs
	 */
	function loadTemplates(oArgs) {

		var paths = oArgs.paths ? [].concat(oArgs.paths) : [],
			files = oArgs.files ? [].concat(oArgs.files) : [],
			pathLength = paths.length,
			fileLength = files.length,
			total = pathLength + fileLength,
			totalLoaded = 0;

		var self = this,
			path, file;

		// this loop checks to see it the specified path has been loaded already
		// "loadedTemplatePaths" can either be undefined, jqXHR object, or true;
		for (var i = 0; i < pathLength; i++) {
			path = templateRoot + paths[i];

			if (!loadedTemplatePaths[path]) { // NOT REQUESTED					

				// use ajax to get template, and set jqXHR obj
				loadedTemplatePaths[path] = $.get(path, {rand: Math.random()}, templateLoaded);

				if (debugging) console.log('Loading:', path);
			}
			else if (loadedTemplatePaths[path].readyState) { // REQUESTED BUT NOT LOADED (jqXHR)					

				// add the callback to jqXHR object
				loadedTemplatePaths[path].success(function() {
					templateLoaded.call({url:path, fromCache:true});
				});
			}
			else { // ALREADY LOADED

				templateLoaded.call({url:path, fromCache:true});
			}
		}

		// load all the template strings (files)
		for (var k = 0; k < fileLength; k++) {
			file = files[k];
			templateLoaded(file);
		}

		function templateLoaded(result) {

			if (!this.fromCache) {
				// Split the results into individual templates, grabing the name and template body for each
				$.each(result.split(/\s*<!--\s+#template\s+/i), function() {

					// This regex separates the template name from the body
					var match = /^\s*name\s*=\s*"([\w-\.]+)"\s*-->\s*([\S\s]*)$/i.exec(this);

					if (match) {
						self.registerTemplate(match[1], match[2]);
					}
				});
			}

			if (this.url) {
				this.url = this.url.replace(/\??rand=[\d\.]+$/, '');
				loadedTemplatePaths[this.url] = true; // set path to loaded

				if (debugging) console.log('Loaded' + (this.fromCache ? ' (from cache)' : '')+':', this.url);
			}

			// call onload when all templates have been loaded
			if (++totalLoaded >= total && oArgs.onload) {

				if (typeof oArgs.onload == "string") {
					oArgs.onload = oArgs.context[oArgs.onload];
				}
				oArgs.onload.call(oArgs.context, oArgs.data);
			}
		}
	}

	/**
	 * This function parses the templates and turns the scripting language (JScript)
	 * into working javascript.
	 *
	 * @param {string} name
	 * @param {string} template (as a string)
	 */
	function registerTemplate(name, template) {

		loadedTemplates[name] = buildTemplate(template);

		if (debugging) {
			console.log('TemplateManager.registerTemplate: ' + name);
			console.log(loadedTemplates[name].toString());
		}

		function buildTemplate(str) {
			
			// Convert the template into a function
			try {
				return new Function("data, iterator", [
					"var p=[],",
						"print=function(){p.push.apply(p, arguments);},",
						"printTemplate=function(){p.push(SGAPI.TemplateManager.fillTemplate.apply(SGAPI.TemplateManager,arguments));},",
						"fillTemplate=function(){return SGAPI.TemplateManager.fillTemplate.apply(SGAPI.TemplateManager,arguments);};",

					// Convert the template string into pure JavaScript
					"try{p.push('",
					str
						.replace(/[\r\t\n]/g, " ")			// remove any tabs, returns, and new lines (we need them as placeholders)
						.replace(/<%/g, "\t")				// replace ASP open tags with a "tab" (as a placeholder)
						.replace(/((^|%>)[^\t]*(\t|$))/g,	// find all chars that don't fall between ASP tags (html and text)
							function(s){
								return s
									.replace(/\'/g, "\r")	// replace single quotes with "return" (as a placeholder) 
									.replace(/\\/g, "\n");	// replace backslashes with "new line" (as a placeholder) 
							})
						.replace(/\t=(.*?)%>/g, "',$1,'")	// lines with ASP write shortcut (=), just add JS variable to array
						.replace(/\t/g, "');")				// replace "tab" with close push string
						.replace(/%>/g, "p.push('")			// replace ASP close tags with open push string
						.replace(/\r/g, "\\'")				// replace "return" with safe single quotes
						.replace(/\n/g, "\\\\"),			// replace "new line" with safe backslashes
					"');}",
					"catch(e){console.warn('Template(", name, ") - ',e.toString());console.dir(data);}",
					"return p.join('');"
				].join(''));
			} 
			catch(e) {
				console.warn('Unable to parse template: ' + name, e);
				return function() { return 'Unable to parse template: ' + name + ' - ' + e.toString(); };
			}
		}
	}
	
	return {
		fillTemplate: fillTemplate,
		loadTemplates: loadTemplates,
		registerTemplate: registerTemplate,
		setRoot: setRoot,
		setDebug: setDebug
	};
	
})(SGAPI.jQuery);


// Extend the jQuery object and jQuery collections with some useful methods
SGAPI.jQuery.extend({
	fillTemplate: function(name, obj, context) {
		return SGAPI.jQuery(SGAPI.TemplateManager.fillTemplate(name, obj, context));
	},
	loadTemplates: function(args) {
		return SGAPI.TemplateManager.loadTemplates(args);
	}
});
SGAPI.jQuery.extend(SGAPI.jQuery.fn, {
	fillTemplate: function(name, obj, context) {
		this.html(SGAPI.TemplateManager.fillTemplate(name, obj, context));
		return this;
	},
	appendTemplate: function(name, obj, context) {
		this.append(SGAPI.TemplateManager.fillTemplate(name, obj, context));
		return this;
	}
});