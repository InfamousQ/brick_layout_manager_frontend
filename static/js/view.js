/*global EventHandler */
(function () {
	"use strict";
	var View = {
		settings: {
			svgElement: 'snap',
			activeRectId: 'activeRect',
            bgRectId: 'background-rect'
		},

		$svg: null,
        $bgrect: null,

		initSVG: function () {
			//var grid_block = this.snap.rect(0,0, 10,10).attr({fill:'none', stroke:'#ccc'}).pattern(0,0, 10,10);
			//var grid = this.snap.rect(0,0, '100%','100%').attr({fill: grid_block});
		},

		bindEvents: function() {
			this.$svg.onclick = this.clickToEditor.bind(this);

			EventHandler.listen(EventHandler.VIEW_GRID_GENERATE_BOX, View.generateBox.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_GENERATE_POINT, View.generatePoint.bind(this));
		},

		clickToEditor: function (event) {
			// First, Find the ancestor "background-rect" element
            var r = this.$bgrect.getBoundingClientRect(),
                point = {
					x: event.clientX - r.left,
					y: event.clientY - r.top
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
			point.classList.add('tmp-point');
			point.setAttributeNS(null, 'x', p.x);
			point.setAttributeNS(null, 'y', p.y);
			point.setAttributeNS(null, 'height', p.height);
			point.setAttributeNS(null, 'width', p.width);
			point.setAttributeNS(null, 'fill', 'purple');
			this.$svg.appendChild(point);
			// TODO Remove tmp-points
		},

		generateBox: function (r) {
			// TODO: Check validity of event
			var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.id = r.id;
			rect.setAttributeNS(null, 'x', r.x);
			rect.setAttributeNS(null, 'y', r.y);
			rect.setAttributeNS(null, 'height', r.height);
			rect.setAttributeNS(null, 'width', r.width);
			rect.setAttributeNS(null, 'fill', 'grey');
			this.$svg.appendChild(rect);
		},

		init: function () {
			this.$svg = document.getElementById(this.settings.svgElement);
            this.$bgrect = document.getElementById(this.settings.bgRectId);
			this.initSVG();
			this.bindEvents();
		}
	};

	View.init();
}());