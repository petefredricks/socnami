// Page Models
Model.Page = Backbone.Model.extend({
	
	initialize: function() {
		this.modules = APP.modules.getPageModules(this.get('id'));
		this.columns = new Collection.Columns();
	},
	
	defaults: function() {
		return {
			name: 'New Page',
			active: true,
			id: UTIL.newUID(10)
		}
	},
	
	deletePage: function() {
		
		_.each(this.modules, function(mModule) {
			mModule.destroy();
		});
		
		this.destroy({silent: !this.get('active')});
	},
	
	update: function() {
		
		var columns = $('div.column');
		
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
	
	createModuleMap: function() {
		
		var columnListMap = {};
		var floatList = [];
		
		_.each(this.modules, function(mModule) {
			
			var columnIndex = mModule.get('col');
			
			if (!isNaN(columnIndex)) {
				var mColumn = this.columns.addColumn(columnIndex);
				
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
		this.columns.addColumn(99);
		
		this.columns.each(function(mColumn) {
			
			var id = mColumn.cid;
			var mModules = columnListMap[id];
			
			this.trigger('add', mColumn, mModules);
		
		}, this.columns);
	},
		
	addModule: function(mModule) {
		
		this.modules.push(mModule);
		
		mModule.set({ page: this.get('id') });

		this.columns.trigger('add', this.columns.addColumn(-1), [mModule]);
		
		this.update();
	}
});

Collection.Pages = Backbone.Collection.extend({
	
	model: Model.Page,
	
	localStorage: new Store('pages'),
	
	initialize: function() {
		this.bind('add', this.makeActive, this);
		this.bind('remove', this.defaultActive, this);
		this.bind('make-active', this.makeActive, this);
	},
	
	saveAll: function() {
		
		this.each(function(_mPage) {
			_mPage.save();
		});
	},
	
	disableOthers: function(mPage) {
		
		this.each(function(_mPage) {
					
			if (_mPage.cid != mPage.cid) {
				_mPage.set({ active: false });
			}
		});
	},

	defaultActive: function() {
		
		var mPage = this.first();
		
		if (mPage) {
			this.makeActive(mPage);
		}
	},
		
	makeActive: function(mPage) {

		mPage.initialize();
		mPage.set({ active: true });
		
		this.disableOthers(mPage);
		this.trigger('draw', mPage);
	}
});

Model.Column = Backbone.Model.extend({
	
	defaults: function() {
		return {
			index: 99
		};
	}
});

// Column Models
Collection.Columns = Backbone.Collection.extend({
	
	model: Model.Column,
	
	comparator: function(model) {
		return model.get('index');
	},
	
	getByIndex: function(index) {
		
		return this.find(function(model) {
			return model.get('index') == index;
		});
	},
	
	addColumn: function(index) {
		
		var mColumn = this.getByIndex(index);
		
		if (!mColumn) {
			mColumn = new Model.Column({index: index});
			
			this.add(mColumn, {silent: true});
		}
		
		return mColumn;
	},
	
	checkColumns: function() {
		
		var last = this.last();
		
		this.each(function(mColumn) {
			
			var count = mColumn.get('count');
			
			if (!count && mColumn.cid !== last.cid) {
				this.remove(mColumn);
			}
		}, this);
		
		if (last.get('count')) {
			this.add(new Model.Column());
		}
	},
	
	updateColumn: function(cid, count, index) {
		var mColumn = this.getByCid(cid);
		
		if (mColumn) {
			mColumn.set({
				count: count,
				index: index
			});
		}
	}
});
