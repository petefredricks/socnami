var Page = function(id) {
	this.pageNumber = id;
	this.modules = [];
	this.columns = [];
}

Page.prototype = {
	
	init: function() {
		
		this.el = $('<div class="page"></div>').appendTo(app.elmts.viewport);
		
		this.drawColumns();
	},
	
	drawColumns: function() {
		
		var colList = app.getData().pages[this.pageNumber].cols;
		var modList, column, module;
		
		for (var i = 0; i < colList.length; i++) {
			
			this.columns[i] = {modules:[]};
			modList = colList[i].modules;
			
			column = $('<div class="column"></div>');
			
			for (var k = 0; k < modList.length; k++) {
				
				module = this.addModule(modList[k].type)
				this.columns[i].modules.push(module);
				
				column.append(module.el);
			}
			
			column.appendTo(this.el);
		}
		
		$('div.module').animate({opacity:1}, 300);
	},
	
	bindListeners: function() {
		
		$('div.column').sortable({
			items: 'div.module',
			forceHelperSize: true,
			forcePlaceholderSize: true,
			placeholder: 'ui-sortable-placeholder',
			connectWith: 'div.column',
			revert: 300,
			handle: $("div.module-header"),
			grid: [7,7],
			tolerance: "intersect",
			start: function(event, ui) {},
			stop: function(event, ui) {}
		});
	},
	
	updatePage: function() {
		
	},
	
	addModule: function(type) {
		return new Module(type);
	}
}