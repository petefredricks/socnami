View.Page = Backbone.View.extend({

	className: 'page clear',
	width: 0,
	
	initialize: function() {
		
		this.model.columns.bind('add', this.drawColumn, this);
		this.model.bind('draw-module', this.drawModule, this);
	},
	
	render: function() {

		var columnListMap = {};
		var floatList = [];
		
		_.each(this.model.modules, function(mModule) {
			
			var columnIndex = mModule.get('col');
			
			if (!isNaN(columnIndex)) {
				var mColumn = this.model.columns.addColumn(columnIndex);
				
				if (!columnListMap[mColumn.cid]) {
					columnListMap[mColumn.cid] = [];
				}
				
				columnListMap[mColumn.cid].push(mModule);
			}
			else {
				floatList.push(mModule);
			}
		}, this);
		
		// add a last column
		this.model.columns.addColumn(99);
		
		this.model.columns.each(function(mColumn) {
			
			var id = mColumn.cid;
			var mModules = columnListMap[id];
			
			this.drawColumn(mColumn, mModules);
		
		}, this);
		
		return this.el;
	},
	
	drawColumn: function(mColumn, mModules) {
		
		var count = UTIL.whatIs(mModules) == 'array' ? mModules.length : 0;

		mColumn.set({'count': count});

		var column = new View.Column({
			model: mColumn,
			parent: this
		})
		.bindListeners()
		.render()
		.data({'cid': mColumn.cid});
		
		if (mColumn.get('index') < 0) {
			this.el.prepend(column);
		}
		else {
			this.el.append(column);
		}
		
		var _vModule, _el;

		for (var i = 0; i < count; i++) {

			_vModule = new View.Module({
				model: mModules[i],
				parent: this
			});
			
			_el = _vModule.render()

			column.append(_el);
			
			_el.fadeIn(APP.getAnimation(1000));
		}
		
		this.el.width(this.width += column.outerWidth(true));
	},
	
	update: function() {
		
		var columns = this.el.find('div.column');
		
		var _cid, _modules, _column, _count;
		
		for (var i = 0; i < columns.length; i++) {
			
			_column = $(columns[i]);
			_cid = _column.data('cid');
			_modules = _column.find('div.module');
			_count = _modules.length;
			
			this.model.columns.updateColumn(_cid, _count, i);
			
			for (var k = 0; k < _count; k++) {
				$(_modules[k]).data('col', i);
			}
		}
		
		this.model.columns.checkColumns();
	},
		
	drawModule: function(mModule) {
		
		var mColumn = this.model.columns.addColumn(-1);
		
		mModule.set({page: this.model.id});

		this.drawColumn(mColumn, [mModule]);
		
		this.update();
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
				self.parent.update();
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
		this.model.bind('clear', this.removeClass, this);
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change:name', this.changeName, this);
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
	
	removeClass: function() {
		this.el.removeClass('active');
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
	
	changeName: function() {
		this.el.find('div.page-name').text(this.model.get('name'));
	},
	
	loadPage: function() {
		
		APP.modules.indexAndSave();
		
		this.el.addClass('active');
		this.model.set({active: true});
	},
	
	deletePage: function() {
		
		var status = confirm('Are you sure you want to delete page: ' + this.model.get('name') + '?');
		
		if (status) {
			this.model.deletePage();
		}
	}
});