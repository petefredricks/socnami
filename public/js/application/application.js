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
			
			// get page and module data
			this.pages.fetch();
			this.modules.fetch();
			
			// common elements
			this.elmts = {
				'header': this.$('#socnami-header'),
				'wrapper': this.$('#socnami-wrapper'),
				'viewport': this.$('#socnami-viewport'),
				'footer': this.$('#socnami-footer')
			}
			
			this.bindListeners();
		},
		
		render: function() {
			
			this.renderMenus();
			this.renderPages();
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
				page = new ELEMENT.Page({
					model: model,
					parent: this
				});
				
				this.elmts.footer.prepend(page.renderTab());
				
				if (i === this.currentPage) {
					this.elmts.viewport.html(page.render());
				}
			}
		},
		
		getAnimation: function(speed) {
			return this.isAnimated ? speed : 0;
		},
		
		bindListeners: function() {
			
			$(window).bind('beforeunload', $.proxy(this, 'syncToStorage'));
		},
		
		syncToStorage: function() {
			
			var self = this;
			
			$('div.module').each(function(i) {
				var module = self.modules.getByCid($(this).data('cid'));
				
				module.set({index: i});
				
				module.save();
			});
		},
		
		launchModule: function() {

			var icon = $(this);
			var type = icon.data('type');
			var column = $('div.column:first');

			var module = currentPage.drawModule(type);
			var options = {to: module.el, className: "ui-effects-transfer"};

			$(this).effect('transfer', options, 500, function() {
				module.el.animate({opacity:1},200);
			});
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
