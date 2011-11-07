(function(win, $) {
	
	// these are the global vars for application;
	win.Element = {};
	win.Model = {};
	win.Collection = {};
	
	var App = Backbone.View.extend({

		el: $('body'),
		elmts: {},
		currentPage: 'WGmva9sBky7EFt2ymm5P',
		isAnimated: true,

		initialize: function () {
			
			this.rules = new Model.Definitions();
			this.settings = new Model.Settings();
			
			this.pages = new Collection.Pages();
			this.menus = new Collection.Menus();
			this.modules = new Collection.Modules();
			
			// get module data
			this.modules.fetch();
			
			// common elements
			this.elmts = {
				'header': $('#socnami-header'),
				'wrapper': $('#socnami-wrapper'),
				'viewport': $('#socnami-viewport'),
				'footer': $('#socnami-footer')
			}
			
			this.bindListeners();
		},
		
		render: function() {
			
			this.drawFooter();
			this.renderMenus();
			this.renderPages();
		},
		
		renderMenus: function() {

			var list = this.rules.menus;
			
			for (var type in list) {
				this.menus.add(list[type]);
			}
		},
		
		drawMenu: function(model) {
			
			var type = model.get('type');
			
			var data = { 
				model: model,
				parent: this
			};
			var menu;
			
			switch(type) {
				case 'launcher':
					model.set({modules: this.rules.modules})
					menu = new Element.Launcher_Menu(data);
					break;
				case 'settings':
					menu = new Element.Settings_Menu(data);
					break;
				case 'account':
					menu = new Element.Account_Menu(data);
					break;
			}
			
			this.elmts.wrapper.append(menu.render());
		},
		
		renderPages: function() {
			
			this.pages.fetch();
		
			for (var i = 0, _page; i < this.pages.length; i++) {
				
				_page = this.pages.at(i);
				
				this.drawPageTab(_page);
				
				if (_page.id === this.currentPage) {
					this.drawPage(_page);
				}
			}
		},
		
		drawPageTab: function(model) {
			this.elmts.footerPages.appendTemplate('page-tab', {
				name: model.get('name')
			});
		},
		
		drawPage: function(model) {
			
			var page = new Element.Page({
				model: model,
				parent: this
			});

			this.elmts.viewport.html(page.render());
		},
		
		drawFooter: function() {
			this.elmts.footer.fillTemplate('footer');
			this.elmts.footerPages = $('#footer-pages');
		},
		
		getAnimation: function(speed) {
			return this.isAnimated ? speed : 0;
		},
		
		bindListeners: function() {
			
			$(window).bind('beforeunload', $.proxy(this, 'syncToStorage'));
			
			this.menus.bind('add', this.drawMenu, this);
			this.pages.bind('add', this.drawPage, this);
			this.modules.bind('add', this.drawModule, this);
		},
		
		syncToStorage: function() {
			
			this.modules.indexAndSave($('div.module'));
		},
		
		drawModule: function(model) {

			var modEl = new Element.Module({model: model});
			
			$('div.column:first').append(modEl.render());
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
