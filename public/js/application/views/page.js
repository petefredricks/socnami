View.Page = Backbone.View.extend({

	className: 'page clear',
	width: 0,
	
	initialize: function() {
		
		this.model.columns.bind('add', this.drawColumn, this);
		this.model.bind('draw-module', this.drawModule, this);
	},
	
	render: function() {
		
		this.model.createModuleMap();
		
		return this.el;
	},
	
	drawColumn: function(mColumn, mModules) {
		
		var count = UTIL.whatIs(mModules) == 'array' ? mModules.length : 0;

		mColumn.set({'count': count});

		var vColumn = new View.Column({
			model: mColumn,
			parent: this
		});
		
		var column = vColumn.render().data({ 'cid': mColumn.cid });
		
		if (mColumn.get('index') < 0) {
			this.el.prepend(column);
		}
		else {
			this.el.append(column);
		}
		
		var vModule, el;

		for (var i = 0; i < count; i++) {

			vModule = new View.Module({
				model: mModules[i],
				parent: this
			});
			
			el = vModule.render().data({ 'col': mColumn.get('index') });

			column.append(el);
			
			_.defer(function(el) {
				el.fadeIn(APP.getAnimation(500));
			}, el);
		}
		
		var resize = _.bind(this.resize, this, column);
		
		_.defer(resize);
	},
	
	resize: function(column) {
		this.el.width(this.width += column.outerWidth(true));
	}
});

View.Column = Backbone.View.extend({

	className: 'column',
	
	initialize: function() {
		
		// bind model events
		this.model.bind('remove', this.removeColumn, this);
	},
	
	removeColumn: function() {
		
		var page = this.parent;
		
		this.el.hide(APP.getAnimation(300), function() {
			var column = $(this);
			var newWidth = (page.width -= column.outerWidth(true));
			
			column.remove();
			page.el.width(newWidth);
		});
	},
	
	render: function() {
		
		this.bindListeners();
		
		return this.el;
	},
	
	bindListeners: function() {
		
		// this is the column element
		var self = this;
		
		this.el.sortable({
			items: 'div.module',
			forceHelperSize: true,
			forcePlaceholderSize: true,
			placeholder: 'ui-sortable-placeholder',
			connectWith: 'div.column',
			revert: 300,
			handle: 'div.module-header',
			tolerance: "pointer",
			stop: function() {
				self.parent.model.update();
			}
		});
		
		return this;
	}
});

View.Page_Tab = Backbone.View.extend({
	
	className: 'page-tab',
	timer: null,
	status: 'close',
	
	initialize: function() {
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change:name', this.changeName, this);
		this.model.bind('change:active', this.changeStatus, this);
	},
	
	events: {
		'mouseenter': 'menuOpen',
		'mouseleave': 'menuClose',
		'click': 'loadPage',
		'click .page-rename': 'rename',
		'click .page-delete': 'deletePage'
	},
	
	toggle: function(status) {
		
		clearTimeout(this.timer);
		
		if (status == this.status) {
			return;
		}
		
		var newStatus, delay, mode;
		
		switch (status) {

			case 'close':
				newStatus = 'close';
				delay = 200;
				mode = 'hide';
				break;

			case 'open':
				newStatus = 'open';
				delay = 1000;
				mode = 'show';
				break;
		}
		
		var effect = $.proxy(function() {
			this.el.find('.page-tab-menu').effect('slide', {direction: 'down', mode: mode}, 200);
			this.status = newStatus;
		}, this);
		
		this.timer = setTimeout(effect, delay);
	},
	
	menuOpen: function() {
		this.toggle('open');
	},
	
	menuClose: function() {	
		this.toggle('close');
	},
	
	render: function() {
		
		if (this.model.get('active')) {
			this.el.addClass('active');
		}
		
		return this.el.fillTemplate('page-tab', this.model.toJSON());
	},
	
	rename: function() {
		var name = prompt('New page name:', this.model.get('name'));
		
		if (name) {
			this.model.set({'name': name});
		}
	},
	
	changeName: function(mPage) {
		this.el.find('div.page-name').text(mPage.get('name'));
	},
	
	changeStatus: function(mPage, isActive) {
		this.el.toggleClass('active', isActive);
	},
	
	loadPage: function() {
		
		APP.modules.indexAndSave();
		
		this.model.trigger('make-active', this.model);
	},
	
	deletePage: function() {
		
		var status = confirm('Are you sure you want to delete page: ' + this.model.get('name') + '?');
		
		if (status) {
			this.model.deletePage();
		}
	}
});