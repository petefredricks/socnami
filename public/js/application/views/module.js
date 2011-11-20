View.Module = Backbone.View.extend({

	className: 'module',
	
	initialize: function() {
		
		this.data = this.model.toJSON();
		this.data.title = APP.definitions.modules[this.data.type].title;
		
		this.model.bind('destroy', this.remove, this);
	},
	
	events: {
		'click div.module-close': 'deleteModule'
	},
	
	deleteModule: function() {
		
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