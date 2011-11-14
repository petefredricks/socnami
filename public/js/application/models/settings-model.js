Model.Settings = Backbone.Model.extend({
	
	localStorage: new Store("settings"),
	
	defaults: {
		id: 'settings',
		animate: true
	}
});