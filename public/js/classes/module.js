var Module = function(type) {
	console.log(type)
	//this.uid = id;
	this.type = type;
	this.rules = app.rules.modules[type];
	
	this.createModule();
}

Module.prototype = {
	
	createModule: function() {
	
		this.el = null;
		var html = [];
		
		html.push(
			'<div class="module ', this.type, '">',
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