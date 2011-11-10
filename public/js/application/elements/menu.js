View.Menu = Backbone.View.extend({

	className: 'app-menu',
	
	timer: null,
	status: 'close',
	
	initialize: function() {
		this.bindListeners();
	},
	
	events: {
		'click div.app-menu-handle': 'toggle',
		//'mouseleave': 'startClose',
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
		this.offset = 40 + (this.model.collection.length - 1) * 80;
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

		var prom = this.el.animate({ top: top }, 500).promise();
		
		function changeHandle() {
			this.status = newStatus;
			this.elmts.handleText.hide(200, function() {
				$(this)
					.text(newText)
					.show(200);
			});
		}
		
		prom.done($.proxy(changeHandle, this));
	},
	
	bindListeners: function() {
		
		this.model.bind('close', function() {
			this.toggle('close');
		}, this);
	}
});

View.Launcher_Menu = View.Menu.extend({
	
	extendedEvents: {
		'click div.launcher-item': 'addModule'
	},
	
	draw: function() {
		this.elmts.content.fillTemplate('app-menu-launcher', this.model.get('modules'));
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
});
