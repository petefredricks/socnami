var assetManager = require('connect-assetmanager');
var assetHandler = require('connect-assetmanager-handlers');

var jsFiles = [
	'libraries/jquery.js',
	'libraries/jquery-ui.js',
	'libraries/jquery-cookie.js',
	'libraries/underscore.js',
	'libraries/backbone.js',
	'libraries/backbone.localstore.js',
	'libraries/highcharts.js',
	'classes/util.js',
	'classes/template.js',
	'application/application.js',
	'application/models/definitions-model.js',
	'application/models/settings-model.js',
	'application/models/account-model.js',
	'application/models/page-model.js',
	'application/models/module-model.js',
	'application/models/menu-model.js',
	'application/views/page.js',
	'application/views/menu.js',
	'application/views/module.js'
];

var cssFiles = [
	'common/reset.css',
	'common/layout.css',
	'common/menu.css',
	'common/page.css',
	'common/module.css',
	'modules/facebook.css',
	'themes/darkbeach.css'
];

var assetManagerGroups = {
	'js': {
		'route': /\/static\/js\/[0-9]+\/.*\.js/,
		'path': './public/js/',
		'dataType': 'javascript',
		'files': jsFiles
	}, 
	'css': {
		'route': /\/static\/css\/[0-9]+\/.*\.css/, 
		'path': './public/css/', 
		'dataType': 'css', 
		'files': cssFiles, 
		'preManipulate': {
			
			// Matches all (regex start line)
			'^': [
				assetHandler.yuiCssOptimize
			]
		}
	}
};

module.exports = {
	middleware: assetManager(assetManagerGroups),
	cssFiles: cssFiles,
	jsFiles: jsFiles
}