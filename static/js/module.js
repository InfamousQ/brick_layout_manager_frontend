/*jshint browser: true, esversion: 6*/
/*global EventHandler, Globals, Baseplate, Plate, Rect*/
(function () {
	"use strict";
	var Module = {
		settings: {
			moduleElement: 'module',
			modulelistElement: 'module-list'
		},

		// Contains SVG Rect representations of Plates. Index is id of representative plate in this.baseplate's collection.
		rects: [],
		// Contains Plates. Index is id of plate
		baseplate: null,

		$module: null,

		bindEvents: function () {
			EventHandler.listen(EventHandler.MODULE_VIEW_GENERATE_PLATE, Module.generatePlate.bind(this));
		},

		generatePlate: function (data) {
			// Generate Rect from data
			var rect = null,
				plate = null;
			try {
				// Note: New rect's id is the next valid Plate id as Rect id == Plate id
				data.id = this.baseplate.getNextId();
				rect = Rect.fromEvent(data);
			} catch (e) {
				console.log("Could not generate rect from data: ", data);
				return false;
			}

			// TODO: Should we generate Plate in Baseplate instead and just handle id here ?
			// Initialize r as drawn rect
			try {
				plate = Plate.fromRect(rect);
			} catch (e) {
				return false;
			}
			var li = this.$modulelist.getElementsByClassName('skeleton')[0].cloneNode(true);

			this.baseplate.addPlate(plate);

			// Generate graphical representations of the rect. One to module, one to view.
			// Copy skeleton li, fill points and then add to ul
			li.classList.remove('skeleton');
			li.getElementsByClassName('id')[0].textContent = (plate.id + 1);
			li.getElementsByClassName('x')[0].textContent = plate.x;
			li.getElementsByClassName('y')[0].textContent = plate.y;
			li.getElementsByClassName('w')[0].textContent = plate.width;
			li.getElementsByClassName('h')[0].textContent = plate.height;
			li.getElementsByClassName('show-edit-module-form')[0].onclick = this.toggleEditForm.bind(this);
			// Form for editing the plates
			li.getElementsByClassName('id')[1].textContent = (plate.id + 1);
			li.getElementsByClassName('input-x')[0].value = plate.x;
			li.getElementsByClassName('input-y')[0].value = plate.y;
			li.getElementsByClassName('input-height')[0].value = plate.height;
			li.getElementsByClassName('input-width')[0].value = plate.width;
			this.$modulelist.appendChild(li);
			// Note: Add event to dynamically created form
			li.getElementsByClassName('edit-module-form')[0].onchange = this.editRect.bind(this);

			EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_PLATE, plate);
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
				plate_id = parseInt(f.getElementsByClassName('id')[0].textContent),
				target_plate = this.baseplate.getPlateById(plate_id - 1);
			target_plate.x = parseInt(f.getElementsByClassName('input-x')[0].value);
			target_plate.y = parseInt(f.getElementsByClassName('input-y')[0].value);
			target_plate.height = parseInt(f.getElementsByClassName('input-height')[0].value);
			target_plate.width = parseInt(f.getElementsByClassName('input-width')[0].value);
			target_plate.color = f.getElementsByClassName('input-color')[0].value;

			EventHandler.emit(EventHandler.MODULE_VIEW_EDIT_PLATE, target_plate);
		},

		toggleEditForm: function (e) {
			var f = null,
				li = null;
			// if event's target's tag is span, a is the parent;
			if (e.target.tagName === 'SPAN') {
				li = e.target.parentElement.parentElement;
			} else {
				li = e.target.parentElement;
			}
			f = li.getElementsByClassName('edit-module-form')[0];
			f.style.display = ('block' === f.style.display) ? 'none' : 'block';
		},

		init: function () {
			this.baseplate = new Baseplate();
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