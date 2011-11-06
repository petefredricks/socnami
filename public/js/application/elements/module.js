ELEMENT.Module = Backbone.View.extend({

	className: 'module',
	
	initialize: function() {
		
		this.el = $(this.el);
		this.el.data('cid', this.model.cid);
		
		this.data = this.model.toJSON();
		this.data.title = APP.rules.modules[this.data.type].title;
	},
	
	render: function() {
		this.el
			.fillTemplate('module', this.data)
			.data('cid', this.model.cid);
			
		return this.el;
	},
	
	changeColumn: function(column) {
		
		if (!isNaN(column)) {
			this.save({'col': column});
		}
	},
	
	addFloat: function(top, left) {
		
		if (!isNaN(top) && !isNaN(left)) {
			this.save({'col': null, 'top': top, 'left': left});
		}
	}
});