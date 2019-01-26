/*jshint esversion: 6 */
/*global App, EventHandler, document */
App.login = (function () {
	"use strict";
	const Login = {
		settings: {
			mainDiv: 'login',
			providerListElement: 'list-providers',

		},

		$providerlist: null,
		$authWindow: null,

		isAuthWindowInOurDomain: true,
		authWindowPollInterval: null,

		init: function() {
			this.$providerlist = document.getElementById(this.settings.providerListElement);

			this.bindEvents();

			return this;
		},

		bindEvents: function() {
			this.$providerlist.onclick = this.onAuthLinkClick.bind(this);
			window.onmessage = this.onAuthWindowResponse.bind(this);

			EventHandler.listen(EventHandler.USER_RENDER_PROVIDERS, this.renderProviders.bind(this));
			EventHandler.listen(EventHandler.USER_INIT, this.onActivation.bind(this));
		},

		renderProviders: function (event_data) {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$providerlist.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			// Generate new li-element for each baseplate in this.baseplates. li-elements contains link that opens baseplate in edit view.
			Array.from(event_data).forEach(function (provider) {
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

		onActivation: function (event) {
			EventHandler.emit(EventHandler.API_GET_PROVIDERS, []);
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
			if (event.origin === 'https://api.lmanager.test' && 'token' in event.data) {
				let api_token = event.data.token;
				console.log('Api token fetched: ' + api_token);
				this.resetPoll();
			}
		}
	};
	return Login.init();
}());

/**

 function Go() {
    var child = window.open("child.html", "_blank", "height=200,width=200");

    var leftDomain = false;
    var interval = setInterval(function() {
        try {
            if (child.document.domain === document.domain)
            {
                if (leftDomain && child.document.readyState === "complete")
                {
                    // we're here when the child window returned to our domain
                    clearInterval(interval);
                    alert("returned: " + child.document.URL);
                    child.postMessage({ message: "requestResult" }, "*");
                }
            }
            else {
                // this code should never be reached,
                // as the x-site security check throws
                // but just in case
                leftDomain = true;
            }
        }
        catch(e) {
            // we're here when the child window has been navigated away or closed
            if (child.closed) {
                clearInterval(interval);
                alert("closed");
                return;
            }
            // navigated to another domain
            leftDomain = true;
        }
    }, 500);
}
 **/