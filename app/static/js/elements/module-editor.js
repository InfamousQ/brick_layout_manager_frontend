/*jshint browser: true, esversion: 6*/
/*global App, API, EventHandler, Globals, Module, Plate, Rect, confirm*/
App.module_editor = (function () {
	"use strict";
	const ModuleEditor = {
		settings: {
			mainDiv: 'module-edit',
			moduleDataElement: 'module-data',
			moduleNameInputElement: 'module-form-name',
			moduleIsPublicInputElement: 'module-form-public',
			plateListElement: 'plate-list',
			saveButtonElement: 'save-module',
			deleteButtonElement: 'delete-module',
			inputHeightInBricksID: 'module-height',
			inputWidthInBricksID: 'module-width',
			heightInBricks: 32, // Initial value, updated when settings are updated
			widthInBricks: 32 // Initial value, updated when settings are updateds
		},

		storage_key_active_module_is_new: 'active_module_is_new',
		storage_key_active_module_id: 'active_module_id',

		// Contains Plates. Index is id of plate
		active_module_is_new: false,
		active_module: null,
		active_module_is_modified: false,

		color_list: {},

		$data: null,
		$moduleNameInput: null,
		$moduleIsPublicInput: null,
		$plateList: null,
		$saveButton: null,
		$deleteButton: null,
		$inputHeightInBricks: null,
		$inputWidthInBricks: null,

		init: function () {
			this.$data = document.getElementById(this.settings.moduleDataElement);
			this.$moduleNameInput = document.getElementById(this.settings.moduleNameInputElement);
			this.$moduleIsPublicInput = document.getElementById(this.settings.moduleIsPublicInputElement);
			this.$plateList = document.getElementById(this.settings.plateListElement);
			this.$saveButton = document.getElementById(this.settings.saveButtonElement);
			this.$deleteButton = document.getElementById(this.settings.deleteButtonElement);
			this.$inputHeightInBricks = document.getElementById(this.settings.inputHeightInBricksID);
			this.$inputWidthInBricks = document.getElementById(this.settings.inputWidthInBricksID);

			this.initLocalStorage();

			this.sendSettings();
			this.bindEvents();
			return this;
		},

		bindEvents: function () {
			this.$moduleNameInput.onchange = this.updateActiveModule.bind(this);
			this.$moduleIsPublicInput.onchange = this.updateActiveModule.bind(this);
			this.$inputHeightInBricks.onchange = this.sendSettings.bind(this);
			this.$inputWidthInBricks.onchange = this.sendSettings.bind(this);
			this.$saveButton.onclick = this.saveActiveModule.bind(this);
			this.$deleteButton.onclick = this.deleteActiveModule.bind(this);

			EventHandler.listen(EventHandler.MODULE_VIEW_SET_ACTIVE_MODULE, this.setModule.bind(this));
			EventHandler.listen(EventHandler.MODULE_VIEW_EDIT_SIZE, this.changeSettings.bind(this));
			EventHandler.listen(EventHandler.MODULE_VIEW_GENERATE_PLATE, this.generatePlate.bind(this));
		},

		initLocalStorage: function() {
			// LocalStorage initial values
			if (window.localStorage.getItem(this.storage_key_active_module_is_new) === null) {
				window.localStorage.setItem(this.storage_key_active_module_is_new, '1'); // Empty or '1'
			}
			if (window.localStorage.getItem(this.storage_key_active_module_id) === null) {
				window.localStorage.setItem(this.storage_key_active_module_id, ''); // Empty or string-casted int
			}
		},

		onActivation: function () {
			// Get list of colors
			API.fetchColors()
				.then(function (colors_data) {
					Array.from(colors_data).forEach( function(color_data) {
						this.color_list[color_data.id] = color_data;
					}.bind(this));
					this.populateColorSelect();
				}.bind(this));

			// See if we are editing existing module or creating new one by loading data from localStorage
			this.active_module_is_new = '1' === window.localStorage.getItem(this.storage_key_active_module_is_new);
			this.active_module = new Module(0, 'new module');
			if (this.active_module_is_new) {
				window.localStorage.setItem(this.storage_key_active_module_is_new, '1');
				// Initialize empty view
				this.activateView();
				return;
			}
			window.localStorage.setItem(this.storage_key_active_module_is_new, '');

			// Try to load module data from API. If unsuccessful, show warning pop up and load empty module view
			let current_active_module_id = window.localStorage.getItem(this.storage_key_active_module_id);
			current_active_module_id = parseInt(current_active_module_id);
			if (current_active_module_id > 0) {
				// Id is valid, load data from API
				API.fetchModule(current_active_module_id)
					.then(this.loadActiveModuleFromJSON.bind(this))
					.then(this.activateView.bind(this))
					.catch(function (error) {
						console.error(error);
					});
			} else {
				EventHandler.emit(EventHandler.ERROR_MSG, 'Module editor initialized without module');
				// Invalid id, display error pop up and initialize with empty view
				this.activateView();
			}
		},

		loadActiveModuleFromJSON: function (module_json) {
			this.active_module = Module.readFromJSON(module_json);
			window.localStorage.setItem(this.storage_key_active_module_id, this.active_module.id.toString());
			window.localStorage.setItem(this.storage_key_active_module_is_new, '');
		},

		activateView: function () {
			// Display only 'new-module' or 'old-module' elements depending on if the module is new or not
			let new_module_elements = Array.from(document.getElementsByClassName('new-module'));
			let old_module_elements = Array.from(document.getElementsByClassName('old-module'));
			if (this.active_module_is_new) {
				new_module_elements.forEach(function (e) {
					if (e.classList.contains('hidden')) {
						e.classList.remove('hidden');
					}
				});
				old_module_elements.forEach(function (e) {
					if (!e.classList.contains('hidden')) {
						e.classList.add('hidden');
					}
				});
			} else {
				new_module_elements.forEach(function (e) {
					if (e.classList.contains('hidden')) {
						e.classList.remove('hidden');
					}
				});
				old_module_elements.forEach(function (e) {
					if (!e.classList.contains('hidden')) {
						e.classList.add('hidden');
					}
				});
			}

			// Get module data to form
			this.$moduleNameInput.value = this.active_module.name;
			this.$moduleIsPublicInput.checked = this.active_module.is_public;


			// Reset view and data related to active module
			EventHandler.emit(EventHandler.VIEW_GRID_RESET, null);
			Array.from(this.active_module.plates.values()).forEach(function (p) {
				EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_PLATE, p);
			});
			this.active_module_is_modified = false;
			this.active_module.setOnChangeFunction(this.populatePlateList.bind(this));
			if (this.active_module.id > 0) {
				const active_p = this.$data.getElementsByClassName('edit-module')[0];
				active_p.style.display = "block";
				active_p.getElementsByClassName('id')[0].textContent = this.active_module.id;
				const deactive_p = this.$data.getElementsByClassName('new-module')[0];
				deactive_p.style.display = "none";
			} else {
				const active_p = this.$data.getElementsByClassName('new-module')[0];
				active_p.style.display = "block";
				const deactive_p = this.$data.getElementsByClassName('edit-module')[0];
				deactive_p.style.display = "none";
			}
			this.populatePlateList();
		},

		sendSettings: function (event) {
			// Read all projects settings to and event data and then emit them
			var settings = {
				heightInBricks: this.$inputHeightInBricks.value,
				widthInBricks: this.$inputWidthInBricks.value
			};

			EventHandler.emit(EventHandler.MODULE_VIEW_EDIT_SIZE, settings);
		},

		updateActiveModule: function () {
			this.active_module.name = this.$moduleNameInput.value;
			this.active_module.is_public = this.$moduleIsPublicInput.checked;
			this.markActiveModuleModified();
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
			data.id = this.active_module.getNextId();
			data.z = data.id;
			rect = Rect.fromEvent(data);
			rect.color = Globals.COLOR_ID;
			if (rect === null) {
				return false;
			}

			// TODO: Should we generate Plate in Module instead and just handle id here ?
			// Initialize r as drawn rect
			try {
				plate = Plate.fromRect(rect);
				plate.markAsNew(true);
			} catch (e) {
				return false;
			}
			this.active_module.addPlate(plate);
			EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_PLATE, plate);

			// Mark module as modified
			this.markActiveModuleModified();
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
				target_plate = this.active_module.getPlateById(plate_id);
			target_plate.x = parseInt(f.getElementsByClassName('input-x')[0].value, 10);
			target_plate.y = parseInt(f.getElementsByClassName('input-y')[0].value, 10);
			target_plate.z = parseInt(f.getElementsByClassName('input-z')[0].value, 10);
			target_plate.height = parseInt(f.getElementsByClassName('input-height')[0].value, 10);
			target_plate.width = parseInt(f.getElementsByClassName('input-width')[0].value, 10);
			target_plate.color_id = f.getElementsByClassName('input-color')[0].value;

			EventHandler.emit(EventHandler.MODULE_VIEW_EDIT_PLATE, target_plate);

			// Edit active_modules plate
			this.active_module.editPlateById(target_plate.id, target_plate);

			// Mark module as modified
			this.markActiveModuleModified();
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

			// Remove from module
			this.active_module.remotePlateById(plate_id);

			EventHandler.emit(EventHandler.MODULE_VIEW_DELETE_PLATE, plate_id);

			// Mark module as modified
			this.markActiveModuleModified();
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

		setModule(event_data) {
			// TODO: Add sanity check
			const active_module_id = parseInt(event_data);
			if (active_module_id > 0) {
				// Existing module, set active item to localStorage for later use
				window.localStorage.setItem(this.storage_key_active_module_id, active_module_id.toString());
				window.localStorage.setItem(this.storage_key_active_module_is_new, '');
			} else {
				// New module
				window.localStorage.setItem(this.storage_key_active_module_id, '');
				window.localStorage.setItem(this.storage_key_active_module_is_new, '1');
			}
		},

		markActiveModuleModified: function() {
			if (this.active_module_is_modified === false) {
				this.active_module_is_modified = true;
			}
		},

		saveActiveModule: function() {
			if (this.active_module_is_modified === false) {
				// Currently open module is not modified, save is not necessary
				return;
			}

			API.saveModuleFetch(this.active_module)
				.then( function (data) {
					window.alert('Module #' + this.active_module.id + " saved");
					// Currently open module is modified, save it.
					EventHandler.emit(EventHandler.MODULES_SAVE_MODULE, this.active_module);
					console.log(data);
					this.active_module_is_modified = false;
				}.bind(this)).then(this.saveActiveModulePlates.bind(this))
				.then( function(data) {
					console.log('After all modules and plates');
					console.log(data);
				})
				.catch( function (error) {
					console.error(error);
				}).finally( function (data) {
				// Direct user to saved module's edit view
				window.location.hash = "moduleeditor";
				});
		},

		saveActiveModulePlates: function() {
			let plate_api_saves = [];
			this.active_module.plates.forEach( function (plate) {
				plate_api_saves.push(API.savePlateFetch(this.active_module.id, plate));
			}.bind(this));
			return Promise.all(plate_api_saves);
		},

		deleteActiveModule: function() {
			if (this.active_module.id === 0) {
				// TODO: Create nicer dialog system
				// Generating new module, do not allow deleting
				window.alert('Cannot delete new module');
				return;
			}

			if (!window.confirm("Are you sure you wish to delete module #" + this.active_module.id)) {
				return;
			}
			// Send deletion message
			EventHandler.emit(EventHandler.MODULES_DELETE_BY_ID, this.active_module.id);
			// Direct user to new module's edit view
			window.location = window.location.origin + window.location.pathname + "#module-0";
		},

		populateColorSelect: function () {
			// Populate input-color select element with hard-coded values from Globals.COLORS global
			let color_select = document.getElementsByClassName('input-color')[0];
			for (const color_id in this.color_list) {
				let color = this.color_list[color_id];
				let opt = document.createElement('option');
				opt.value = color.id;
				opt.setAttribute('data-color-hex', color.hex);
				opt.innerHTML = color.name;
				color_select.appendChild(opt);
			}
		},

		/**
		 * Re-populates list of Plates inside ModuleView-div.
		 */
		populatePlateList: function () {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$plateList.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			// Generate new li-element for each plate in this.active_module. li-element contains both short info text and edit form
			Array.from(this.active_module.getPlates()).forEach(function (plate) {
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
				li.querySelector('select.input-color').value = plate.color_id
				this.$plateList.appendChild(li);
				// Note: Add event to dynamically created form
				li.getElementsByClassName('edit-plate-form')[0].onchange = this.editRect.bind(this);
				li.getElementsByClassName('input-delete')[0].onclick = this.deleteRect.bind(this);
			}, this);
		},

		getColorData: function (color_id) {
			return this.color_list[color_id];
		}
	};
	return ModuleEditor.init();
}());