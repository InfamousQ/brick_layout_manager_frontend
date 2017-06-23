/*global EventHandler, Globals */
(function () {
	"use strict";
	var Module = {
		settings: {
			moduleElement: 'module',
			modulelistElement: 'module-list'
		},

		// Contains dimensions of each rect. Index in array is regarded as id of rect
		rects: [],

		$module: null,

		bindEvents: function () {
			EventHandler.listen(EventHandler.MODULE_VIEW_GENERATE_RECT, Module.generateRect.bind(this));
		},

		generateRect: function (data) {
			// Ensure data is valid
			if (!this.isRectDataValid(data)) {
				return false;
			}

			// Initialize rect and push it to storage
			var r = {
				id: this.rects.length + 1,
				x: data.start.x,
				y: data.start.y,
				width: data.end.x - data.start.x,
				height: data.end.y - data.start.y
			},
				li = this.$modulelist.getElementsByClassName('skeleton')[0].cloneNode(true);
			this.rects.push(r);

			// Generate graphical representations of the rect. One to module, one to view.
			// Copy skeleton li, fill points and then add to ul
			li.classList.remove('skeleton');
			li.getElementsByClassName('id')[0].textContent = r.id;
			li.getElementsByClassName('x')[0].textContent = (r.x / Globals.BRICKSIZE);
			li.getElementsByClassName('y')[0].textContent = (r.y / Globals.BRICKSIZE);
			li.getElementsByClassName('w')[0].textContent = (r.width / Globals.BRICKSIZE);
			li.getElementsByClassName('h')[0].textContent = (r.height / Globals.BRICKSIZE);
			this.$modulelist.appendChild(li);

			EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_BOX, r);
		},

		isRectDataValid: function (data) {
			if (!data.hasOwnProperty('start') || !data.hasOwnProperty('end')) {
				return false;
			}
			if (!data.start.hasOwnProperty('x') || !data.start.hasOwnProperty('y')) {
				return false;
			}

			if (!data.end.hasOwnProperty('x') || !data.end.hasOwnProperty('y')) {
				return false;
			}
			return true;
		},

		init: function () {
			this.$module = document.getElementById(this.settings.moduleElement);
			this.$modulelist = document.getElementById(this.settings.modulelistElement);
			this.bindEvents();
		}
	};
	Module.init();
}());