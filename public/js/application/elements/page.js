Element.Page = Backbone.View.extend({

	className: 'page clear',
	width: 0,
	
	initialize: function() {
		
		this.columns = new Collection.Columns();
		this.modules = this.parent.modules.getPageModules(this.model.id);
		
		this.columns.bind('add', this.drawColumn, this);
	},
	
	alertMe: function() {
		alert('winning');
	},
	
	render: function() {
		
		var mModule, mColumn, columnIndex;
		var columnListMap = {};
		var floatList = [];
		
		for (var i = 0, _len = this.modules.length; i < _len; i++) {
			
			mModule = this.modules[i];
			
			columnIndex = mModule.get('col');
			
			if (!isNaN(columnIndex)) {
				mColumn = this.columns.addColumn(columnIndex);
				
				if (!columnListMap[mColumn.cid]) {
					columnListMap[mColumn.cid] = [];
				}
				
				columnListMap[mColumn.cid].push(mModule);
			}
			else {
				floatList.push(mModule);
			}
		}
		
		// add a last column
		mColumn = this.columns.addColumn(99);
		
		this.columns.each(function(mColumn) {
			
			var id = mColumn.cid;
			var mModules = columnListMap[id];
			
			this.drawColumn(mColumn, mModules);
		
		}, this);
		
		return this.el;
	},
	
	drawColumn: function(mColumn, mModules) {
		
		var count = UTIL.whatIs(mModules) == 'array' ? mModules.length : 0;

		mColumn.set({'count': count});

		var column = new Element.Column({
			model: mColumn,
			parent: this
		})
		.bindListeners()
		.render();

		column.data({'cid': mColumn.cid});

		for (var i = 0, _eModule; i < count; i++) {

			_eModule = new Element.Module({
				model: mModules[i],
				parent: this
			});

			column.append(_eModule.render().fadeIn(APP.getAnimation(1000)));
		}
		
		if (mColumn.get('index') < 0) {
			this.el.prepend(column);
		}
		else {
			this.el.append(column);
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
			
			this.columns.updateColumn(_cid, _count, i);
			
			for (var k = 0; k < _count; k++) {
				$(_modules[k]).data('col', i);
			}
		}
		
		this.columns.checkColumns();
	},
		
	drawModule: function(mModule) {
		
		var mColumn = this.columns.addColumn(-1);

		this.drawColumn(mColumn, [mModule]);
		
		this.update();
	}
});

Element.Column = Backbone.View.extend({

	className: 'column',
	
	initialize: function() {
		this.el = $(this.el);
		
		// bind model events
		this.model.bind('remove', this.removeColumn, this);
	},
	
	removeColumn: function() {
		
		this.el.hide(APP.getAnimation(300), function() {
			$(this).remove();
			this.parent.el.width(this.parent.width -= $(this).outerWidth(true))
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