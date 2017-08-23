/*global App, EventHandler, console*/
App.log = (function () {
	"use strict";
	var Log = {
		init: function () {
			this.bindEvents();

			return this;
		},

		bindEvents: function () {
			EventHandler.listen(EventHandler.ERROR_MSG, Log.onErrorMsg);
		},

		onErrorMsg: function (e) {
			console.log(e);
		}
	};
	return Log.init();
}());