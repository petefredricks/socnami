(function(win, $) {
	
	// these are the global vars for application;
	win.ELEMENT = {};
	win.MODEL = {};
	win.COLLECTION = {};
	
	var App = Backbone.View.extend({

		el: $('body'),
		elmts: {},
		currentPage: 0,
		isAnimated: true,

		initialize: function () {
			
			this.rules = new MODEL.Definitions();
			
			this.pages = new COLLECTION.Pages();
			this.menus = new COLLECTION.Menus();
			this.modules = new COLLECTION.Modules();
			
			this.pages.fetch();
			this.modules.fetch();
			
			// common elements
			this.elmts = {
				'header': this.$('#socnami-header'),
				'wrapper': this.$('#socnami-wrapper'),
				'viewport': this.$('#socnami-viewport'),
				'footer': this.$('#socnami-footer')
			}
		},
		
		render: function() {
			
			this.renderMenus();
			this.renderPages();
			this.renderModules();
		},
		
		renderMenus: function() {

			var list = this.rules.menus;
			var menu, model;
			
			for (var type in list) {
				
				model = this.menus.add(list[type]).last();
				menu = new ELEMENT.Menu({ model: model });
				
				this.elmts.wrapper.append(menu.render());
			}
		},
		
		renderPages: function() {
			
			this.pages.fetch();
			
			var page, model;
		
			for (var i = 0; i < this.pages.length; i++) {
				
				model = this.pages.at(i);
				page = new ELEMENT.Page({ model: model });
				
				
//				page.modules.each(function(m){
//					m.destroy();
//				})
//				page.modules.add([
//				{ type: 'facebook', col: 0 },
//				{ type: 'twitter', col: 1 },
//				{ type: 'turntable', col: 1 }
//			])

//				this.modules.create({ type: 'turntable', col: 1, page: model.id })
//				this.modules.create({ type: 'facebook', col: 0, page: model.id  })
//				this.modules.create({ type: 'twitter', col: 1, page: model.id  })
//				
				this.elmts.footer.prepend(page.renderTab());
				
				if (i === this.currentPage) {
					this.elmts.viewport.html(page.render());
				}
			}
		},
		
		renderModules: function() {
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
				win.APP.render();
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
