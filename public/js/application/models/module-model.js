COLLECTION.Modules = Backbone.Collection.extend({
	
	model: MODEL.Module,
	
	localStorage: new Store("modules"),
	
	getByPage: function(page) {
		return this.filter(function(module) {
			return (module.get('page') == page);
		});
	}
});


MODEL.Module = Backbone.Model.extend({
	
});
