View.Module = Backbone.View.extend({

	className: 'module',
	
	initialize: function() {
		
		this.data = this.model.toJSON();
		this.data.title = APP.definitions.modules[this.data.type].title;
	},
	
	// The DOM events specific to an item.
	events: {
		"click div.module-close" : "destroy"
	},
	
	destroy: function() {
		
		this.remove();
		this.unbind();
		this.model.destroy();
		this.parent.update();
	},
	
	render: function() {
		this.el
			.fillTemplate('module', this.data)
			.data('cid', this.model.cid);
			
		return this.el;
	},
	
	addFloat: function(top, left) {
		
		if (!isNaN(top) && !isNaN(left)) {
			this.save({
				'col': null, 
				'top': top, 
				'left': left
			});
		}
	}
});