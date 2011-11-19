View.Menu = Backbone.View.extend({

	className: 'app-menu closed',
	
	timer: null,
	status: 'close',
	
	initialize: function() {
		this.bindListeners();
	},
	
	events: {
		'click div.app-menu-handle': 'toggle',
		'mouseleave': 'startClose',
		'mouseenter': 'clearTimer'
	},
	
	startClose: function() {
		if (this.status == 'open') {
			this.timer = window.setTimeout($.proxy(this, 'toggle'), 1000);
		}
	},
	
	clearTimer: function() {
		window.clearTimeout(this.timer);
	},
	
	render: function() {
		this.el
			.addClass('app-menu-' + this.model.get('type'))
			.fillTemplate('app-menu', this.model);
		
		this.elmts = {
			'content': this.el.find('div.app-menu-content'),
			'handle': this.el.find('div.app-menu-handle'),
			'handleText': this.el.find('div.handle-text')
		}
			
		this.draw();
		
		this.position();
			
		return this.el;
	},
	
	draw: function() { /* noop */ },
	
	position: function() {
		
		this.height = UTIL.getHeight(this.el);
		this.offset = 40 + (this.model.collection.length - 1) * 90;
		this.index = 20 - this.model.collection.length;
		
		this.el.css({
			'right': this.offset,
			'height': this.height,
			'top': this.height * -1,
			'z-index': this.index
		});
	},
	
	killMenus: function() {
		
		this.model.collection.each(function(mMenu) {
			
			if (mMenu.cid != this.model.cid) {
				mMenu.trigger('close');
			}
		}, this);
	},
	
	toggle: function(force) {
		
		if (typeof(force) == 'string') {

			this.clearTimer();
			
			if (this.status != force) {
				this.status = UTIL.oppositeDay(force);
				this.el.stop();
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
				newText = this.model.get('text');
				top = this.height * -1;
				break;

			// is closed
			default:
				
				this.killMenus();

				this.status = 'opening';
				newStatus = 'open';
				newText = 'Close';
				top = 0;
				break;
		}
		
		function changeHandle() {
			this.status = newStatus;
			
			this.el.toggleClass('closed', (this.status == 'close'));
			
			this.elmts.handleText.fadeOut(APP.getAnimation(100), function() {
				
				$(this)
					.text(newText)
					.fadeIn(APP.getAnimation(300));
			});
		}

		this.el.animate({ top: top }, APP.getAnimation(500), $.proxy(changeHandle, this));
	},
	
	bindListeners: function() {
		
		this.model.bind('close', function() {
			this.toggle('close');
		}, this);
	}
});

View.Launcher_Menu = View.Menu.extend({
	
	extendedEvents: {
		'click div.list-item': 'addModule'
	},
	
	draw: function() {
		this.elmts.content.fillTemplate('app-menu-launcher', { modules: this.model.get('modules') });
	},
	
	addModule: function(ev) {
		
		var type = $(ev.target).data('type');
		
		this.parent.modules.add({
			'type': type,
			'col': -1
		});
	}
});

View.Account_Menu = View.Menu.extend({
});

View.Settings_Menu = View.Menu.extend({
	
	extendedEvents: {
		'click div.list-item': 'toggleSetting'
	},
	
	draw: function() {
		this.elmts.content.fillTemplate('app-menu-settings', { settings: this.model.get('settings') });
	},
	
	toggleSetting: function(ev) {
		
		var row = $(ev.currentTarget);
		var input, value, attr = {};
		
		switch(row.data('input')) {
			
			case 'checkbox':
				input = row.find('input');
				value = !input.prop('checked');
				
				input.prop('checked', value);
				
				attr[row.data('type')] = value;
				
				APP.settings.set(attr);
				break;
				
			case 'menu':
				break;
		}
		
		return false;
	}
});
