/*global EventHandler */
(function () {
	"use strict";
	var View = {
		settings: {
			svgElement: 'snap',
			activeRectId: 'activeRect'
		},

		rects: [],

		$svg: null,

		initSVG: function () {
			//var grid_block = this.snap.rect(0,0, 10,10).attr({fill:'none', stroke:'#ccc'}).pattern(0,0, 10,10);
			//var grid = this.snap.rect(0,0, '100%','100%').attr({fill: grid_block});
		},

		bindEvents: function () {
			this.$svg.onclick = this.clickToEditor.bind(this);

			EventHandler.listen(EventHandler.VIEW_GRID_GENERATE_BOX, View.generateBox.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_GENERATE_POINT, View.generatePoint.bind(this));
		},

		clickToEditor: function (event) {
			// Find click position in grid
			var point = {
					x: event.offsetX,
					y: event.offsetY
				};

			EventHandler.emit(EventHandler.VIEW_GRID_CLICK, point);
		},

		generatePoint: function (event) {
			// Generate single point (1px sized rectangle with class "point")
			var p = {
				x: event.x,
				y: event.y,
				width: 1,
				height: 1
			},
				point = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

			point.setAttributeNS(null, 'x', p.x);
			point.setAttributeNS(null, 'y', p.y);
			point.setAttributeNS(null, 'height', p.height);
			point.setAttributeNS(null, 'width', p.width);
			point.setAttributeNS(null, 'fill', 'purple');
			this.$svg.appendChild(point);
		},

		generateBox: function (event) {
			// Get starting and ending points (x,y)
			var r = {
				x: event.start.x,
				y: event.start.y,
				width: event.end.x - event.start.x,
				height: event.end.y - event.start.y
			};
			this.rects.push(r);

			this.redrawRects();
		},

		redrawRects: function () {
			this.rects.forEach(function (r) {
				var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				rect.setAttributeNS(null, 'x', r.x);
				rect.setAttributeNS(null, 'y', r.y);
				rect.setAttributeNS(null, 'height', r.height);
				rect.setAttributeNS(null, 'width', r.width);
				rect.setAttributeNS(null, 'fill', 'grey');
				this.$svg.appendChild(rect);
			}, this);
		},

		init: function () {
			this.$svg = document.getElementById(this.settings.svgElement);
			this.initSVG();
			this.bindEvents();
		}
	};

	View.init();
}());