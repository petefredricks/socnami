MODELS.Definitions = Backbone.Model.extend({
	
	modules: {
		facebook: { title: 'Facebook' },
		twitter: { title: 'Twitter' },
		turntable: { title: 'Turntable' }
	},
	menus: {
		account: { type: 'account', text: 'Account', height: 350 },
		settings: { type: 'settings', text: 'Settings', height: 300 }, 
		launcher: { type: 'launcher', text: 'New', height: 400 }
	}
});