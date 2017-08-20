/*jshint browser: true*/
/*global EventHandler, Globals, Plate */
(function () {
	"use strict";
	var View = {
		settings: {
			svgElement: 'snap',
			activeRectId: 'activeRect',
			bgRectId: 'background-rect'
		},

		$svg: null,
		$svg_rect_container: null,
		$svg_point_container: null,
		$bgrect: null,

		initSVG: function () {
			//var grid_block = this.snap.rect(0,0, 10,10).attr({fill:'none', stroke:'#ccc'}).pattern(0,0, 10,10);
			//var grid = this.snap.rect(0,0, '100%','100%').attr({fill: grid_block});
		},

		bindEvents: function () {
			this.$svg.onclick = this.clickToEditor.bind(this);
			this.$svg.onmouseover = this.mouseInEditor.bind(this);
			this.$svg.onmousemove = this.mouseMoveEditor.bind(this);
			this.$svg.onmouseout = this.mouseOutEditor.bind(this);

			EventHandler.listen(EventHandler.VIEW_GRID_GENERATE_PLATE, View.generateBox.bind(this));
			EventHandler.listen(EventHandler.VIEW_GRID_GENERATE_POINT, View.generatePoint.bind(this));
			EventHandler.listen(EventHandler.MODULE_VIEW_EDIT_PLATE, View.editPlate.bind(this));
			EventHandler.listen(EventHandler.MODULE_VIEW_DELETE_PLATE, View.deletePlate.bind(this));
			EventHandler.listen(EventHandler.PROJECT_CHANGE_SETTINGS, View.readSettings.bind(this));
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
			// Generate single point ("brick" sized rectangle with class "point")
			var p = {
				x: event.x,
				y: event.y,
				width: Globals.BRICKSIZE,
				height: Globals.BRICKSIZE
			},
				point = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			point.classList.add('tmp-point');
			point.setAttributeNS(null, 'x', p.x);
			point.setAttributeNS(null, 'y', p.y);
			point.setAttributeNS(null, 'height', p.height);
			point.setAttributeNS(null, 'width', p.width);
			point.setAttributeNS(null, 'fill', 'purple');
			point.setAttributeNS(null, 'fill-opacity', '0.5');
			// Note: points are drawn to point container
			this.$svg_point_container.appendChild(point);
		},

		generateBox: function (plate) {
			if (! (plate instanceof Plate)) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'View - trying to edit plate with faulty parameter:\n' + JSON.stringify(plate));
				return false;
			}

			var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
					tmp_points = document.getElementsByClassName('tmp-point'),
					r = plate.toRect();
			rect.id = r.id;
			rect.setAttributeNS(null, 'x', r.x);
			rect.setAttributeNS(null, 'y', r.y);
			rect.setAttributeNS(null, 'height', r.height);
			rect.setAttributeNS(null, 'width', r.width);
			rect.setAttributeNS(null, 'fill', r.color);
			// Note: rects are drawn to Rect container
			this.$svg_rect_container.appendChild(rect);

			// Remove temporary points
			while(tmp_points.length > 0) {
				tmp_points[0].parentElement.removeChild(tmp_points[0]);
			}
		},

		editPlate: function (plate) {
			if (! (plate instanceof Plate)) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'View - trying to edit plate with faulty parameter:\n' + JSON.stringify(plate));
				return false;
			}

			var rect = document.getElementById(plate.id),
				r = plate.toRect();
			rect.setAttributeNS(null, 'x', r.x);
			rect.setAttributeNS(null, 'y', r.y);
			rect.setAttributeNS(null, 'height', r.height);
			rect.setAttributeNS(null, 'width', r.width);
			rect.setAttributeNS(null, 'fill', r.color);
			// Note: rects are drawn to Rect container
			// Move SVG Rect to right index
			var target_z = r.z;
			if (target_z > this.$svg_rect_container.childElementCount) {
				this.$svg_rect_container.appendChild(rect);
			} else {
				this.$svg_rect_container.insertBefore(rect, this.$svg_rect_container.children[target_z]);
			}
		},

		deletePlate: function (plate_id) {
			if( !Number.isInteger(plate_id)) {
				EventHandler.emit(EventHandler.ERROR_MSG, 'View - trying to delete plate with faulty parameter:\n' + JSON.stringify(plate_id));
				return false;
			}

			document.getElementById(plate_id).remove();
		},

		mouseInEditor: function (event) {
			var r = this.$bgrect.getBoundingClientRect(),
				point = {
					x: event.clientX - r.left,
					y: event.clientY - r.top
				};

			EventHandler.emit(EventHandler.VIEW_GRID_MOUSE_IN, point);
		},

		mouseMoveEditor: function (event) {
			var r = this.$bgrect.getBoundingClientRect(),
				point = {
					x: event.clientX - r.left,
					y: event.clientY - r.top
				};

			EventHandler.emit(EventHandler.VIEW_GRID_MOUSE_MOVE, point);
		},

		mouseOutEditor: function (event) {
			var r = this.$bgrect.getBoundingClientRect(),
				point = {
					x: event.clientX - r.left,
					y: event.clientY - r.top
				};

			EventHandler.emit(EventHandler.VIEW_GRID_MOUSE_OUT, point);
		},

		readSettings: function (event) {
			// Change bgrect according to the size defined in settings
			var newHeight = event.heightInBricks * Globals.BRICKSIZE,
				newWidth = event.widthInBricks * Globals.BRICKSIZE;

			this.$svg.setAttribute('height', newHeight);
			this.$svg.setAttribute('width', newWidth);
			this.$bgrect.setAttribute('height', newHeight);
			this.$bgrect.setAttribute('width', newWidth);
			// TODO: This must clip other rects!
		},

		init: function () {
			this.$svg = document.getElementById(this.settings.svgElement);
			this.$svg_rect_container = this.$svg.getElementsByTagName('g')[0];
			this.$svg_point_container = this.$svg.getElementsByTagName('g')[1];
			this.$bgrect = document.getElementById(this.settings.bgRectId);
			this.initSVG();
			this.bindEvents();
		}
	};

	View.init();
}());