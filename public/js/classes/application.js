var app = (function($) {
	
	var elmts = {};
	var status = {};
	var isAnimated = true;
	var timer = {};
	var currentPage = null; 
	var pages = [];
	
	function init() {
		
		var data = getData();
		
		elmts.launcher = $('#socnami-launcher');
		elmts.launcherHandle = $('#socnami-launcher-handle');
		elmts.viewport = $('#socnami-viewport');
		
		for (var i = 0; i < data.pages.length; i++) {
			pages[i] = new Page(i);
		}
		
		currentPage = pages[data.current];
		currentPage.init();
		
		bindListeners();
	}
	
	function getData() {
		return DATA;
	}
	
	function oppositeDay(value) {
		
		switch(value) {
			case 'left':return 'right';
			case 'right':return 'left';
			case 'top':return 'bottom';
			case 'bottom':return 'top';
			case 'open':return 'close';
			case 'close':return 'open';
		}
		
		if (typeof(value) == 'number') {
			return value * -1;
		}
		
		return value;
	}
	
	function toggleLauncher(ev) {
		
		if (ev && ev.data && ev.data.delay) {
			
			if (ev.data.status == oppositeDay(status.launcher)) {
				timer.launcher = window.setTimeout(toggleLauncher, ev.data.delay);
			}
			
			return;
		}
		
		var newStatus, top;
		
		switch (status.launcher) {
				
			case 'closing':
			case 'opening':
				return;
				break;
				
			case 'open':
				status.launcher = 'closing';
				newStatus = 'close';
				top = -400;
				break;
			
			// is closed
			default:
				status.launcher = 'opening';
				newStatus = 'open';
				top = 0;
				break;
		}
		
		elmts.launcher.animate(
			{ top: top }, 
			getAnimateSpeed(500), 
			function() {
				elmts.launcherHandle.find('span').text(oppositeDay(newStatus));
				status.launcher = newStatus;
			}
		);
	}
	
	function getAnimateSpeed(ms) {
		return isAnimated ? ms : 0;
	}
	
	function bindListeners() {
		elmts.launcherHandle.bind('click', toggleLauncher);
		
		elmts.launcher.bind('mouseleave', {delay: 1000, status: 'close'}, toggleLauncher);
		elmts.launcher.bind('mouseenter', function() {
			if (timer.launcher) {
				window.clearTimeout(timer.launcher);
			}
		});
		
		elmts.launcher.find('div.launcher-icon').bind('click', launchModule)
	}
	
	function launchModule() {
		
		var icon = $(this);
		var type = icon.data('type');
		var column = $('div.column:first');
		
		var module = currentPage.addModule(type);
		var options = { to: module.el, className: "ui-effects-transfer" };
		
		column.prepend(module.el);
		
		
		
		
		$(this).effect('transfer', options, 500, function() {
			module.el.animate({opacity:1},200);
			
			var page = new Page();
			page.bindListeners();
		});
	}
	
	$(document).ready(init);
	
	return {
		getData: getData,
		pages: pages,
		elmts: elmts
	}
	
})(jQuery);

app.rules = {}

app.rules.modules = {}

app.rules.modules.facebook = {
	title: 'Facebook'
}
app.rules.modules.twitter = {
	title: 'Twitter'
}
app.rules.modules.turntable = {
	title: 'Turntable'
}

DATA = {
	current: 0,
	user: 'p.fred',
	pages: [
		{
			title: 'Home',
			cols: [
				{
					modules : [
						{
							type: 'facebook'
						},
						{
							type: 'twitter'
						}
					]
				},
				{
					modules : [
						{
							type: 'turntable'
						}
					]
				}
			]
		},
		{
			title: 'Other',
			cols: [
				{
					modules: [
						{
							type: 'facebook',
							col: 0
						}
					]
				}
			]
		}
	]
}