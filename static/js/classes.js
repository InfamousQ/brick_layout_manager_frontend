/*jshint esversion: 6 */
/*global Globals */

/**
 * Plate is SVG Rect that displays single square region in the SVG.
 * In LEGO terms, builders add Plates on top of Baseplate to structure their Module
 * Note: each dimension is in studs, to calculate SVG position use Globals.BRICKSIZE
 */
class Plate {
	constructor(id, x, y, h, w, c = Globals.COLORS.default) {
		/**
		 * @member {number} Id of Plate
		 */
		this.id = id;
		/**
		 * @member {number} X position of Plate in studs.
		 */
		this.x = x / Globals.BRICKSIZE;
		/**
		 * @member {number} Y position of Plate in studs.
		 */
		this.y = y / Globals.BRICKSIZE;
		/**
		 * @member {number} Height of Plate in studs.
		 */
		this.height = h / Globals.BRICKSIZE;
		/**
		 * @member {number} Width of Plate in studs.
		 */
		this.width = w / Globals.BRICKSIZE;
		/**
		 * @member {String} Color of Plate in hex.
		 */
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

/**
 * Baseplate is collection of Plates that form single Module. Baseplate handles storing the Plates 
 */
class Baseplate {
	/**
	 * Creates Baseplate
	 */
	constructor() {
		/**
		* @member {Plates[]} Array of Plates
		*/
		this.plates = [];
	}

	/**
	 * Get next id (greatest + 1) for Plate in this module
	 * @returns {number} Next available id
	 */
	getNextId() {
		var nextid = 0,
			ids = Object.keys(this.plates);
		if (ids.length > 0) {
			nextid = (Math.max.apply(null, ids) + 1);
		}
		return nextid;
	}

	/**
	 * Add a Plate to Baseplate's Plate collection
	 * @param {Plate} p Plate to add
	 */
	addPlate(p) {
		if (!(p instanceof Plate)) {
			return;
		}
		this.plates.splice(p.id, 0, p);
	}

	/**
	 * Get Plate by plate's id
	 * @param   {number} pid Id of plate
	 * @returns {?Plate} Plate that has given id. Null of no Plate founds
	 */
	getPlateById(pid) {
		return (this.plates[pid] === 'undefined' ? null : this.plates[pid]);
	}

	/**
	 * Edit Plate by plate's id
	 * @param   {number} pid Id of plate
	 * @param   {Plate} p   Plate's new data
	 * @returns {boolean}  Was update successful?
	 */
	editPlateById(pid, p) {
		if (!(p instanceof Plate)) {
			return false;
		}

		if (this.plates[pid] === 'undefined') {
			return false;
		}

		// TODO: This should be done by copying possible data from p, not by just moving data around
		this.plates[pid] = p;
		return true;
	}

	/**
	 * Edit Plate
	 * @param   {Plate}   p Plate
	 * @returns {boolean} Was update successful?
	 */
	editPlate(p) {
		return this.editPlateById(p.id, p);
	}

	/**
	 * Remove Plate that has given id
	 * @param {number} pid Id of to-be-removed plate
	 */
	remotePlateById(pid) {
		this.plates.splice(pid, 1);
	}

	/**
	 * Remove given Plate
	 * @param {Plate} p Plate to be removed
	 */
	removePlate(p) {
		if (!(p instanceof Plate)) {
			return;
		}
		this.remotePlateById(p.id);
	}
}