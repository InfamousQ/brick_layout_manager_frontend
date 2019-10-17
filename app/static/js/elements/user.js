/*jshint esversion: 6 */
/* global App, EventHandler, document */
App.user = (function() {
	const User = {
		settings: {
			mainDiv: 'user',

			formFieldUserIdElement: 'user-id',
			formFieldUserNameElement: 'user-name',
			formFieldUserSaveButtonElement: 'user-save',
			formFieldUserLogoutButtonElement: 'user-logout',

			userLayoutsDiv: 'user-view-layouts',

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

		init: function () {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$formFieldUserId = document.getElementById(this.settings.formFieldUserIdElement);
			this.$formFieldUserName = document.getElementById(this.settings.formFieldUserNameElement);
			this.$formFieldUserSaveButton = document.getElementById(this.settings.formFieldUserSaveButtonElement);
			this.$formFieldUserLogoutButton = document.getElementById(this.settings.formFieldUserLogoutButtonElement);
			this.$userLayoutsDiv = document.getElementById(this.settings.userLayoutsDiv);

			this.bindEvents();

			this.toggleUI();
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

					User.user_data = user_data;
					User.renderUserView();
			});
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
				layout_activate_button.onclick = this.onActivateLayout;
				this.$userLayoutsDiv.appendChild(layout_item);
			});
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
			console.log('going to activate layout');
		},
	};
	return User.init();
}());