(function(win, $) {
	
	// these are the global vars for application;
	win.APP = {};
	win.VIEWS = {};
	win.MODELS = {};
	
	MODELS.App = Backbone.Model.extend({
	
		current: 0,
		user: 'p.fred',
		pages: [
			{
				name: 'Home',
				modules : [
					{type: 'facebook', col: 0},
					{type: 'twitter', col: 1},
					{type: 'turntable', col: 1},
				]
			},
			{
				name: 'Other',
				modules : [
					{type: 'turntable', pos: {left: 300, top: 50}}
				]
			}
		],
		rules: {
			modules: {
				facebook: { title: 'Facebook' },
				twitter: { title: 'Twitter' },
				turntable: { title: 'Turntable' }
			},
			menus: [
				{ type: 'launcher', text: 'New', offset: 200, height: 400 }, 
				{ type: 'settings', text: 'Settings', offset: 120, height: 300 }, 
				{ type: 'account', text: 'Account', offset: 40, height: 350 }
			]
		}
	});
	
	VIEWS.App = Backbone.View.extend({

		el: $('body'),
		elmts: {},
		currentPage: 0,
		isAnimated: true,

		initialize: function () {
			
			this.rules = this.model.rules //this.model.get('rules');
			
			console.log(this.model)
			
			this.elmts = {
				'header': this.$('#socnami-header'),
				'wrapper': this.$('#socnami-wrapper'),
				'viewport': this.$('#socnami-viewport'),
				'footer': this.$('#socnami-footer')
			}
			
			this.render();
			
			this.model.bind('change:user', this.alert, this);

		},
		
		events: {
			'click button': 'prompt'
		},
		
		prompt: function() {
			var name = prompt('Enter you name:')
			
			this.model.set({user: name})
		},
		
		alert: function(x) {
			console.log(this.model.get('user'))
		},
		
		render: function() {
			
			this._renderMenus();
			this._renderPages();
			
			this.elmts.wrapper.append('<button>click</button>');

			//this.pages = new Pages();
			//this.menus = new Menus();
		},
		
		_renderMenus: function() {
			
			this.menus = {
				collection: new MODELS.Menus(),
				views: []
			}

			var list = this.rules.menus;
			var view;
			
			for (var i = 0, len = list.length; i < len; i++) {
				
				view = new VIEWS.Menu({
					model: this.menus.collection.add(list[i]).last()
				});
				
				this.menus.views.push(view);
				
				this.elmts.wrapper.append(view.render());
			}
		},
		
		_renderPages: function() {
			
			this.pages = {
				collection: new MODELS.Pages(),
				views: []
			}
			
			var list = this.model.pages;
			var view;
		
			for (var i = 0, len = list.length; i < len; i++) {
				
				view = new VIEWS.Page({
					model: this.pages.collection.add(list[i]).last()
				});
				
				this.pages.views.push(view);
				
				this.elmts.footer.prepend(view.renderTab());
			}
			
			
		}
	});
	
	$(document).ready(function() {
		
		$.loadTemplates({
			paths: [
				'../templates/app.tmpl',
				'../templates/page.tmpl',
				'../templates/module.tmpl'
			],
			onload: function() {
				win.APP = new VIEWS.App({model: new MODELS.App()});
			}
		});
	});
	
})(window, jQuery);
/*
var appview = new AppView;

(function(win, $) {
	
	var elmts = {};
	var isAnimated = true;
	var currentPage = null; 
	var pages = [];
	var menus = [];
	
	function init() {
		
		elmts.viewport = $('#socnami-viewport');
		elmts.wrapper = $('#socnami-wrapper');
		
		var mod = new VIEWS.FacebookModule();
		var html = mod.render();
		elmts.viewport.html(html.el)
		return
		
		for (var i = 0; i < data.pages.length; i++) {
			pages[i] = new Page(i);
			pages[i].init(data.pages[i].modules);
		}
		
		currentPage = pages[data.current];
		currentPage.draw();
		currentPage.bindListeners();
		
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
	
	// these are the global vars for application;
	win.APP = {
		getData: getData,
		pages: pages,
		getAnimateSpeed: getAnimateSpeed,
		elmts: elmts,
		menus: menus
	}
	
	win.VIEWS = {};
	win.MODELS = {};
	
})(window, jQuery);*/
