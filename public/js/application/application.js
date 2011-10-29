(function(win, $) {
	
	// these are the global vars for application;
	win.ELEMENTS = {};
	win.MODELS = {};
	win.COLLECTIONS = {};
	
	var App = Backbone.View.extend({

		el: $('body'),
		elmts: {},
		currentPage: 0,
		isAnimated: true,

		initialize: function () {
			
			this.rules = new MODELS.Definitions();
			
			// common elements
			this.elmts = {
				'header': this.$('#socnami-header'),
				'wrapper': this.$('#socnami-wrapper'),
				'viewport': this.$('#socnami-viewport'),
				'footer': this.$('#socnami-footer')
			}
			
			this.render();
			
			//this.model.bind('change:user', this.alert, this);
		},
		
		render: function() {
			
			this.renderMenus();
			//this.renderPages();
		},
		
		renderMenus: function() {
			
			this.menus = new COLLECTIONS.Menus();

			var list = this.rules.menus;
			var menu, model;
			
			for (var type in list) {
				
				model = this.menus.add(list[type]).last();
				
				menu = new ELEMENTS.Menu({
					model: model
				});
				
				this.elmts.wrapper.append(menu.render());
			}
		},
		
		renderPages: function() {
			
			this.pages = {
				collection: new MODELS.Pages(),
				views: []
			}
			
			var list = this.model.pages;
			var view;
		
			for (var i = 0, len = list.length; i < len; i++) {
				
				view = new ELEMENTS.Page({
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
				win.APP = new App();
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
