/*jshint browser: true*/
/*global App, EventHandler, Globals */
App.module_editor = (function () {
	"use strict";
	const ModuleEditor = {
		activeRectId: 'active',
		hoverRectId: 'hover-rect',
		startPoint: null,
		endPoint: null,

		$hoverrect: null,
	// TODO: Move active module data to this object
		init: function () {
			this.$hoverrect = document.getElementById(this.hoverRectId);
			this.bindEvents();

			return this;
		},

		bindEvents: function () {
			EventHandler.listen(EventHandler.VIEW_GRID_CLICK, this.onClick.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_MOUSE_IN, this.onMouseIn.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_MOUSE_MOVE, this.onMouseMove.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_MOUSE_OUT, this.onMouseOut.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_RESET, this.reset.bind(this));
		},

		onClick: function (e) {
			// Round x and y to the closest grid panel
			e.x = this.inBricks(e.x);
			e.y = this.inBricks(e.y);

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
			EventHandler.emit(EventHandler.MODULE_VIEW_GENERATE_PLATE, {
				start: this.startPoint,
				end: this.endPoint
			});

			this.startPoint = null;
			this.endPoint = null;
		},
	
		onMouseIn: function (e) {
			this.$hoverrect.style.display = 'block';
		},

		onMouseMove: function (e) {
			// Round x and y to the closest grid panel
			// If startPoint has not been set (initial state), rect should be on the bottom right grid point from mouse. If startPoint is set, rect should be on top left grid point from mouse
			if (null !== this.startPoint) {
				e.x = this.inBricks(e.x) - Globals.BRICKSIZE;
				e.y = this.inBricks(e.y) - Globals.BRICKSIZE;
			} else {
				e.x = this.inBricks(e.x);
				e.y = this.inBricks(e.y);
			}
			this.$hoverrect.setAttribute('x', e.x);
			this.$hoverrect.setAttribute('y', e.y);
		},

		onMouseOut: function (e) {
			this.$hoverrect.style.display = 'none';
		},

		reset: function (e) {
			this.startPoint = null;
			this.endPoint = null;
		},

		inBricks: function (pixel_value) {
			return (Math.floor(pixel_value / Globals.BRICKSIZE) * Globals.BRICKSIZE);
		}
	};

	return ModuleEditor.init();
}());