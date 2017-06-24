/*global EventHandler, Globals */
(function () {
	"use strict";
	var Module = {
		settings: {
			moduleElement: 'module',
			modulelistElement: 'module-list'
		},

		// Contains dimensions of each rect. Index in array is regarded as id of rect. 
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

			// Initialize r as drawn rect
			var r = {
				id: this.rects.length + 1,
				x: data.start.x,
				y: data.start.y,
				width: data.end.x - data.start.x,
				height: data.end.y - data.start.y
			},
			// Initialize "module" with dimensions in studs
				br = {
					x: r.x / Globals.BRICKSIZE,
					y: r.y / Globals.BRICKSIZE,
					width: r.width / Globals.BRICKSIZE,
					height: r.height / Globals.BRICKSIZE
				},
				li = this.$modulelist.getElementsByClassName('skeleton')[0].cloneNode(true);
			this.rects.push(br);

			// Generate graphical representations of the rect. One to module, one to view.
			// Copy skeleton li, fill points and then add to ul
			li.classList.remove('skeleton');
			li.getElementsByClassName('id')[0].textContent = r.id;
			li.getElementsByClassName('x')[0].textContent = r.x;
			li.getElementsByClassName('y')[0].textContent = r.y;
			li.getElementsByClassName('w')[0].textContent = r.width;
			li.getElementsByClassName('h')[0].textContent = r.height;
			// Form for editing the rects
			li.getElementsByClassName('id')[1].textContent = r.id;
			li.getElementsByClassName('input-x')[0].value = br.x;
			li.getElementsByClassName('input-y')[0].value = br.y;
			li.getElementsByClassName('input-height')[0].value = br.height;
			li.getElementsByClassName('input-width')[0].value = br.width;
			this.$modulelist.appendChild(li);
			// Note: Add event to dynamically created form
			li.getElementsByClassName('edit-module-form')[0].onchange = this.editRect.bind(this);

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

		editRect: function (e) {
			// Get rect data from form that is connected to event e
			var f = e.target.form,
				r = {
					id: f.getElementsByClassName('id')[0].textContent,
					x: f.getElementsByClassName('input-x')[0].value * Globals.BRICKSIZE,
					y: f.getElementsByClassName('input-y')[0].value * Globals.BRICKSIZE,
					height: f.getElementsByClassName('input-height')[0].value * Globals.BRICKSIZE,
					width: f.getElementsByClassName('input-width')[0].value * Globals.BRICKSIZE
				};

			EventHandler.emit(EventHandler.VIEW_GRID_EDIT_RECT, r);
		},

		init: function () {
			this.$module = document.getElementById(this.settings.moduleElement);
			this.$modulelist = document.getElementById(this.settings.modulelistElement);
			this.bindEvents();
		}
	};
	Module.init();
}());