(function(win, $) {
	
	// these are the global vars for application;
	win.Element = {};
	win.Model = {};
	win.Collection = {};
	
	var App = Backbone.View.extend({

		el: 'body',
		elmts: {},
		page: null,

		initialize: function () {
			
			this.rules = new Model.Definitions();
			this.settings = new Model.Settings();
			
			this.currentPage = this.settings.get('current');
			this.isAnimated = this.settings.get('animate');
			
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
		
		drawMenu: function(mMenu) {
			
			var type = mMenu.get('type');
			
			var data = { 
				model: mMenu,
				parent: this
			};
			var eMenu;
			
			switch(type) {
				case 'launcher':
					mMenu.set({modules: this.rules.modules})
					eMenu = new Element.Launcher_Menu(data);
					break;
				case 'settings':
					eMenu = new Element.Settings_Menu(data);
					break;
				case 'account':
					eMenu = new Element.Account_Menu(data);
					break;
			}
			
			this.elmts.wrapper.append(eMenu.render());
		},
		
		renderPages: function() {
			
			this.pages.fetch();
		
			for (var i = 0, _mPage; i < this.pages.length; i++) {
				
				_mPage = this.pages.at(i);
				
				this.drawPageTab(_mPage);
				
				if (_mPage.id === this.currentPage) {
					this.drawPage(_mPage);
				}
			}
		},
		
		drawPageTab: function(mPage) {
			this.elmts.footerPages.appendTemplate('page-tab', {
				name: mPage.get('name')
			});
		},
		
		drawPage: function(mPage) {
			
			var ePage = new Element.Page({
				model: mPage,
				parent: this
			});
			
			this.page = ePage;

			this.elmts.viewport.html(ePage.render());
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
		
		drawModule: function(mModule) {

			this.page.drawModule(mModule);
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
