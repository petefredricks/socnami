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
		
		html.push(
			'<div class="module ', this.type, '" data-uid="', this.uid, '"', style.join(''), '>',
				'<div class="module-header">',
					this.rules.title,
					'<div class="module-close">&times;</div>',
				'</div>',
				'<div class="module-body">',
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce diam elit, elementum vitae luctus ut, euismod hendrerit eros. Curabitur et tellus metus, ut eleifend lorem. Suspendisse cursus quam tempus purus tristique consequat vitae vitae elit. Phasellus cursus, orci sed tincidunt dictum, nulla eros sollicitudin orci, non auctor turpis nisl non nisi. Nam vel condimentum felis. Nam eget purus sit amet velit sodales egestas eu ut tortor. Pellentesque vitae quam ac enim condimentum dignissim. Duis sodales mauris sed nibh tristique vel semper nibh feugiat.',
				'</div>',
			'</div>');
		
		this.el = $(html.join(''));
		
		return this.el;
	}
}