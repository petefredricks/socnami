Model.Definitions = Backbone.Model.extend({
	
	modules: {
		facebook: { title: 'Facebook', type: 'facebook' },
		twitter: { title: 'Twitter', type: 'twitter' },
		turntable: { title: 'Turntable', type: 'turntable' }
	},
	menus: {
		account: { type: 'account', text: 'Account' },
		settings: { type: 'settings', text: 'Settings' }, 
		launcher: { type: 'launcher', text: 'New' }
	}
});