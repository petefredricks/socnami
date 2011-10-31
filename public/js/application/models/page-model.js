// Page Models
COLLECTION.Pages = Backbone.Collection.extend({
	
	model: MODEL.Page,
	
	localStorage: new Store("pages")
});

MODEL.Page = Backbone.Model.extend({
});

// Column Models
COLLECTION.Columns = Backbone.Collection.extend({
	
	model: MODEL.Column,
	
	addColumn: function(colNumber) {
		var column = this.at(colNumber);
		
		if (!column) {
			column = new MODEL.Column();
			
			this.add(column, {silent:true});
		}
		
		return column;
	},
	
	updateModuleCount: function(cid, count) {
		var column = this.getByCid(cid);
		
		column.set({'count': count});
	},
	
	checkColumns: function() {
		
		var last = this.last();
		
		this.each(function(column) {
			var count = column.get('count');
			
			if (!count && column !== last) {
				this.remove(column);
			}
		}, this);
		
		if (last.get('count')) {
			this.add();
		}
	}
});

MODEL.Column = Backbone.Model.extend({
	
	updateCount: function(cid, count) {
		
		var column = this.columns.getByCid(cid);
		
		if (column) {
			column.set({'count': count});
		}
	}
});
