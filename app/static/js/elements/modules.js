/*jshint esversion: 6 */
/*global App, EventHandler, document, CallbackMap, Module, Plate, Rect, window */
App.modules = (function () {
	"use strict";
	const Modules = {
		settings: {
			mainDiv: 'module-list',

			moduleListElement: 'module-collection',
			addModuleButtonElement: 'add-module',
		},

		$moduleList: null,
		$addModuleButton: null,

		bindEvents: function() {
			this.$addModuleButton.onclick = this.addModule.bind(this);

			// TODO: Refactor and rethink how to set up new module. Display module info first and then allow editing it?
		},

		init: function () {
			this.$moduleList = document.getElementById(this.settings.moduleListElement);
			this.$addModuleButton = document.getElementById(this.settings.addModuleButtonElement);

			this.bindEvents();

			return this;
		},

		onActivation: function () {
			// Fetch public modules from API
			API.fetchPublicModules()
				.then(this.renderModules.bind(this))
				.catch( function (error) {
					console.error(error);
				});
		},

		renderModules: function (module_array) {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$moduleList.querySelectorAll("div:not(.skeleton)")).forEach(function (div) {
				div.remove();
			});

			// Generate new li-element for each module contained in Storage. li-elements contains link that opens module in edit view.
			Array.from(module_array).forEach(function (module) {
				let module_item = this.$moduleList.getElementsByClassName('skeleton')[0].cloneNode(true);
				module_item.classList.remove('skeleton');
				// Add module data
				// TODO: Module img
				let module_name = module_item.getElementsByClassName('module-name')[0];
				module_name.innerHTML = module.name;
				let module_owner_name = module_item.getElementsByClassName('module-owner-name')[0];
				module_owner_name.innerHTML = module.author.name;
				let module_activate_button = module_item.getElementsByClassName('module-activate')[0];
				module_activate_button.setAttribute('data-module-id', module.id);
				module_activate_button.onclick = this.onActivateModule;
				this.$moduleList.appendChild(module_item);
			}, this);
		},

		onActivateModule: function (event) {
			event.preventDefault();
			let target_module_id = event.target.getAttribute('data-module-id');
			EventHandler.emit(EventHandler.MODULE_VIEW_SET_ACTIVE_MODULE, target_module_id);
			window.location.hash = 'moduleeditor'
		},

		addModule: function() {
			// Route to new module view
			window.location = window.location.origin + window.location.pathname + "#moduleeditor-0";
		},
	};
	return Modules.init();
}());