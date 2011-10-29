MODEL.Account = Backbone.Model.extend({
	
	current: 0,
	user: 'p.fred',
	pages: [{
			name: 'Home',
			modules : [
				{ type: 'facebook', col: 0 },
				{ type: 'twitter', col: 1 },
				{ type: 'turntable', col: 1 }
			]},
		{
			name: 'Other',
			modules : [
				{ type: 'turntable', left: 300, top: 50 }
			]
		}
	],
	rules: {
		modules: {
			facebook: { title: 'Facebook' },
			twitter: { title: 'Twitter' },
			turntable: { title: 'Turntable' }
		},
		menus: [
			{ type: 'launcher', text: 'New', offset: 200, height: 400 }, 
			{ type: 'settings', text: 'Settings', offset: 120, height: 300 }, 
			{ type: 'account', text: 'Account', offset: 40, height: 350 }
		]
	}
});