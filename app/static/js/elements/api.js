/*jshint esversion: 6 */
/*global App, Log, EventHandler, document */
App.API = (function () {
	"use strict";

	const API_URL = 'https://api.lmanager.test/';

	const API = {

		init: function() {
			this.bindEvents();

			return this;
		},

		bindEvents: function() {
			EventHandler.listen(EventHandler.API_GET_PROVIDERS, this.fetchProviders.bind(this));
		},

		fetchProviders: function() {
			var providers = fetch(API_URL + 'api/v1/user/providers')
				.then(function (response) {
					return response.json();
				})
				.then( function (providers) {
					EventHandler.emit(EventHandler.USER_RENDER_PROVIDERS, providers);
				})
				.catch( function (response) {
					EventHandler.emit(EventHandler.ERROR_MSG, 'Could not connect to API endpoint "' + API_URL + 'api/v1/user/providers"');
			});
		}
	};
	return API.init();
}());