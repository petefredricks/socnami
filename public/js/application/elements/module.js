ELEMENT.Module = Backbone.View.extend({

	className: 'module',
	
	initialize: function() {
		this.el = $(this.el);
		this.model.set({
			title: APP.rules.modules[this.model.get('type')].title
		});
		
		console.log(this.model.toJSON())
	},
	
	render: function() {
		this.el
			.fillTemplate('module', this.model.toJSON())
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