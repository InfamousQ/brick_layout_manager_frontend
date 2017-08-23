/*jshint browser: true*/
/*global App, EventHandler */
App.project = (function () {
	"use strict";
	var Project = {
		settings: {
			inputHeightInBricksID: 'project-settings-height',
			inputWidthInBricksID: 'project-settings-width',
			heightInBricks: 32, // Initial value, updated when project settings are updated
			widthInBricks: 32 // Initial value, updated when project settings are updated
		},

		$inputHeightInBricks: null,
		$inputWidthInBricks: null,

		bindEvents: function () {
			this.$inputHeightInBricks.onchange = this.sendSettings.bind(this);
			this.$inputWidthInBricks.onchange = this.sendSettings.bind(this);

			EventHandler.listen(EventHandler.PROJECT_CHANGE_SETTINGS, Project.changeSettings.bind(this));
		},

		sendSettings: function (event) {
			// Read all projects settings to and event data and then emit them
			var settings = {
				heightInBricks: this.$inputHeightInBricks.value,
				widthInBricks: this.$inputWidthInBricks.value
			};

			EventHandler.emit(EventHandler.PROJECT_CHANGE_SETTINGS, settings);
		},

		changeSettings: function (event) {
			// Read settings that come from sendSettings and change the internal values
			this.settings.heightInBricks = event.heightInBricks;
			this.settings.widthInBricks = event.widthInBricks;
		},

		init: function () {
			this.$inputHeightInBricks = document.getElementById(this.settings.inputHeightInBricksID);
			this.$inputWidthInBricks = document.getElementById(this.settings.inputWidthInBricksID);
			this.bindEvents();

			// Emit initial settings!
			this.sendSettings();

			return this;
		}
	};
	return Project.init();
}());