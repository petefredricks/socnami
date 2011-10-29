ELEMENT.Module = Backbone.View.extend({

	className: 'module',
	
	initialize: function() {
		this.el = $(this.el);
	},
	
	render: function() {
		this.el.fillTemplate('module', {});
		return this.el;
	}
});

/*
var Module = function(def) {
	
	this.uid = UTIL.newUID();
	this.type = def.type;
	this.position = null;
	this.column = null;
	
	this.rules = APP.rules.modules[this.type];
	
	if (def.pos) {
		this.position = def.pos;
	}
	else {
		this.column = def.col || 0;
	}
}

Module.prototype = {
	
	draw: function(pos) {
	
		this.el = null;
		var html = [];
		var style = [];
		
		if (pos) {
			style.push(' style="position:absolute;left', pos.left, 'px;top:', pos.top, 'px;"');
		}
		
		this.el = $(html.join(''));
		
		return this.el;
	}
}*/