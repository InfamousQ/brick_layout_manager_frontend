/*global EventHandler */
(function () {
	"use strict";
	var Editor = {
		activeRectId: 'active',
		startPoint: null,
		endPoint: null,

		init: function () {
			Editor.bindEvents();
		},

		bindEvents: function () {
			EventHandler.listen(EventHandler.VIEW_GRID_CLICK, Editor.onClick.bind(this));
		},

		onClick: function (e) {
			// Round x and y to the closest grid panel (closest 20)
			e.x = Math.round(e.x / 20) * 20;
			e.y = Math.round(e.y / 20) * 20;

			if (null === this.startPoint) {
				// Set start point
				this.startPoint = e;
				EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_POINT, this.startPoint);
				return;
			}

			// Set end point if it is valid (x and y larger than startPoint's)
			if (e.x <= this.startPoint.x || e.y <= this.startPoint.y) {
				return;
			}

			this.endPoint = e;
			EventHandler.emit(EventHandler.MODULE_VIEW_GENERATE_RECT, {
				start: this.startPoint,
				end: this.endPoint
			});

			this.startPoint = null;
			this.endPoint = null;
		}
	};

	Editor.init();
}());