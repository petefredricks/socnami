// Page Models
Collection.Pages = Backbone.Collection.extend({
	
	model: Model.Page,
	
	localStorage: new Store("pages")
});

Model.Page = Backbone.Model.extend({});

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

Model.Column = Backbone.Model.extend({
	
	defaults: function() {
		return {
			index: 99
		};
	}
});
