/*jshint esversion: 6 */
/*global Globals */

/**
 * Plate is SVG Rect that displays single square region in the SVG.
 * In LEGO terms, builders add Plates on top of Baseplate to structure their Module
 * Note: each dimension is in studs, to calculate SVG position use Globals.BRICKSIZE
 **/
class Plate {
	constructor(id, x, y, h, w, c = Globals.COLORS.default) {
		this.id = id;
		this.x = x / Globals.BRICKSIZE;
		this.y = y / Globals.BRICKSIZE;
		this.height = h / Globals.BRICKSIZE;
		this.width = w / Globals.BRICKSIZE;
		this.color = c;
	}

	// Returns this Plate in SVG Rect format (calculates SVG dimensions)
	toRect() {
		var r = {
			id: this.id,
			x: this.x * Globals.BRICKSIZE,
			y: this.y * Globals.BRICKSIZE,
			height: this.height * Globals.BRICKSIZE,
			width: this.width * Globals.BRICKSIZE,
			color: this.color
		};
		return r;
	}

	static fromRect(r = null) {
		if (null === r) {
			return null;
		}

		// Expected properties: id, x, y, height, width. i must exist and not be empty, X & Y must be zero or above, height & width must be 1 or above.
		if (!r.hasOwnProperty('id') || r.id === "") {
			return null;
		}
		if (!r.hasOwnProperty('x') || r.x < 0) {
			return null;
		}
		if (!r.hasOwnProperty('y') || r.y < 0) {
			return null;
		}
		if (!r.hasOwnProperty('height') || r.height < 1) {
			return null;
		}
		if (!r.hasOwnProperty('width') || r.width < 1) {
			return null;
		}

		// Everything looks good, get data from r
		return new Plate(r.id, r.x, r.y, r.height, r.width, (r.hasOwnProperty('color') ? r.color : null));
	}
}