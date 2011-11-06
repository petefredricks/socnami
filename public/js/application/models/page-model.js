// Page Models
COLLECTION.Pages = Backbone.Collection.extend({
	
	model: MODEL.Page,
	
	localStorage: new Store("pages")
});

MODEL.Page = Backbone.Model.extend({});

// Column Models
COLLECTION.Columns = Backbone.Collection.extend({
	
	model: MODEL.Column,
	
	comparator: function(model) {
		return model.get('index');
	},
	
	getByIndex: function(index) {
		
		return this.find(function(model) {
			return model.get('index') == index;
		});
	},
	
	addColumn: function(index) {
		
		var column = this.getByIndex(index);
		
		if (!column) {
			column = new MODEL.Column({index: index});
			
			this.add(column, {silent:true});
		}
		
		return column;
	},
	
	checkColumns: function() {
		
		var last = this.last();
		
		this.each(function(column) {
			
			var count = column.get('count');
			
			if (!count && column.cid !== last.cid) {
				this.remove(column);
			}
		}, this);
		
		if (last.get('count')) {
			this.add(new MODEL.Column());
		}
	},
	
	updateColumn: function(cid, count, index) {
		var column = this.getByCid(cid);
		
		if (column) {
			column.set({
				count: count,
				index: index
			});
		}
	}
});

MODEL.Column = Backbone.Model.extend({
	
	defaults: function() {
		return {
			index: 99
		};
	}
});
