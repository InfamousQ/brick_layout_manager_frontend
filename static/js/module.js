/*jshint browser: true*/
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
				height: data.end.y - data.start.y,
				color: Globals.COLORS.default
			},
			// Initialize "module" with dimensions in studs
				br = {
					x: r.x / Globals.BRICKSIZE,
					y: r.y / Globals.BRICKSIZE,
					width: r.width / Globals.BRICKSIZE,
					height: r.height / Globals.BRICKSIZE,
					color: Globals.COLORS.default // Default color
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
			li.getElementsByClassName('show-edit-module-form')[0].onclick = this.toggleEditForm.bind(this);
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
					width: f.getElementsByClassName('input-width')[0].value * Globals.BRICKSIZE,
					color: f.getElementsByClassName('input-color')[0].value
				};

			EventHandler.emit(EventHandler.VIEW_GRID_EDIT_RECT, r);
		},

		toggleEditForm: function (e) {
			var f = null,
				li = null;
			// if event's target's tag is span, a is the parent;
			if (e.target.tagName === 'SPAN') {
				li = e.target.parentElement.parentElement;
			} else {
				li= e.target.parentElement;
			}
			f = li.getElementsByClassName('edit-module-form')[0];
			f.style.display = ('block' === f.style.display) ? 'none' : 'block';
		},

		init: function () {
			this.$module = document.getElementById(this.settings.moduleElement);
			this.$modulelist = document.getElementById(this.settings.modulelistElement);
			this.bindEvents();
			this.populateColorSelect();
		},

		populateColorSelect: function () {
			// Populate input-color select element with hard-coded values from Globals.COLORS global
			var color_select = document.getElementsByClassName('input-color')[0];
			for (const c in Globals.COLORS) {
				var opt = document.createElement('option');
				opt.value = Globals.COLORS[c];
				opt.innerHTML = c;
				color_select.appendChild(opt);
			}
		}
	};
	Module.init();
}());