
/*global App, Log, EventHandler, document */
const API = {

	API_URL: 'https://api.lmanager.test',

	fetchProviders: function() {
		return fetch(this.API_URL + '/api/v1/user/providers')
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	setJWTToken: function(jwt_token) {
		// jwt_token should be valid JWT
		// TODO: add JWT check

		// Try to fetch user data from API
		let user_api_request = new Request(this.API_URL + '/api/v1/user/', {
			headers: new Headers({
				Authorization: 'Bearer ' + jwt_token
			})
		});

		return fetch(user_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.then(function(user_data_obj) {
				// User data is okey, save JWT for later use
				localStorage.setItem('user.token', jwt_token);
				return true;
			})
			.catch( function(response) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'Could not connect to API endpoint "' + this.API_URL + '/api/v1/user"');
				return false;
			}.bind(this));
	},

	unsetJWTToken: function() {
		localStorage.removeItem('user.token');
		return true;
	},

	hasJWTToken: function() {
		return (localStorage.getItem('user.token')  != null);
	},

	getUserFetch: function() {
		// Try to fetch user data from API
		let user_api_request = new Request(this.API_URL + '/api/v1/user/', {
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token')
			})
		});

		return fetch(user_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	saveUserDataFetch: function(user_data) {
		// Try to fetch user data from API
		let user_api_request = new Request(this.API_URL + '/api/v1/user/' + user_data.id, {
			method: 'POST',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify(user_data),
		});

		return fetch(user_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchPublicLayouts: function() {
		let public_laoyut_list_api_request = new Request(this.API_URL + '/api/v1/layouts/', {
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(public_laoyut_list_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchOwnLayouts: function() {
		let own_laoyut_list_api_request = new Request(this.API_URL + '/api/v1/user/layouts', {
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(own_laoyut_list_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchLayout: function(target_layout_id) {
		let layout_api_request = new Request(this.API_URL + '/api/v1/layouts/' + target_layout_id, {
			method: 'GET',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(layout_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchPublicModules: function () {
		let modulelist_api_request = new Request(this.API_URL + '/api/v1/modules/', {
			method: 'GET',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(modulelist_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchOwnModules: function () {
		let modulelist_api_request = new Request(this.API_URL + '/api/v1/user/modules', {
			method: 'GET',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(modulelist_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchModule: function(target_module_id) {
		let module_api_request = new Request(this.API_URL + '/api/v1/modules/' + target_module_id, {
			method: 'GET',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(module_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
		// Note; Check module data validity elsewhere!
	},

	/**
	 * @param {Module} target_module_data - Module data
	 * @throws JWTTokenValidationError
	 * @throws UnauthorizedError
	 */
	saveModuleFetch: function(target_module_data) {
		let db_module = {};
		db_module.name = target_module_data.name;
		db_module.public = target_module_data.is_public;
		let module_save_api_request = new Request(this.API_URL + '/api/v1/modules/' + target_module_data.id, {
			method: 'PUT',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify(db_module),
		});

		return fetch(module_save_api_request)
			.then(this.handleUnauthorizedModuleSave)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	/**
	 *
	 * @param {int} target_module_id
	 * @param {Plate} target_plate
	 * @returns {Promise<Response>}
	 */
	savePlateFetch: function(target_module_id, target_plate) {
		const db_plate = {
			x: target_plate.x,
			y: target_plate.y,
			z: target_plate.z,
			h: target_plate.height,
			w: target_plate.width,
			color_id: target_plate.color_id,
		};

		// Old plate, use PUT
		let target_url = this.API_URL + '/api/v1/modules/' + target_module_id + '/plates/' + target_plate.id;
		let target_method = 'PUT';
		if (target_plate.is_new) {
			// New plate, use POST
			target_url = this.API_URL + '/api/v1/modules/' + target_module_id + '/plates';
			target_method = 'POST';
		}

		let plate_save_api_request = new Request(target_url,{
			method: target_method,
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify(db_plate),
		});

		return fetch(plate_save_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	fetchColors: function () {
		let color_api_request = new Request(this.API_URL + '/api/v1/colors', {
			method: 'GET',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
			})
		});

		return fetch(color_api_request)
			.then(this.checkJWTTokenValidity)
			.then(this.parseResponseJSON)
			.catch(this.handleJWTTokenValidationError);
	},

	/** Promise handling functions */

	parseResponseJSON: function (response) {
		return response.json();
	},

	checkJWTTokenValidity: function (response) {
		if (!response.ok) {
			throw new JWTTokenValidationError('Could not authorize with token: ' + response.message);
		}
		if (response.error) {
			throw new JWTTokenValidationError('Authorization problem: ' + response.error.message);
		}
		return response;
	},

	handleJWTTokenValidationError: function (error) {
		if (error instanceof JWTTokenValidationError) {
			EventHandler.emit(EventHandler.ERROR_MSG, error.message);
			localStorage.removeItem('user.token');
			// Move user to login window
			window.location.hash = 'login';
			return [];
		} else {
			throw error;
		}
	},

	handleUnauthorizedModuleSave: function (response) {
		if (401 === response.status) {
			// Active user is not the author for this module, throw UnauthorizedError
			throw new UnauthorizedError('Active user is not author of target module');
		}
		return response;
	}
};