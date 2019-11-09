/*jshint esversion: 6 */
/*global App, EventHandler, document, CallbackMap, Module, Plate, Rect, window */
App.modules = (function () {
	"use strict";
	const Modules = {
		settings: {
			mainDiv: 'module-list',

			publicModulesListElement: 'list-modules',
			ownModulesListElement: 'list-own-modules',
			addModuleButtonElement: 'add-module',
		},

		$publicModuleList: null,
		$ownModuleList: null,
		$addModuleButton: null,

		bindEvents: function() {
			this.$addModuleButton.onclick = this.addModule.bind(this);

			// TODO: Refactor and rethink how to set up new module. Display module info first and then allow editing it?
		},

		init: function () {
			this.$publicModuleList = document.getElementById(this.settings.publicModulesListElement);
			this.$ownModuleList = document.getElementById(this.settings.ownModulesListElement);
			this.$addModuleButton = document.getElementById(this.settings.addModuleButtonElement);

			this.bindEvents();

			return this;
		},

		onActivation: function () {
			// Fetch public modules from API
			API.fetchPublicModules()
				.then(this.renderPublicModules.bind(this))
				.catch( function (error) {
					console.error(error);
				});

			// Fetch public modules from API
			API.fetchOwnModules()
				.then(this.renderOwnModules.bind(this))
				.catch( function (error) {
					console.error(error);
				});
		},

		renderPublicModules: function (module_array) {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$publicModuleList.querySelectorAll("div:not(.skeleton)")).forEach(function (div) {
				div.remove();
			});

			// Generate new li-element for each module contained in Storage. li-elements contains link that opens module in edit view.
			Array.from(module_array).forEach(function (module) {
				let module_item = this.$publicModuleList.getElementsByClassName('skeleton')[0].cloneNode(true);
				module_item.classList.remove('skeleton');
				// Add module data
				let module_icon = module_item.getElementsByClassName('module-img')[0];
				module_icon.src = API.API_URL + module.image_href;
				let module_name = module_item.getElementsByClassName('module-name')[0];
				module_name.innerHTML = module.name;
				let module_owner_name = module_item.getElementsByClassName('module-owner-name')[0];
				module_owner_name.innerHTML = module.author.name;
				let module_activate_button = module_item.getElementsByClassName('module-activate')[0];
				module_activate_button.setAttribute('data-module-id', module.id);
				module_activate_button.onclick = this.onActivateModule;
				this.$publicModuleList.appendChild(module_item);
			}, this);
		},

		renderOwnModules: function (module_array) {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$ownModuleList.querySelectorAll("div:not(.skeleton)")).forEach(function (div) {
				div.remove();
			});

			// Generate new li-element for each module contained in Storage. li-elements contains link that opens module in edit view.
			Array.from(module_array).forEach(function (module) {
				let module_item = this.$ownModuleList.getElementsByClassName('skeleton')[0].cloneNode(true);
				module_item.classList.remove('skeleton');
				// Add module data
				let module_icon = module_item.getElementsByClassName('module-img')[0];
				module_icon.src = API.API_URL + module.image_href;
				let module_name = module_item.getElementsByClassName('module-name')[0];
				module_name.innerHTML = module.name;
				let module_owner_name = module_item.getElementsByClassName('module-owner-name')[0];
				module_owner_name.innerHTML = module.author.name;
				let module_activate_button = module_item.getElementsByClassName('module-activate')[0];
				module_activate_button.setAttribute('data-module-id', module.id);
				module_activate_button.onclick = this.onActivateModule;
				this.$ownModuleList.appendChild(module_item);
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