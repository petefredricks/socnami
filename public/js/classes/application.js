var APP = (function($) {
	
	var elmts = {};
	var isAnimated = true;
	var currentPage = null; 
	var pages = [];
	var menus = [];
	
	function init() {
		
		var data = getData();
		
		elmts.viewport = $('#socnami-viewport');
		elmts.wrapper = $('#socnami-wrapper');
		
		for (var i = 0; i < data.pages.length; i++) {
			pages[i] = new Page(i);
			pages[i].init(data.pages[i].modules);
		}
		
		currentPage = pages[data.current];
		currentPage.draw();
		currentPage.bindListeners();
		
		for (var type in APP.rules.menus) {
			var menu = new Menu(type);
			elmts.wrapper.append(menu.draw());
		}
		
		getSaveSettings();
	}
	
	function getSaveSettings() {
		//console.log(pages)
	}
	
	function getData() {
		return DATA;
	}
	
	function getAnimateSpeed(ms) {
		return isAnimated ? ms : 0;
	}
	
	function launchModule() {
		
		var icon = $(this);
		var type = icon.data('type');
		var column = $('div.column:first');
		
		var module = currentPage.drawModule(type);
		var options = {to: module.el, className: "ui-effects-transfer"};
		
		$(this).effect('transfer', options, 500, function() {
			module.el.animate({opacity:1},200);
		});
	}
	
	$(document).ready(init);
	
	return {
		getData: getData,
		pages: pages,
		getAnimateSpeed: getAnimateSpeed,
		elmts: elmts,
		menus: menus
	}
	
})(jQuery);

APP.rules = {
	modules: {
		facebook: { title: 'Facebook' },
		twitter: { title: 'Twitter' },
		turntable: { title: 'Turntable' }
	},
	menus: {
		launcher: { text: 'New', offset: 200, height: 400 }, 
		settings: { text: 'Settings', offset: 120, height: 300 }, 
		account: { text: 'Account', offset: 40, height: 350 }
	}
}

DATA = {
	current: 0,
	user: 'p.fred',
	pages: [
		{
			title: 'Home',
			modules : [
				{type: 'facebook', col: 0},
				{type: 'twitter', col: 1},
				{type: 'turntable', col: 1},
				//{ type: 'turntable', pos: {left: 300, top: 50} }
			]
		},
		{
			title: 'Other',
			modules : [
				{type: 'turntable', pos: {left: 300, top: 50}}
			]
		}
	]
}