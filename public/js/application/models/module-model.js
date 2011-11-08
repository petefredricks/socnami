Collection.Modules = Backbone.Collection.extend({
	
	model: Model.Module,
	
	localStorage: new Store("modules"),
	
	comparator: function(model) {
		return model.get('index');
	},
	
	getPageModules: function(page) {
		return this.filter(function(module) {
			return (module.get('page') == page);
		});
	},
	
	indexAndSave: function(modules) {
		
		var _cid, _module, _col, _attr, _pos;

		for (var i = 0; i < modules.length; i++) {
			_module = $(modules[i])
			_cid = _module.data('cid');
			_col = _module.data('col');
			_attr = {index: i};

			if (isNaN(_col)) {
				_pos = _module.position();
				_attr.left = _pos.left;
				_attr.top = _pos.top;
			}
			else {
				_attr.col = _col;
			}

			var mModule = this.getByCid(_cid);
			mModule.set(_attr);
			mModule.save();
		}
	}
});


Model.Module = Backbone.Model.extend({
	
});
