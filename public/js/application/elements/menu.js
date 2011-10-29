ELEMENTS.Menu = Backbone.View.extend({

	className: 'app-menu',
	
	initialize: function() {
		this.el = $(this.el);
		
		this.timer = null;
		this.status = 'close';
		
		this.model.bind('close', function() {
			this.toggle('close');
		}, this);
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
			
		this.height = UTIL.getHeight(this.el);
		this.offset = 40 + (this.model.collection.length - 1) * 80;
		this.index = 20 - this.model.collection.length;
		
		this.el.css({
			'right': this.offset,
			'height': this.height,
			'top': this.height * -1,
			'z-index': this.index
		});
		
		this.elmts = {
			'handle': this.el.find('div.app-menu-handle'),
			'handleText': this.el.find('div.handle-text')
		}
			
		return this.el;
	},
	
	killMenus: function() {
		
		this.model.collection.each(function(model) {
			
			if (model.cid != this.model.cid) {
				model.trigger('close');
			}
		}, this);
	},
	
	toggle: function(force) {
		
		if (typeof(force) == 'string') {

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
	}
});
