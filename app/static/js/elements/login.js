/*jshint esversion: 6 */
/*global App, EventHandler, document */
App.login = (function () {
	"use strict";
	const Login = {
		settings: {
			mainDiv: 'login',
			providerListElement: 'list-providers',
		},

		$mainDiv: null,
		$providerlist: null,
		$authWindow: null,

		isAuthWindowInOurDomain: true,
		authWindowPollInterval: null,

		init: function() {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$providerlist = document.getElementById(this.settings.providerListElement);

			this.bindEvents();

			return this;
		},

		bindEvents: function() {
			this.$providerlist.onclick = this.onAuthLinkClick.bind(this);
			window.onmessage = this.onAuthWindowResponse.bind(this);

			EventHandler.listen(EventHandler.LOGIN_INIT, this.onActivation.bind(this));
		},

		onActivation: function (event) {
			// First, check if API token is already set. If so, move to #user
			if (API.hasJWTToken()) {
				console.debug('token is valid, move to #user');
				window.location.hash = 'user';
				return;
			}

			API.fetchProviders().then(this.renderProviders.bind(this));
		},

		renderProviders: function (providers_array) {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$providerlist.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			if (!providers_array) {
				console.debug('No providers provided in event_data');
				return;
			}

			// Generate new li-element for each baseplate in this.modules. li-elements contains link that opens baseplate in edit view.
			Array.from(providers_array).forEach(function (provider) {
				let provider_item = this.$providerlist.getElementsByClassName('skeleton')[0].cloneNode(true);
				provider_item.classList.remove('skeleton');
				// Add Provider information
				let provider_link = provider_item.getElementsByClassName('provider_auth_link')[0];
				provider_link.setAttribute('data-provider-code', provider.code);
				let provider_icon = provider_link.getElementsByClassName('provider_auth_icon')[0];
				provider_icon.src = provider.icon;
				provider_icon.alt = provider.name;
				this.$providerlist.appendChild(provider_item);
			}, this);
		},

		onAuthLinkClick: function (event) {
			event.preventDefault();
			// TODO: There should be a neater way to catch the event as it bubbles to parent element.. Let's do the "magic" later on.
			let parent_link = event.target.parentElement;
			let provider_code = parent_link.getAttribute('data-provider-code');
			let authentication_link = 'https://api.lmanager.test/user/authenticate?provider=' + provider_code;

			this.authWindow = window.open(authentication_link, 'authWindow', 'width=700,height=500,scrollbars=yes');
			this.isAuthWindowInOurDomain = true;
			this.authWindowPollInterval = window.setInterval(this.pollAuthWindow.bind(this), 1000);

		},

		resetPoll: function () {
			this.authWindowPollInterval = window.clearInterval(this.authWindowPollInterval);
		},

		pollAuthWindow: function() {
				this.authWindow.postMessage('requestToken', 'https://api.lmanager.test');
		},

		onAuthWindowResponse: function (event) {
			if ('token' in event.data) {
				let api_token = event.data.token;
				this.resetPoll();

				// Check validity of token. If valid, redirect to #user
				API.setJWTToken(api_token)
					.then( function (jwt_token_is_valid) {
						if (jwt_token_is_valid) {
							window.location.hash = 'user';
						}
					});
			}
		},
	};
	return Login.init();
}());