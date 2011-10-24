VIEWS.Menu = Backbone.View.extend({

	className: 'app-menu',
	
	initialize: function() {
		this.el = $(this.el);
		
		this.timer = null;
		this.status = 'close';
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
			.fillTemplate('app-menu', this.model)
			.css({
				right: this.model.get('offset'),
				height: this.model.get('height'),
				top: this.model.get('height') * -1
			});
		
		this.elmts = {
			'handle': this.$('div.app-menu-handle'),
			'handleText': this.$('div.handle-text')
		}
			
		return this.el;
	},
	
	toggle: function(force) {
		
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
				newText = this.model.get('text');
				top = this.model.get('height') * -1;
				break;

			// is closed
			default:

				var m;

				for (var i = 0, len = APP.menus.views.length; i < len; i++) {
					m = APP.menus.views[i];

					if (m.cid == this.cid) {
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

		var prom = this.el.animate({ top: top }, 500).promise();
		
		function changeHandle() {
			this.status = newStatus;
			this.elmts.handleText.hide(300, function() {
				$(this)
					.text(newText)
					.show(300);
			});
		}
		
		prom.done($.proxy(changeHandle, this));
	}
});
