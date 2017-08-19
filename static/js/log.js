/*global EventHandler, console*/
(function () {
	"use strict";
	var Log = {
		init: function () {
			Log.bindEvents();
		},

		bindEvents: function () {
			EventHandler.listen(EventHandler.ERROR_MSG, Log.onErrorMsg);
		},

		onErrorMsg: function (e) {
		console.log(e);
	}
};
 Log.init();
}());