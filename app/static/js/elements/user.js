/*jshint esversion: 6 */
/* global App, EventHandler, document */
App.user = (function() {
	"use strict";
	const User = {
		settings: {
			mainDiv: 'user',

			formFieldUserIdElement: 'user-id',
			formFieldUserNameElement: 'user-name',
			formFieldUserSaveButtonElement: 'user-save',
			formFieldUserLogoutButtonElement: 'user-logout',

			userLayoutsDiv: 'user-view-layouts',
			userModulesDiv: 'user-view-modules',

			class_on_user_active: 'on-user-active',
			class_on_user_deactive: 'on-user-deactive',
		},

		user_data: null,

		$mainDiv: null,
		$formFieldUserId: null,
		$formFieldUserName: null,
		$formFieldUserSaveButton: null,
		$formFieldUserLogoutButton: null,
		$userLayoutsDiv: null,
		$userModulesDiv: null,

		init: function () {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$formFieldUserId = document.getElementById(this.settings.formFieldUserIdElement);
			this.$formFieldUserName = document.getElementById(this.settings.formFieldUserNameElement);
			this.$formFieldUserSaveButton = document.getElementById(this.settings.formFieldUserSaveButtonElement);
			this.$formFieldUserLogoutButton = document.getElementById(this.settings.formFieldUserLogoutButtonElement);
			this.$userLayoutsDiv = document.getElementById(this.settings.userLayoutsDiv);
			this.$userModulesDiv = document.getElementById(this.settings.userModulesDiv);

			this.bindEvents();

			return this;
		},

		bindEvents: function () {
			this.$formFieldUserSaveButton.onclick = this.saveUserData.bind(this);
			this.$formFieldUserLogoutButton.onclick = this.logoutUser.bind(this);

			EventHandler.listen(EventHandler.LOGIN_INIT, this.onActivation.bind(this));
		},

		onActivation: function (event_data) {
			// First, let's check if API even has token. If not, return to #login
			if (!API.hasJWTToken()) {
				window.location.hash = 'login';
			}

			// Try to fetch active user data from API. If this does not work, return to #login
			API.getUserFetch()
				.then(function (user_data) {
					if (user_data == null) {
						window.location.hash = 'login';
						return;
					}

					this.user_data = user_data;
					this.toggleUI();
					this.renderUserView();
				}.bind(this));
		},

		toggleUI: function () {
			const on_user_activate_elements = document.getElementsByClassName(this.settings.class_on_user_active);
			const on_user_deactive_elements = document.getElementsByClassName(this.settings.class_on_user_deactive);

			if (this.user_data) {
				for (let element of on_user_activate_elements) {
					element.classList.remove('hidden');
				}
				for (let element of on_user_deactive_elements) {
					element.classList.add('hidden');
				}
			} else {
				for (let element of on_user_activate_elements) {
					element.classList.add('hidden');
				}
				for (let element of on_user_deactive_elements) {
					element.classList.remove('hidden');
				}
			}
		},

		renderUserView: function () {
			this.$formFieldUserId.value = this.user_data.id;
			this.$formFieldUserName.value = this.user_data.name;

			// Remove existing div-elements excluding the skeleton
			Array.from(this.$userLayoutsDiv.querySelectorAll('div:not(.skeleton)')).forEach(function (div) {
				div.remove();
			});
			Array.from(this.$userModulesDiv.querySelectorAll('div:not(.skeleton)')).forEach(function (div) {
				div.remove();
			});

			// Populate user's layouts
			this.user_data.layouts.forEach(function (layout) {
				let layout_item = this.$userLayoutsDiv.getElementsByClassName('skeleton')[0].cloneNode(true);
				layout_item.classList.remove('skeleton');
				// Add layout data
				let layout_icon = layout_item.getElementsByClassName('layout-img')[0];
				layout_icon.src = layout.img;
				layout.alt = layout.name;
				let layout_name = layout_item.getElementsByClassName('layout-name')[0];
				layout_name.innerHTML = layout.name;
				let layout_activate_button = layout_item.getElementsByClassName('layout-activate')[0];
				layout_activate_button.setAttribute('data-layout-id', layout.id);
				layout_activate_button.onclick = this.onActivateLayout;
				this.$userLayoutsDiv.appendChild(layout_item);
			}.bind(this));

			// Populate user's modules
			this.user_data.modules.forEach(function (module) {
				let module_item = this.$userModulesDiv.getElementsByClassName('skeleton')[0].cloneNode(true);
				module_item.classList.remove('skeleton');
				// Add module data
				// TODO: Module img
				let module_name = module_item.getElementsByClassName('module-name')[0];
				module_name.innerHTML = module.name;
				let module_activate_button = module_item.getElementsByClassName('module-activate')[0];
				module_activate_button.setAttribute('data-module-id', module.id);
				module_activate_button.onclick = this.onActivateModule;
				this.$userModulesDiv.appendChild(module_item);
			}.bind(this));
		},

		saveUserData: function (onclick_event) {
			onclick_event.preventDefault();
			this.user_data.name = this.$formFieldUserName.value;

			API.saveUserDataFetch(this.user_data)
				.then( function(response) {
					// Reload user data by forcing re-init of #user
					window.location.hash = 'user';
				})
		},

		logoutUser: function (onclick_event) {
			onclick_event.preventDefault();
			API.unsetJWTToken();
			let logout_url = 'https://api.lmanager.test/user/logout';
			fetch(logout_url)
				.then( function(response) {
					if (!response.ok) {
						throw Error('Logout GET was not successful');
					}
					if (!response.redirected) {
						throw Error('Logout did not resolve to redirect, something wrong');
					}
					return response;
				}).catch( function(error) {
					EventHandler.emit(EventHandler.ERROR_MSG, 'Error occured while logout:' + error);
				}).finally( function (response) {
				// Finally, move user to #login in any case
				document.location.hash = 'login';
			});
		},

		onActivateLayout: function (event) {
			event.preventDefault();
			let target_layout_id = event.target.getAttribute('data-layout-id');
			EventHandler.emit(EventHandler.LAYOUT_EDITOR_SET_LAYOUT, target_layout_id);
			window.location.hash = 'layouteditor';
		},

		onActivateModule: function (event) {
			event.preventDefault();
			let target_module_id = event.target.getAttribute('data-module-id');
			EventHandler.emit(EventHandler.MODULE_VIEW_SET_ACTIVE_MODULE, target_module_id);
			window.location.hash = 'moduleeditor'
		}
	};
	return User.init();
}());