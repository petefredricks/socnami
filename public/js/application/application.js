(function(win, $) {
	
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
					eMenu = new View.Launcher_Menu(data);
					break;
				case 'settings':
					eMenu = new View.Settings_Menu(data);
					break;
				case 'account':
					eMenu = new View.Account_Menu(data);
					break;
			}
			
			this.elmts.wrapper.append(eMenu.render());
		},
		
		renderPages: function() {
			
			this.pages.fetch();
			
			var _mPage, _tab;
		
			for (var i = 0; i < this.pages.length; i++) {
				
				_mPage = this.pages.at(i);
				_tab = new View.Page_Tab({ model: _mPage }).render();
				
				this.elmts.footerPages.append(_tab);
				
				if (_mPage.get('active')) {
					this.drawPage(_mPage);
				}
			}
		},
		
		drawPage: function(mPage) {
			
			this.page = mPage;
			
			var vPage = new View.Page({
				model: mPage,
				parent: this
			});

			this.elmts.viewport.html(vPage.render());
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
			
			this.pages.bind('change:active', function(mPage) {
				
				this.pages.each(function(_mPage) {
					
					if (_mPage.cid != mPage) {
						_mPage.set({active: false}, {silent:true});
					}
				});
				
				this.drawPage(mPage);
				
			}, this);
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
				'../templates/module.tmpl'
			],
			onload: function() {
				win.APP = new App();
				win.APP.render();
			}
		});
	});
	
	// these are the global vars for application;
	win.View = {};
	win.Model = {};
	win.Collection = {};
	
})(window, jQuery);
