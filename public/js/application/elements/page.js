ELEMENT.Page = Backbone.View.extend({

	className: 'page',
	
	initialize: function() {
		
		this.el = $(this.el);
		
		this.columns = new COLLECTION.Columns();
		this.modules = this.parent.modules.getByPage(this.model.id);
		
		this.columns.bind('add', this.drawColumn, this);
	},
	
	render: function() {
		
		var module, column, columnNum;
		var columnListMap = {};
		var floatList = [];
		
		for (var i = 0, _len = this.modules.length; i < _len; i++) {
			
			module = this.modules[i];
			
			console.log(module)
			
			columnNum = module.get('col');
			
			if (!isNaN(columnNum)) {
				column = this.columns.addColumn(columnNum);
				
				if (!columnListMap[column.cid]) {
					columnListMap[column.cid] = [];
				}
				
				columnListMap[column.cid].push(module);
			}
			else {
				floatList.push(module);
			}
		}
		
		// add a last column
		column = this.columns.addColumn(99);
		columnListMap[column.cid] = [];
		
		this.columns.each(function(column) {
			
			var id = column.cid;
			var modules = columnListMap[id];
			
			this.drawColumn(column, modules);
		
		}, this);
		
		return this.el;
	},
	
	renderTab: function() {
		return $.fillTemplate('page-tab', {
			name: this.model.get('name')
		});
	},
	
	drawColumn: function(column, modules) {
		
		var count = UTIL.whatIs(modules) == 'array' ? modules.length : 0;

		column.set({'count': count});

		var colEl = new ELEMENT.Column({
			model: column,
			parent: this
		})
		.bindListeners()
		.render();

		colEl.data({'cid': column.cid});

		for (var i = 0, modEl; i < count; i++) {

			modEl = new ELEMENT.Module({model: modules[i]});

			colEl.append(modEl.render());
		}

		this.el.append(colEl);
	},
	
	update: function() {
		
		var columns = this.el.find('div.column');
		
		var _cid, _modules, _column, _count;
		
		for (var i = 0; i < columns.length; i++) {
			
			_column = $(columns[i]);
			_cid = _column.data('cid');
			_modules = _column.find('div.module');
			_count = _modules.length;
			
			this.columns.updateColumn(_cid, _count, i);
			
			for (var k = 0; k < _count; k++) {
				$(_modules[k]).data('col', i);
			}
		}
		
		this.columns.checkColumns();
	}
});

ELEMENT.Column = Backbone.View.extend({

	className: 'column',
	
	initialize: function() {
		this.el = $(this.el);
		
		// bind model events
		this.model.bind('remove', this.removeColumn, this);
	},
	
	removeColumn: function() {
		
		this.el.hide(APP.getAnimation(300), function() {
			$(this).remove();
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
				console.time('stop')
				self.parent.update();
				console.timeEnd('stop')
			}
		});
		
		return this;
	}
});