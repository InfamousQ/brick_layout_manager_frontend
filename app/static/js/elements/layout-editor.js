/*jshint esversion: 6 */
/* global App, EventHandler, document, window */
App.layout_editor = (function() {
	const LayoutEditor = {
		settings: {
			mainDiv: 'layout-editor',

			navbarActiveLayoutIdSpan: 'layout-editor-active-layout-id',
			layoutNameInputElement: 'layout-name',
			layoutIsPublicInputElement: 'layout-is-public',
			layoutCreatedAtElement: 'layout-created-at',
			layoutSaveButtonElement: 'save-layout',
			layoutDeleteButtonElement: 'delete-layout',
		},

		storage_key_active_layout_id: 'active_layout_id',

		active_layout: null,

		$mainDiv: null,
		$navbarActiveLayoutIdSpan: null,
		$layoutNameInput: null,
		$layoutIsPublicInput: null,
		$layoutCreatedAtSpan: null,
		$layoutSaveButton: null,
		$layoutDeleteButton: null,

		init: function () {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$navbarActiveLayoutIdSpan = document.getElementById(this.settings.navbarActiveLayoutIdSpan);
			this.$layoutNameInput = document.getElementById(this.settings.layoutNameInputElement);
			this.$layoutIsPublicInput = document.getElementById(this.settings.layoutIsPublicInputElement);
			this.$layoutCreatedAtSpan = document.getElementById(this.settings.layoutCreatedAtElement);
			this.$layoutSaveButton = document.getElementById(this.settings.layoutSaveButtonElement);
			this.$layoutDeleteButton = document.getElementById(this.settings.layoutDeleteButtonElement);

			this.bindEvents();

			return this;
		},

		bindEvents: function () {
			this.$layoutSaveButton.onclick = this.onSaveLayout.bind(this);
			this.$layoutDeleteButton.onclick = this.onDeleteLayout.bind(this);

			EventHandler.listen(EventHandler.LAYOUT_EDITOR_SET_LAYOUT, this.onLayoutSet.bind(this));
		},

		onActivation: function () {
			// Fetch layout data and render it
			let current_active_layout_id = window.localStorage.getItem(this.storage_key_active_layout_id);
			current_active_layout_id = parseInt(current_active_layout_id);
			if (current_active_layout_id > 0) {
				// Id is valid, load data from API
				API.fetchLayout(current_active_layout_id)
					.then(this.loadActiveLayoutFromJSON.bind(this))
					.then(this.activateView.bind(this))
					.catch(function (error) {
						console.error(error);
					});
			} else {
				// New layout
				this.active_layout = null;
				this.activateView.bind(this);
			}
		},

		activateView: function () {
			// Get layout data to form
			this.$layoutNameInput.value = this.active_layout.name;
			this.$layoutIsPublicInput.checked = this.active_layout.is_public;
			this.$layoutCreatedAtSpan.innerText = this.active_layout.created;
		},

		onSaveLayout: function (event) {
			event.preventDefault();
			console.log('saving layout');
		},

		onDeleteLayout: function (event) {
			event.preventDefault();
			console.log('delete layout');
		},

		loadActiveLayoutFromJSON: function(layout_json) {
			this.active_layout = layout_json;
			window.localStorage.setItem(this.storage_key_active_layout_id, this.active_layout.id);
		},

		onLayoutSet: function(active_layout_id) {
			this.$navbarActiveLayoutIdSpan.innerText = '#' + active_layout_id;
			window.localStorage.setItem(this.storage_key_active_layout_id, active_layout_id);
		}
	};
	return LayoutEditor.init();
}());