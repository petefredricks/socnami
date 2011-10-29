ELEMENT.Page = Backbone.View.extend({

	className: 'page',
	
	initialize: function() {
		
		this.el = $(this.el);
		this.columns = [];
		
		this.modules = APP.modules.filter(function(module) {
			return (module.get('page') == this.model.id)
		}, this);
	},
	
	render: function() {
		
		var module, column;
		
		for (var i = 0, _len = this.modules.length; i < _len; i++) {
		
			module = new ELEMENT.Module({model: this.modules[i]});
			
			if (UTIL.whatIs(module.model.get('col')) != 'null') {
				
				column = module.model.get('col');
				
				if (!this.columns[column]) {
					
					this.columns[column] = new ELEMENT.Column();
				}
				
				this.columns[column].addModule(module.render());
				
			}
			else {
				this.el.append(module.render());
			}
			
			module.el.animate({opacity:1}, 300);
		}
		
		//add a last column
		this.columns[this.columns.length] = new ELEMENT.Column();
		
		for (var k = 0; k < this.columns.length; k++) {
			this.el.append(this.columns[k].render());
		}
		
		return this.el;
	},
	
	renderTab: function() {
		return $.fillTemplate('page-tab', {
			name: this.model.get('name')
		});
	},
	
	update: function() {
		
		var column;
		
		for (var i = 0, _len = this.columns.length; i < _len; i++) {
			
			column = this.columns[i];
			
			if (!column.length) {
				column.el.remove();
				
				UTIL.array.remove(this.columns, i);
				i--;
				continue;
			}
			
			
		}
	}
});

var Page = function(id) {
	this.id = id;
	this.modules = [];
	this.columns = [];
	this.floats = [];
}

Page.prototype = {
	
	init: function(modules) {
		
		var len = modules && modules.length;
		
		// we have no modules
		if (!len) {
			return;
		}
		
		for (var i = 0; i < len; i++) {
			
			this.addModule(modules[i]);
		}
	},
	
	draw: function() {
		
		this.el = $('<div class="page"></div>').appendTo(APP.elmts.viewport);
		
		var module, column;
		
		for (var i = 0, len = this.modules.length; i < len; i++) {
			module = this.modules[i];
			
			if (UTIL.whatIs(module.column) != 'null') {
				
				column = this.columns[module.column];
				
				if (!column) {
					column = {
						el: $('<div class="column"></div>'),
						modules: []
					}
					
					this.columns[module.column] = column;
					
					this.el.append(column.el);
				}
				
				column.el.append(module.draw());
				column.modules.push(module);
			}
			else if (module.position) {
				this.el.append(module.draw(module.position));
				this.floats.push(module);
			}
			
			module.el.animate({opacity:1}, 300);
		}
		
		column = {
			el: $('<div class="column"></div>'),
			modules: []
		}
		
		this.columns.push(column);
		this.el.append(column.el);
	},
	
	bindListeners: function() {
		
		$('div.column').sortable({
			items: 'div.module',
			forceHelperSize: true,
			forcePlaceholderSize: true,
			placeholder: 'ui-sortable-placeholder',
			connectWith: 'div.column',
			revert: 300,
			handle: 'div.module-header',
			tolerance: "pointer",
			start: function(event, ui) {},
			stop: function(event, ui) {}
		});
	},
	
	updatePage: function() {
		
	},
	
	addModule: function(modDef) {
		var module = new Module(modDef);
		
		this.modules.push(module);
		
		return module;
	},
	
	drawModule: function(type) {
		var module = this.addModule({type:type});
		
		this.columns[0].el.prepend(module.draw());
		
		return module;
	}
}

ELEMENT.Column = Backbone.View.extend({

	className: 'column',
	length: 0,
	
	initialize: function() {
		this.el = $(this.el);
	},
	
	render: function() {
		return this.el;
	},
	
	addModule: function(module) {
		
		this.el.append(module);
		
		this.length++;
	},
	
	removeModule: function(module) {
		
		this.length--;
	}
	
});