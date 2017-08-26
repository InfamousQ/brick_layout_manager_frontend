/*jshint esversion: 6 */
/*global window, App, EventHandler */
const Routing = {
	init: function () {
		window.onload = this.onLoad.bind(this);
		window.onhashchange = this.onHashChange.bind(this);
	},

	onLoad: function (e) {
		const hash_params = e.target.URL.substr(window.location.origin.length + window.location.pathname.length + 1).split('-');
		this.routeByHash(hash_params);
	},

	onHashChange: function (e) {
		const hash_params = e.newURL.substr(window.location.origin.length + window.location.pathname.length + 1).split('-');
		const routed = this.routeByHash(hash_params);

		if (routed === false) {
			// Routing does not work okey, return to old hash
			window.location = e.oldURL;
		}
	},

	routeByHash: function (hash_params) {
		const new_hash = hash_params.shift();

		// Routing initialization
		switch (new_hash) {
			case 'module':
				const new_baseplate_id = parseInt(hash_params[0], 10);
				if (App.module.allowRouting(new_baseplate_id)) {
					App.module.setBaseplate(new_baseplate_id);
				} else {
					return false;
				}
				break;
			default:
				EventHandler.emit(EventHandler.ERROR_MSG, "Unknown hash: " + new_hash);
		}
	}
};
Routing.init();