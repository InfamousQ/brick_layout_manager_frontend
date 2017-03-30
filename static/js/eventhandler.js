var EventHandler = {
	// Event types
	VIEW_GRID_CLICK: 'view_grid_click',
	VIEW_GRID_GENERATE_BOX: 'view_grid_generate_box',
	VIEW_GRID_GENERATE_POINT: 'view_grid_generate_point',

	MODULE_VIEW_GENERATE_RECT: 'module_view_generate_rect',

	// Event mapping
	handlers: [],

	listen: function (type, func) {
		'use strict';
		if (!(this.handlers.hasOwnProperty(type))) {
			this.handlers[type] = [];
		}
		this.handlers[type].push(func);
	},

	emit: function (type, arg) {
		'use strict';
		var i = 0,
			len = 0;
		if (!(this.handlers.hasOwnProperty(type))) {
			return;
		}
		for (len = this.handlers[type].length; i < len; i += 1) {
			this.handlers[type][i](arg);
		}
	}
};