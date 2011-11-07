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
		
		var column = this.getByIndex(index);
		
		if (!column) {
			column = new Model.Column({index: index});
			
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
			this.add(new Model.Column());
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

Model.Column = Backbone.Model.extend({
	
	defaults: function() {
		return {
			index: 99
		};
	}
});
