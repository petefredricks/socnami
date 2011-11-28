View.Module = Backbone.View.extend({

	className: 'module',
	
	initialize: function() {
		
		this.data = this.model.toJSON();
		this.model.bind('destroy', this.remove, this);
	},
	
	events: {
		'click div.module-close': 'deleteModule'
	},
	
	deleteModule: function() {
		
		this.model.destroy();
		this.parent.model.update();
	},
	
	render: function() {
		
		var view;
		var data = {
			parent: this
		}
		
		switch (this.data.type) {
			case 'twitter':
				view = new View.Twitter(data);
				break;
			default:
				view = new View.Empty(data);
				break;
		}
		
		if (view) {
			this.el
				.data('cid', this.model.cid)
				.fillTemplate('module', {
					title: APP.definitions.modules[this.data.type].title
				})
				.append(view.render());
		}

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

View.Module_Content = Backbone.View.extend({
	className: 'module-body'
});

View.Twitter = View.Module_Content.extend({
	
	events: {
		'click': 'login'
	},
	
	render: function() {
		return this.el.fillTemplate('module-twitter')
	},
	
	login: function() {
		console.log(1)
		window.location = '/auth/login/twitter'
	}
});

View.Empty = View.Module_Content.extend({
	
	render: function() {
		return this.el.fillTemplate('module-empty')
	}
});