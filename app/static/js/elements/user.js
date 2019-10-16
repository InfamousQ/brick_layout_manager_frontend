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

			class_on_user_active: 'on-user-active',
			class_on_user_deactive: 'on-user-deactive',
		},

		user_data: null,

		$mainDiv: null,
		$formFieldUserId: null,
		$formFieldUserName: null,
		$formFieldUserSaveButton: null,
		$formFieldUserLogoutButton: null,

		init: function () {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$formFieldUserId = document.getElementById(this.settings.formFieldUserIdElement);
			this.$formFieldUserName = document.getElementById(this.settings.formFieldUserNameElement);
			this.$formFieldUserSaveButton = document.getElementById(this.settings.formFieldUserSaveButtonElement);
			this.$formFieldUserLogoutButton = document.getElementById(this.settings.formFieldUserLogoutButtonElement);

			this.bindEvents();

			// Should hide user data
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
			console.debug('toggle user UI visible');
				for (let element of on_user_activate_elements) {
					element.classList.remove('hidden');
				}
				for (let element of on_user_deactive_elements) {
					element.classList.add('hidden');
				}
			} else {
			console.debug('toggle user UI hidden');
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
			console.debug('rendered user: ', this.user_data);
		},

		saveUserData: function (onclick_event) {
			onclick_event.preventDefault();
			this.user_data.name = this.$formFieldUserName.value;
			console.debug('New user values:', this.user_data);
		},

		logoutUser: function (onclick_event) {
			onclick_event.preventDefault();
			API.unsetJWTToken();
			console.log('user logged out, redirect to #login');
			document.location.hash = 'login';
		}
	};
	return User.init();
}());