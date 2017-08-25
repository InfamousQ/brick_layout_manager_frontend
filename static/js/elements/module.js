/*jshint browser: true, esversion: 6*/
/*global App, EventHandler, Globals, Baseplate, Plate, Rect, confirm*/
App.module = (function () {
	"use strict";
	var Module = {
		settings: {
			moduleElement: 'module',
			modulelistElement: 'module-list',
			inputHeightInBricksID: 'module-height',
			inputWidthInBricksID: 'module-width',
			heightInBricks: 32, // Initial value, updated when settings are updated
			widthInBricks: 32 // Initial value, updated when settings are updated
		},

		// Contains Plates. Index is id of plate
		baseplate: null,

		$module: null,
		$inputHeightInBricks: null,
		$inputWidthInBricks: null,

		bindEvents: function () {
			this.$inputHeightInBricks.onchange = this.sendSettings.bind(this);
			this.$inputWidthInBricks.onchange = this.sendSettings.bind(this);

			EventHandler.listen(EventHandler.MODULE_VIEW_EDIT_SIZE, Module.changeSettings.bind(this));
			EventHandler.listen(EventHandler.MODULE_VIEW_GENERATE_PLATE, Module.generatePlate.bind(this));
		},

		sendSettings: function (event) {
			// Read all projects settings to and event data and then emit them
			var settings = {
				heightInBricks: this.$inputHeightInBricks.value,
				widthInBricks: this.$inputWidthInBricks.value
			};

			EventHandler.emit(EventHandler.MODULE_VIEW_EDIT_SIZE, settings);
		},

		changeSettings: function (event) {
			// Read settings that come from sendSettings and change the internal values
			this.settings.heightInBricks = event.heightInBricks;
			this.settings.widthInBricks = event.widthInBricks;
		},

		generatePlate: function (data) {
			// Generate Rect from data
			var rect = null,
				plate = null;

			// Note: New rect's id is the next valid Plate id as Rect id == Plate id
			data.id = this.baseplate.getNextId();
			data.z = data.id;
			rect = Rect.fromEvent(data);
			if (rect === null) {
				return false;
			}

			// TODO: Should we generate Plate in Baseplate instead and just handle id here ?
			// Initialize r as drawn rect
			try {
				plate = Plate.fromRect(rect);
			} catch (e) {
				return false;
			}
			this.baseplate.addPlate(plate);
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
				plate_id = parseInt(f.getElementsByClassName('id')[0].textContent, 10),
				target_plate = this.baseplate.getPlateById(plate_id);
			target_plate.x = parseInt(f.getElementsByClassName('input-x')[0].value, 10);
			target_plate.y = parseInt(f.getElementsByClassName('input-y')[0].value, 10);
			target_plate.z = parseInt(f.getElementsByClassName('input-z')[0].value, 10);
			target_plate.height = parseInt(f.getElementsByClassName('input-height')[0].value, 10);
			target_plate.width = parseInt(f.getElementsByClassName('input-width')[0].value, 10);
			target_plate.color = f.getElementsByClassName('input-color')[0].value;

			EventHandler.emit(EventHandler.MODULE_VIEW_EDIT_PLATE, target_plate);
		},

		deleteRect: function (e) {
			var f = e.target.form,
				plate_id = parseInt(f.getElementsByClassName('id')[0].textContent, 10) - 1;

			// TODO: Confirm is a bit ugly hack, we should use some more nicer looking window..
			// Confirm deletion from user
			var user_allow_deletion = confirm('Do you wish to delete Plate ' + (plate_id + 1) + '?');
			if (!user_allow_deletion) {
				// User does not wish to delete selected Plate
				return;
			}

			// Remove from baseplate
			this.baseplate.remotePlateById(plate_id);

			EventHandler.emit(EventHandler.MODULE_VIEW_DELETE_PLATE, plate_id);
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
			this.baseplate = new Baseplate(this.populatePlateList.bind(this));
			this.$module = document.getElementById(this.settings.moduleElement);
			this.$modulelist = document.getElementById(this.settings.modulelistElement);
			this.$inputHeightInBricks = document.getElementById(this.settings.inputHeightInBricksID);
			this.$inputWidthInBricks = document.getElementById(this.settings.inputWidthInBricksID);

			this.sendSettings();
			this.bindEvents();
			this.populateColorSelect();

			return this;
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
		},

		/**
		 * Re-populates list of Plates inside Module-div.
		 */
		populatePlateList: function () {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$modulelist.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			// Generate new li-element for each plate in this.baseplate. li-element contains both short info text and edit form
			Array.from(this.baseplate.getPlates()).forEach(function (plate) {
				// Copy skeleton li
				var li = this.$modulelist.getElementsByClassName('skeleton')[0].cloneNode(true);
				// Add Plate information to the info span
				li.classList.remove('skeleton');
				li.id = "module-" + plate.id;
				li.getElementsByClassName('id')[0].textContent = plate.id;
				li.getElementsByClassName('x')[0].textContent = plate.x;
				li.getElementsByClassName('y')[0].textContent = plate.y;
				li.getElementsByClassName('z')[0].textContent = plate.z;
				li.getElementsByClassName('w')[0].textContent = plate.width;
				li.getElementsByClassName('h')[0].textContent = plate.height;
				li.getElementsByClassName('show-edit-module-form')[0].onclick = this.toggleEditForm.bind(this);
				// Add Plate information to the editing form
				li.getElementsByClassName('id')[1].textContent = plate.id;
				li.getElementsByClassName('input-x')[0].value = plate.x;
				li.getElementsByClassName('input-y')[0].value = plate.y;
				li.getElementsByClassName('input-z')[0].value = plate.z;
				li.getElementsByClassName('input-height')[0].value = plate.height;
				li.getElementsByClassName('input-width')[0].value = plate.width;
				this.$modulelist.appendChild(li);
				// Note: Add event to dynamically created form
				li.getElementsByClassName('edit-module-form')[0].onchange = this.editRect.bind(this);
				li.getElementsByClassName('input-delete')[0].onclick = this.deleteRect.bind(this);
			}, this);
		}
	};
	return Module.init();
}());