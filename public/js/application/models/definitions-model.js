Model.Definitions = Backbone.Model.extend({
	
	modules: {
		'facebook': { title: 'Facebook' },
		'twitter': { title: 'Twitter' },
		'grooveshark': { title: 'Grooveshark' },
		'flickr': { title: 'Flickr' },
		'dropbox': { title: 'Dropbox' },
		'tumblr': { title: 'Tumblr' }
	},
	menus: {
		'account': { text: 'Account' },
		'settings': { text: 'Settings' }, 
		'launcher': { text: 'New' }
	},
	settings: {
		'animate': { text: 'Show animation'},
		'other': { text: 'Some other setting'},
		'theme': { text: 'Change theme'}
	}
});