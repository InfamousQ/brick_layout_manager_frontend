/*jshint browser: true, esversion: 6*/
/*global App, EventHandler, Globals, Baseplate, Plate, Rect, confirm*/
App.baseplate_view = (function () {
	"use strict";
	var BaseplateView = {
		settings: {
			mainDiv: 'baseplate-edit',
			baseplateDataElement: 'baseplate-data',
			plateListElement: 'plate-list',
			saveButtonElement: 'save-baseplate',
			deleteButtonElement: 'delete-baseplate',
			inputHeightInBricksID: 'baseplate-height',
			inputWidthInBricksID: 'baseplate-width',
			heightInBricks: 32, // Initial value, updated when settings are updated
			widthInBricks: 32 // Initial value, updated when settings are updated
		},

		// Contains Plates. Index is id of plate
		active_baseplate: null,
		active_baseplate_is_modified: false,

		$data: null,
		$plateList: null,
		$saveButton: null,
		$deleteButton: null,
		$inputHeightInBricks: null,
		$inputWidthInBricks: null,

		bindEvents: function () {
			this.$inputHeightInBricks.onchange = this.sendSettings.bind(this);
			this.$inputWidthInBricks.onchange = this.sendSettings.bind(this);
			this.$saveButton.onclick = this.saveActiveBaseplate.bind(this);
			this.$deleteButton.onclick = this.deleteActiveBaseplate.bind(this);

			EventHandler.listen(EventHandler.MODULE_VIEW_EDIT_SIZE, this.changeSettings.bind(this));
			EventHandler.listen(EventHandler.MODULE_VIEW_GENERATE_PLATE, this.generatePlate.bind(this));
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
			data.id = this.active_baseplate.getNextId();
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
			this.active_baseplate.addPlate(plate);
			EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_PLATE, plate);

			// Mark baseplate as modified
			if (this.active_baseplate_is_modified === false) {
				this.active_baseplate_is_modified = true;
			}
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
				target_plate = this.active_baseplate.getPlateById(plate_id);
			target_plate.x = parseInt(f.getElementsByClassName('input-x')[0].value, 10);
			target_plate.y = parseInt(f.getElementsByClassName('input-y')[0].value, 10);
			target_plate.z = parseInt(f.getElementsByClassName('input-z')[0].value, 10);
			target_plate.height = parseInt(f.getElementsByClassName('input-height')[0].value, 10);
			target_plate.width = parseInt(f.getElementsByClassName('input-width')[0].value, 10);
			target_plate.color = f.getElementsByClassName('input-color')[0].value;

			EventHandler.emit(EventHandler.MODULE_VIEW_EDIT_PLATE, target_plate);

			// Mark baseplate as modified
			if (this.active_baseplate_is_modified === false) {
				this.active_baseplate_is_modified = true;
			}
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
			this.active_baseplate.remotePlateById(plate_id);

			EventHandler.emit(EventHandler.MODULE_VIEW_DELETE_PLATE, plate_id);

			// Mark baseplate as modified
			if (this.active_baseplate_is_modified === false) {
				this.active_baseplate_is_modified = true;
			}
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
			f = li.getElementsByClassName('edit-plate-form')[0];
			f.style.display = ('block' === f.style.display) ? 'none' : 'block';
		},

		init: function (baseplate_id = 0) {
			this.$data = document.getElementById(this.settings.baseplateDataElement);
			this.$plateList = document.getElementById(this.settings.plateListElement);
			this.$saveButton = document.getElementById(this.settings.saveButtonElement);
			this.$deleteButton = document.getElementById(this.settings.deleteButtonElement);
			this.$inputHeightInBricks = document.getElementById(this.settings.inputHeightInBricksID);
			this.$inputWidthInBricks = document.getElementById(this.settings.inputWidthInBricksID);

			this.sendSettings();
			this.bindEvents();
			this.populateColorSelect();
			this.setBaseplate(baseplate_id);
			return this;
		},

		setBaseplate(baseplate_id = 0) {
				// TODO: Nasty coupling here, figure out another way to do this
			if (App.baseplate_list.storage.baseplates.has(baseplate_id)) {
				if (baseplate_id === this.active_baseplate.id) {
					// Baseplate is already shown
					return;
				} else {
					// If baseplate_id is given, we get the _copy_ of that baseplate. Map usually returns a direct reference to the item in Map but we do not want that.
					this.active_baseplate = App.baseplate_list.storage.baseplates.get(baseplate_id).getCopy();
					// Reset view and create baseplate's existing plates.

				}
			} else {
				if (baseplate_id > 0) {
					// Route to new baseplate view
				window.location = window.location.origin + window.location.pathname + "#baseplate-0";
				} else {
					this.active_baseplate = new Baseplate(0);
				}
			}

			// Reset view and data related to active baseplate
			EventHandler.emit(EventHandler.VIEW_GRID_RESET, null);
			Array.from(this.active_baseplate.plates.values()).forEach(function (p) {
				EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_PLATE, p);
				});
			this.active_baseplate_is_modified = false;
			this.active_baseplate.setOnChangeFunction(this.populatePlateList.bind(this));
			if (this.active_baseplate.id > 0) {
				const active_p = this.$data.getElementsByClassName('edit-baseplate')[0];
				active_p.style.display = "block";
				active_p.getElementsByClassName('id')[0].textContent = this.active_baseplate.id;
				const deactive_p = this.$data.getElementsByClassName('new-baseplate')[0];
				deactive_p.style.display = "none";
			} else {
				const active_p = this.$data.getElementsByClassName('new-baseplate')[0];
				active_p.style.display = "block";
				const deactive_p = this.$data.getElementsByClassName('edit-baseplate')[0];
				deactive_p.style.display = "none";
			}
			this.populatePlateList();
		},

		saveActiveBaseplate: function() {
			if (this.active_baseplate_is_modified === false) {
				// Currently open baseplate is not modified, save is not necessary
				return;
			}

			// Currently open baseplate is modified, save it.
			EventHandler.emit(EventHandler.MODULES_SAVE_BASEPLATE, this.active_baseplate);
			// TODO: need a nicer dialog
			window.alert('Baseplate #' + this.active_baseplate.id + " saved");
			this.active_baseplate_is_modified = false;
			// Direct user to saved baseplate's edit view
			window.location = window.location.origin + window.location.pathname + "#baseplate-" + this.active_baseplate.id;
		},

		deleteActiveBaseplate: function() {
			if (this.active_baseplate.id === 0) {
				// TODO: Create nicer dialog system
				// Generating new baseplate, do not allow deleting
				window.alert('Cannot delete new baseplate');
				return;
			}

			if (!window.confirm("Are you sure you wish to delete baseplate #" + this.active_baseplate.id)) {
				return;
			}
			// Send deletion message
			EventHandler.emit(EventHandler.MODULES_DELETE_BASEPLATE_BY_ID, this.active_baseplate.id);
			// Direct user to new baseplate's edit view
			window.location = window.location.origin + window.location.pathname + "#baseplate-0";
		},

		allowRouting: function(baseplate_id) {
			if (baseplate_id == this.active_baseplate.id) {
				return true;
			} else {
				if (this.active_baseplate_is_modified) {
					// Current baseplate is modified, confirm if user wants to save before changing baseplate
					if (window.confirm('Currently shown Baseplate is modified, do you wish to save it before changing to new Baseplate?')) {
						EventHandler.emit(EventHandler.MODULES_SAVE_BASEPLATE, this.active_baseplate);
						return true;
					} else {
						// User does not want to save, ask if user wants to open new baseplate anyway
						if (window.confirm('Modifications to currently shown Baseplate are not saved, are you sure you want to open new Baseplate?')) {
							return true;
						} else {
							return false;
						}
					}
				} else {
					// Baseplate is not changed, allow routing
					return true;
				}
				return true;
			}
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
		 * Re-populates list of Plates inside BaseplateView-div.
		 */
		populatePlateList: function () {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$plateList.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			// Generate new li-element for each plate in this.active_baseplate. li-element contains both short info text and edit form
			Array.from(this.active_baseplate.getPlates()).forEach(function (plate) {
				// Copy skeleton li
				var li = this.$plateList.getElementsByClassName('skeleton')[0].cloneNode(true);
				// Add Plate information to the info span
				li.classList.remove('skeleton');
				li.id = "module-" + plate.id;
				li.getElementsByClassName('id')[0].textContent = plate.id;
				li.getElementsByClassName('x')[0].textContent = plate.x;
				li.getElementsByClassName('y')[0].textContent = plate.y;
				li.getElementsByClassName('z')[0].textContent = plate.z;
				li.getElementsByClassName('w')[0].textContent = plate.width;
				li.getElementsByClassName('h')[0].textContent = plate.height;
				li.getElementsByClassName('show-edit-plate-form')[0].onclick = this.toggleEditForm.bind(this);
				// Add Plate information to the editing form
				li.getElementsByClassName('id')[1].textContent = plate.id;
				li.getElementsByClassName('input-x')[0].value = plate.x;
				li.getElementsByClassName('input-y')[0].value = plate.y;
				li.getElementsByClassName('input-z')[0].value = plate.z;
				li.getElementsByClassName('input-height')[0].value = plate.height;
				li.getElementsByClassName('input-width')[0].value = plate.width;
				this.$plateList.appendChild(li);
				// Note: Add event to dynamically created form
				li.getElementsByClassName('edit-plate-form')[0].onchange = this.editRect.bind(this);
				li.getElementsByClassName('input-delete')[0].onclick = this.deleteRect.bind(this);
			}, this);
		}
	};
	return BaseplateView.init();
}());