/*jshint esversion: 6 */
/*global App, EventHandler, document, CallbackMap, Module, Plate, Rect, window */
App.modules = (function () {
	"use strict";
	class Storage {
		constructor (onchangefunction) {
			this.modules = new CallbackMap(onchangefunction);
		}

		loadArray(arr) {
			arr.forEach(function (item) {
				this.modules.set(item.id, item);
			}, this);
		}

		/**
		 * Get next id (greatest + 1) for Plate in this module
		 * @returns {number} Next available id
		 */
		getNextId() {
			var curMaxId = Array.from(this.modules.keys()).reduce(function (curMax, curVal) {
				return Math.max(curMax, curVal);
			}, 0);
			return curMaxId + 1;
		}

		getModules() {
			return this.modules.values();
		}
	}

	const Modules = {
		settings: {
			mainDiv: 'module-list',
			moduleListElement: 'module-collection',
			addModuleButtonElement: 'add-module',
		},

		storage: null,

		$moduleList: null,
		$addModuleButton: null,

		bindEvents: function() {
			this.$addModuleButton.onclick = this.addModule.bind(this);

			// TODO: Refactor and rethink how to set up new module. Display module info first and then allow editing it?
			EventHandler.listen(EventHandler.MODULES_SAVE_MODULE, this.saveModule.bind(this));
			EventHandler.listen(EventHandler.MODULES_DELETE_BY_ID, this.deleteModule.bind(this));
		},

		init: function () {
			this.storage = new Storage(this.onStorageUpdate.bind(this));
			this.$moduleList = document.getElementById(this.settings.moduleListElement);
			this.$addModuleButton = document.getElementById(this.settings.addModuleButtonElement);

			this.bindEvents();

			return this;
		},

		onActivation: function () {
			// Fetch public modules from API
			API.fetchPublicModules()
				.then(this.parseModuleListAddToStorage.bind(this))
				.catch( function (error) {
					console.error(error);
				});
		},

		parseModuleListAddToStorage: function (module_json_list) {
			let new_module_list = [];
			module_json_list.forEach( function(module_json) {
				new_module_list.push(Module.readSummaryFromJSON(module_json));
			}.bind(this));
			this.storage.loadArray(new_module_list);
		},

		// When Storage is edited, re-populate list of available modules
		onStorageUpdate: function () {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$moduleList.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			// Generate new li-element for each module contained in Storage. li-elements contains link that opens module in edit view.
			Array.from(this.storage.getModules()).forEach(function (module) {
				let li = this.$moduleList.getElementsByClassName('skeleton')[0].cloneNode(true);
				// Add Module information
				li.classList.remove('skeleton');
				li.getElementsByClassName('id')[0].textContent = module.id;
				//li.getElementsByTagName('a')[0].setAttribute('href', '#module');
				li.getElementsByTagName('a')[0].setAttribute('data-module-id', module.id);
				li.getElementsByTagName('a')[0].onclick = this.onModuleLinkClick.bind(this);
				this.$moduleList.appendChild(li);
			}, this);
		},

		onModuleLinkClick: function(event) {
			event.preventDefault();
			const target_module_id = event.target.getAttribute('data-module-id');
			// Activate target module
			EventHandler.emit(EventHandler.MODULE_VIEW_SET_ACTIVE_MODULE, target_module_id);
			// Route to module view
			window.location.hash = '#moduleeditor';
		},

		addModule: function() {
			// Route to new module view
			window.location = window.location.origin + window.location.pathname + "#moduleeditor-0";
		},

		// Save/update Module
		saveModule(module) {
			if (module.id > 0) {
				// If module has id, save it to Storage
			} else {
				// Get new id for module
				module.id = this.storage.getNextId();
			}
			this.storage.modules.set(module.id, module);
		},

		deleteModule: function(module_id) {
			if (this.storage.modules.has(module_id)) {
				this.storage.modules.delete(module_id);
			} else {
				EventHandler.emit(EventHandler.ERROR_MSG, 'Modules - trying to delete non-existing module #' + module_id);
			}
		}
	};
	return Modules.init();
}());