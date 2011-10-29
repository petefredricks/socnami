COLLECTION.Modules = Backbone.Collection.extend({
	
	model: MODEL.Module,
	
	localStorage: new Store("modules")
});


MODEL.Module = Backbone.Model.extend({
	
});
