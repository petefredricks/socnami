(function(win, $) {

//	var socket = io.connect();
	var App = Backbone.View.extend({

		el: 'body',
		elmts: {},
		page: null,

		initialize: function () {
			
			this.definitions = new Model.Definitions();
			this.settings = new Model.Settings();
			
			this.pages = new Collection.Pages();
			this.menus = new Collection.Menus();
			this.modules = new Collection.Modules();
			
			// get data
			this.modules.fetch();
			this.settings.fetch();
			
			// common elements
			this.elmts = {
				'header': $('#socnami-header'),
				'wrapper': $('#socnami-wrapper'),
				'viewport': $('#socnami-viewport'),
				'footer': $('#socnami-footer')
			}
			
			this.menus.bind('add', this.drawMenu, this);
			this.modules.bind('add', this.drawModule, this);
			
			this.pages.bind('add', this.addPage, this);
			this.pages.bind('change:active', this.changePage, this);
			
			$(window).bind('beforeunload', $.proxy(this, 'syncToStorage'));
		},
		
		events: {
			'click #footer-add-page': 'createPage'
		},
		
		createPage: function() {
			
			var name = prompt('New page:', 'New Page');
			
			if (name) {
				this.pages.add({ name: name });
			}
		},
		
		addPage: function(mPage) {
			
			var tab = new View.Page_Tab({model: mPage}).render();

			this.elmts.footerPages.append(tab);

			this.changePage(mPage, true);
		},
		
		render: function() {
			
			this.drawFooter();
			this.renderMenus();
			this.renderPages();
		},
		
		renderMenus: function() {

			var list = this.definitions.menus;
			
			for (var key in list) {
				this.menus.add({
					type: key,
					text: list[key].text
				});
			}
		},
		
		drawMenu: function(mMenu) {
			
			var type = mMenu.get('type');
			
			var data = { 
				model: mMenu,
				parent: this
			};
			var vMenu;
			
			switch(type) {
				case 'launcher':
					var modules = [];
					
					for (var mod in this.definitions.modules) {
						modules.push({
							type: mod,
							title: this.definitions.modules[mod].title
						})
					}
					
					mMenu.set({ modules: modules });
					vMenu = new View.Launcher_Menu(data);
					break;
					
				case 'settings':
					var settings = [];
					
					for (var set in this.definitions.settings) {
						settings.push({
							type: set,
							definition: this.definitions.settings[set],
							value: this.settings.get(set)
						});
					}
					
					mMenu.set({ settings: settings });
					vMenu = new View.Settings_Menu(data);
					break;
					
				case 'account':
					vMenu = new View.Account_Menu(data);
					break;
			}
			
			this.elmts.header.append(vMenu.render());
		},
		
		renderPages: function() {
			
			this.pages.fetch();
			
			var _mPage, _tab;
		
			for (var i = 0; i < this.pages.length; i++) {
				
				_mPage = this.pages.at(i);
				_tab = new View.Page_Tab({model: _mPage}).render();
				
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
			return this.settings.get('animate') ? speed : 0;
		},
		
		changePage: function(mPage, isActive) {
			
			if (isActive) {
				mPage.initialize();
				this.pages.setActive(mPage);
				this.drawPage(mPage);
			}
			else {
				mPage.trigger('clear');
			}
		},
		
		syncToStorage: function() {
			
			this.modules.indexAndSave();
			this.pages.saveAll();
			this.settings.save();
			
			var data = {
				modules: this.modules.toJSON(),
				pages: this.pages.toJSON(),
				settings: this.settings.toJSON()
			}
			
			$.post('/save', data);
		},
		
		drawModule: function(mModule) {

			this.page.trigger('draw-module', mModule);
		}
	});
	
	function loadApp() {
		
		$.loadTemplates({
			paths: [
				'../templates/app.tmpl',
				'../templates/module.tmpl'
			],
			onload: function() {
				$('#socnami-cover').hide();
				win.APP = new App();
				win.APP.render();
			}
		});
	}
	
	function doAuth() {
		
		var form = $(this);
		form.addClass('loading');
		
		$.post('/login', form.serialize(), function(data) {
			
			$('#login-password').val('');
			
			if (data && data.status) {
				router.navigate('', true);
				form.off('submit');
			}
			else {
				form.toggleClass('error loading');
			}
		});
		
		return false;
	}
	
	var router = new (Backbone.Router.extend({

		routes: {
			'login': 'showLogin',
			'': 'loadApp'
		},

		showLogin: function() {
			$('#socnami-cover').show();
			$('#login')
				.removeClass('loading')
				.on('submit', doAuth);
			$('#login-username').focus();
		},
		
		loadApp: function() {
			loadApp();
		}
	}))();
	
	$(document).ready(function() {
		
		// start routing
		Backbone.history.start({
			pushState: true
		});
	});
	
	// these are the global vars for application;
	win.View = {};
	win.Model = {};
	win.Collection = {};
	win.router = router;
	
})(window, jQuery);
