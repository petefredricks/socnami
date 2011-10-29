COLLECTION.Pages = Backbone.Collection.extend({
	
	model: MODEL.Page,
	
	localStorage: new Store("pages")
});

MODEL.Page = Backbone.Model.extend({
});
