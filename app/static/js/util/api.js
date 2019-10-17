
/*global App, Log, EventHandler, document */
const API = {

	API_URL: 'https://api.lmanager.test/',

	fetchProviders: function() {
		return fetch(this.API_URL + 'api/v1/user/providers')
			.then(function (response) {
				return response.json();
			})
			.catch( function (response) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'Could not connect to API endpoint "' + this.API_URL + 'api/v1/user/providers"');
		});
	},

	setJWTToken: function(jwt_token) {
		// jwt_token should be valid JWT
		// TODO: add JWT check

		// Try to fetch user data from API
		let user_api_request = new Request(this.API_URL + 'api/v1/user/', {
			headers: new Headers({
				Authorization: 'Bearer ' + jwt_token
			})
		});

		return fetch(user_api_request)
			.then(this.checkResponseValidity)
			.then(function (response) {
				return response.json();
			}).then(this.checkJWTTokenValidity)
			.then(function(user_data_obj) {
				// User data is okey, save JWT for later use
				localStorage.setItem('user.token', jwt_token);
				return true;
			})
			.catch( function(response) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'Could not connect to API endpoint "' + this.API_URL + 'api/v1/user"');
				return false;
			});
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
		let user_api_request = new Request(this.API_URL + 'api/v1/user/', {
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token')
			})
		});

		return fetch(user_api_request)
			.then(this.checkResponseValidity)
			.then(function (response) {
				return response.json();
			}).then(this.checkJWTTokenValidity)
			.catch( function(response) {
			EventHandler.emit(EventHandler.ERROR_MSG, 'Could not connect to API endpoint "' + user_api_request.url);
			return null;
		});
	},

	saveUserDataFetch: function(user_data) {
		// Try to fetch user data from API
		let user_api_request = new Request(this.API_URL + 'api/v1/user/' + user_data.id, {
			method: 'POST',
			headers: new Headers({
				'Authorization': 'Bearer ' + localStorage.getItem('user.token'),
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify(user_data),
		});

		return fetch(user_api_request)
			.then(this.checkResponseValidity)
			.then( function(response) {
				return response.json;
			}).then(this.checkJWTTokenValidity)
			.catch( function(response) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'Could not connect to API endpoint "' + user_api_request.url);
			})
	},

	fetchPublicLayouts: function() {
		return Promise.resolve([
			{
				id: 1,
				name: 'sample 1',
				img: 'test.test.test/sample1',
				href: 'test.test.test/api/v1/layout/1',
			},
			{
				id: 2,
				name: 'sample 2',
				img: 'test.test.test/sample2',
				href: 'test.test.test/api/v1/layout/2',
			},
			{
				id: 3,
				name: 'sample 3',
				img: 'test.test.test/sample2',
				href: 'test.test.test/api/v1/layout/3',
			},
		]);
	},

	checkResponseValidity: function (response) {
		if (!response.ok) {
			throw Error(response.statusText);
		}
		return response;
	},

	checkJWTTokenValidity: function (response_json) {
		if (response_json.status === 'error') {
			EventHandler.emit(EventHandler.ERROR_MSG, 'Could not authorize with token: ' + response_json.message );
			localStorage.removeItem('user.token');
			return null;
		}
		if (response_json.error) {
			EventHandler.emit(EventHandler.ERROR_MSG, 'Authorization problem: ' + response_json.error.message)
			localStorage.removeItem('user.token');
			return null;
		}
		return response_json;
	}
};