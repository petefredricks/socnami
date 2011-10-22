var Menu = function(type) {
	this.type = type;
	this.rules = APP.rules.menus[this.type];
	this.timer = null;
	this.status = 'close';
	this.uid = UTIL.newUID();
}
	
Menu.prototype.toggle = function(force) {
	
	if (typeof(force) == 'string') {

		if (this.status != force) {
			this.status = UTIL.oppositeDay(force);
		}
		else {
			return;
		}
	}

	var newStatus, newText, top;

	switch (this.status) {

		case 'closing':
		case 'opening':
			return;
			break;

		case 'open':
			this.status = 'closing';
			newStatus = 'close';
			newText = this.rules.text;
			top = this.rules.height * -1;
			break;

		// is closed
		default:
			
			var m;

			for (var i = 0, len = APP.menus.length; i < len; i++) {
				m = APP.menus[i];
				
				if (m.uid == this.uid) {
					continue;
				}
				
				m.toggle('close');
			}
			
			this.status = 'opening';
			newStatus = 'open';
			newText = 'Close';
			top = 0;
			break;
	}

	this.el.animate(
		{top: top}, 
		APP.getAnimateSpeed(500), 
		$.proxy(function() {
			this.handleText.text(newText);
			this.status = newStatus;
		}, this)
	);
}

Menu.prototype.draw = function() {
	
	var html = ['<div class="app-menu app-menu-', this.type, '"></div>'];
	
	this.el = $(html.join(''));
	
	this.handleText = $('<div class="handle-text"></div>').text(this.rules.text);
	this.handle = $('<div class="app-menu-handle"></div>').append(this.handleText);
	
	this.el
		.append(this.handle)
		.css({
			right: this.rules.offset,
			height: this.rules.height,
			top: this.rules.height * -1
		});
	
	this.bindListeners();
	
	return this.el;
}

Menu.prototype.bindListeners = function() {
	this.handle.bind('click', $.proxy(this, 'toggle'));

	this.el.bind('mouseleave', $.proxy(function() {
		
		if (this.status == 'open') {
			this.timer = window.setTimeout($.proxy(this, 'toggle'), 1000);
		}
	}, this));
	
	this.el.bind('mouseenter', $.proxy(function() {
		
		if (this.timer) {
			window.clearTimeout(this.timer);
		}
	}, this));

	//this.el.find('div.launcher-icon').bind('click', launchModule)
}
