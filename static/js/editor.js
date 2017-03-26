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
			EventHandler.emit(EventHandler.VIEW_GRID_GENERATE_BOX, {
				start: this.startPoint,
				end: this.endPoint
			});

			this.startPoint = null;
			this.endPoint = null;
		}
	};

	Editor.init();
}());