/*jshint esversion: 6 */
/*global App, EventHandler */
App.layouts = (function () {
	"use strict";
	const Layouts = {
		settings: {
			mainDiv: 'layouts',
			layoutListElement: 'list-layouts',
			ownLayoutListElement: 'list-own-layouts'
		},

		$mainDiv: null,
		$layoutList: null,
		$ownLayoutList: null,

		init: function () {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$layoutList = document.getElementById(this.settings.layoutListElement);
			this.$ownLayoutList = document.getElementById(this.settings.ownLayoutListElement);

			this.bindEvents();

			return this;
		},

		bindEvents: function () {
		},

		onActivation: function (event) {
			// Load public layouts
			API.fetchPublicLayouts()
				.then(this.renderPublicLayouts.bind(this));
			// Load own layouts
			API.fetchOwnLayouts()
				.then(this.renderOwnLayouts.bind(this));
		}
		,

		renderPublicLayouts: function (layout_array) {
			// Remove existing div-elements excluding the skeleton
			Array.from(this.$layoutList.querySelectorAll('div:not(.skeleton)')).forEach(function (div) {
				div.remove();
			});

			if (!layout_array) {
				console.log('No public layouts provided');API.API_URL + layout.image_href;
				return;
			}

			// Generate new div-element for each layout in layout_array. div-element contains button that opens the layout in layout editor view.
			Array.from(layout_array).forEach(function (layout) {
				let layout_item = this.$layoutList.getElementsByClassName('skeleton')[0].cloneNode(true);
				layout_item.classList.remove('skeleton');
				// Add layout data
				let layout_icon = layout_item.getElementsByClassName('layout-img')[0];
				layout_icon.src = API.API_URL + layout.image_href;
				layout.alt = layout.name;
				let layout_name = layout_item.getElementsByClassName('layout-name')[0];
				layout_name.innerHTML = layout.name;
				let layout_activate_button = layout_item.getElementsByClassName('layout-activate')[0];
				layout_activate_button.setAttribute('data-layout-id', layout.id);
				layout_activate_button.onclick = this.onActivateLayout.bind(this);
				this.$layoutList.appendChild(layout_item);
			}, this);
		},

		renderOwnLayouts: function (layout_array) {
			// Remove existing div-elements excluding the skeleton
			Array.from(this.$ownLayoutList.querySelectorAll('div:not(.skeleton)')).forEach(function (div) {
				div.remove();
			});

			if (!layout_array) {
				console.log('No own layouts provided');
				return;
			}

			// Generate new div-element for each layout in layout_array. div-element contains button that opens the layout in layout editor view.
			Array.from(layout_array).forEach(function (layout) {
				let layout_item = this.$ownLayoutList.getElementsByClassName('skeleton')[0].cloneNode(true);
				layout_item.classList.remove('skeleton');
				// Add layout data
				let layout_icon = layout_item.getElementsByClassName('layout-img')[0];
				layout_icon.src = API.API_URL + layout.image_href;
				layout.alt = layout.name;
				let layout_name = layout_item.getElementsByClassName('layout-name')[0];
				layout_name.innerHTML = layout.name;
				let layout_activate_button = layout_item.getElementsByClassName('layout-activate')[0];
				layout_activate_button.setAttribute('data-layout-id', layout.id);
				layout_activate_button.onclick = this.onActivateLayout.bind(this);
				this.$ownLayoutList.appendChild(layout_item);
			}, this);
		},

		onActivateLayout: function (event) {
			event.preventDefault();
			let target_layout_id = event.target.getAttribute('data-layout-id');
			EventHandler.emit(EventHandler.LAYOUT_EDITOR_SET_LAYOUT, target_layout_id);
			window.location.hash = 'layouteditor';
		},
	};
	return Layouts.init();
}());