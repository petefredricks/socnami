COLLECTIONS.Menus = Backbone.Collection.extend({
	model: MODELS.Menu,
	
	initialize: function() {
		this.bind('add', this.position, this)
	},
	
	position: function(model) {
	}
});

MODELS.Menu = Backbone.Model.extend({
	
});

