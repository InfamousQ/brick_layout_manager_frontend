/*global console*/
var EventHandler = {
	// Event types
	VIEW_GRID_MOUSE_IN: 'view_grid_mouse_in',
	VIEW_GRID_MOUSE_MOVE: 'view_grid_mouse_move',
	VIEW_GRID_MOUSE_OUT: 'view_grid_mouse_out',
	VIEW_GRID_CLICK: 'view_grid_click',
	VIEW_GRID_GENERATE_PLATE: 'view_grid_generate_plate',
	VIEW_GRID_GENERATE_POINT: 'view_grid_generate_point',
	VIEW_GRID_RESET: 'view_grid_reset',

	MODULE_VIEW_GENERATE_PLATE: 'module_view_generate_plate',
	MODULE_VIEW_EDIT_PLATE: 'module_view_edit_rect',
	MODULE_VIEW_DELETE_PLATE: 'module_view_delete_rect',
	MODULE_VIEW_EDIT_SIZE: 'module_view_edit_size',

	MODULES_SAVE_BASEPLATE: 'modules_save_baseplate',
	MODULES_DELETE_BASEPLATE_BY_ID: 'modules_delete_baseplate_by_id',

	LAYOUT_EDITOR_SET_LAYOUT: 'layout_editor_set_layout',

	LOGIN_INIT: 'login_init',
	LOGIN_RENDER_PROVIDERS: 'login_render_providers',

	USER_ACTIVATE: 'user_activate',

	ERROR_MSG: 'error_msg',
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