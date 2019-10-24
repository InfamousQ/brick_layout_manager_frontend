/*jshint esversion: 6 */
/* global App, EventHandler, document */
App.layout_editor = (function() {
	const LayoutEditor = {
		settings: {
			mainDiv: 'layout-editor',

			navbarActiveLayoutIdSpan: 'layout-editor-active-layout-id',
		},

		$mainDiv: null,
		$navbarActiveLayoutIdSpan: null,

		init: function () {
			this.$mainDiv = document.getElementById(this.settings.mainDiv);
			this.$navbarActiveLayoutIdSpan = document.getElementById(this.settings.navbarActiveLayoutIdSpan);

			this.bindEvents();

			return this;
		},

		bindEvents: function () {
			EventHandler.listen(EventHandler.LAYOUT_EDITOR_SET_LAYOUT, this.onLayoutSet.bind(this));
		},

		onActivation: function () {
			console.log('activate layout editor for layout ' + localStorage.getItem('layouteditor.active_layout_id'));
		},

		onLayoutSet: function(active_layout_id) {
			console.log('LayoutEditor - activate layout #' + active_layout_id);
			this.$navbarActiveLayoutIdSpan.innerText = '#' + active_layout_id;
			localStorage.setItem('layouteditor.active_layout_id', active_layout_id);
		}
	};
	return LayoutEditor.init();
}());