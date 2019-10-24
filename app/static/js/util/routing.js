/*jshint esversion: 6 */
/*global window, document, App, EventHandler */
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
			case 'layouteditor':
				this.setAsMainDiv(App.layout_editor);
				break;
			case 'layouts':
				this.setAsMainDiv(App.layouts);
				break;
			case 'baseplate':
				const new_baseplate_id = parseInt(hash_params[0], 10);
				if (App.baseplate_view.allowRouting(new_baseplate_id)) {
					this.setAsMainDiv(App.baseplate_view);
					App.baseplate_view.setBaseplate(new_baseplate_id);
				} else {
					return false;
				}
				break;
			case 'list':
				this.setAsMainDiv(App.baseplate_list);
				break;
			case 'login':
				this.setAsMainDiv(App.login);
				break;
			case 'user':
				this.setAsMainDiv(App.user);
				break;
			default:
				EventHandler.emit(EventHandler.ERROR_MSG, "Unknown hash: " + new_hash);
		}
	},

	setAsMainDiv: function (target_module) {
		for (let module of Object.values(App)) {
			if (module.settings === undefined || module.settings.mainDiv === undefined) {
				continue;
			}
			if (module === target_module) {
				document.getElementById(module.settings.mainDiv).classList.add('element-active');
				target_module.onActivation();
			} else {
				document.getElementById(module.settings.mainDiv).classList.remove('element-active');
			}
		}
	}
};
Routing.init();