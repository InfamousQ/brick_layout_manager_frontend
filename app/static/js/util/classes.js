/*jshint esversion: 6 */
/*global Globals, EventHandler */

class Rect {
	constructor(id, x, y, z, h, w, c = Globals.COLORS.default) {
		/**
		 * @member {number} Id of Rect
		 */
		this.id = id;
		/**
		 * @member {number} X position of Rect.
		 */
		this.x = x;
		/**
		 * @member {number} Y position of Rect.
		 */
		this.y = y;
		/**
		 * @member {number} Z-index position of Rect
		 */
		this.z = z;
		/**
		 * @member {number} Height of Rect.
		 */
		this.height = h;
		/**
		 * @member {number} Width of Rect.
		 */
		this.width = w;
		/**
		 * @member {String} Color of Rect in hex.
		 */
		this.color = c;
	}

	static isValidRect(r) {
		// Expected properties: id, x, y, height, width. i must exist and not be empty, X & Y must be zero or above, height & width must be 1 or above.
		if (!r.hasOwnProperty('id') || r.id === "") {
			return false;
		}
		if (!r.hasOwnProperty('x') || r.x < 0) {
			return false;
		}
		if (!r.hasOwnProperty('y') || r.y < 0) {
			return false;
		}
		if (!r.hasOwnProperty('z') || r.z < 0) {
			return false;
		}
		if (!r.hasOwnProperty('height') || r.height < 1) {
			return false;
		}
		if (!r.hasOwnProperty('width') || r.width < 1) {
			return false;
		}
		return true;
	}

	static fromEvent(data) {
		if (undefined === data.id) {
			return null;
		}

		if (undefined === data.start || undefined === data.start.x || undefined === data.start.y) {
			return null;
		}

		if (undefined === data.end || undefined === data.end.x || undefined === data.end.y) {
			return null;
		}

		if (undefined === data.z) {
			return null;
		}

		return new Rect(data.id, data.start.x, data.start.y, data.z, (data.end.y - data.start.y), (data.end.x - data.start.x));
	}
}

/**
 * Plate is SVG Rect that displays single square region in the SVG.
 * In LEGO terms, builders add Plates on top of Baseplate to structure their Module
 * Note: each dimension is in studs, to calculate SVG position use toRect()
 */
class Plate {
	constructor(rect = null) {
		if (!(rect instanceof Rect)) {
			throw 'Plate must be constructed from Rect';
		}

		if (!Rect.isValidRect(rect)) {
			throw 'Plate must be constructed from valid Rect';
		}

		/**
		 * @member {number} Id of Plate
		 */
		this.id = rect.id;
		/**
		 * @member {number} X position of Plate in studs.
		 */
		this.x = rect.x / Globals.BRICKSIZE;
		/**
		 * @member {number} Y position of Plate in studs.
		 */
		this.y = rect.y / Globals.BRICKSIZE;
		/**
		 * @member {number} Z-index of Plate
		 */
		this.z = rect.z;
		/**
		 * @member {number} Height of Plate in studs.
		 */
		this.height = rect.height / Globals.BRICKSIZE;
		/**
		 * @member {number} Width of Plate in studs.
		 */
		this.width = rect.width / Globals.BRICKSIZE;
		/**
		 * @member {String} Color of Plate in hex.
		 */
		this.color = rect.color;
	}

	// Returns this Plate in SVG Rect format (calculates SVG dimensions)
	toRect() {
		return new Rect(
			this.id,
			this.x * Globals.BRICKSIZE,
			this.y * Globals.BRICKSIZE,
			this.z,
			this.height * Globals.BRICKSIZE,
			this.width * Globals.BRICKSIZE,
			this.color);
	}

	static fromRect(r = null) {
		try {
			return new Plate(r);
		} catch (e) {
			EventHandler.emit(EventHandler.ERROR_MSG, e);
			return null;
		}
	}
}

/**
 * Baseplate is collection of Plates that form single Module. Baseplate handles storing the Plates 
 */
class Baseplate {
	/**
	 * Creates Baseplate
	 * @param {onChangeFunction} Function that will be called when there is change in Plates.
	 */
	constructor(id, onchangefunction = null) {
		/**
		* @member {Integer} Id of Baseplate
		**/
		this.id = id;
		/**
		* @member {Map<number,Plate>} Map of Plates
		*/
		this.plates = new CallbackMap((onchangefunction instanceof Function) ? onchangefunction : null);
	}

	setOnChangeFunction(onchangefunction) {
		if (onchangefunction instanceof Function) {
			this.plates.setOnCallbackFunction(onchangefunction);
		}
	}

	/**
	 * Get next id (greatest + 1) for Plate in this module
	 * @returns {number} Next available id
	 */
	getNextId() {
		var curMaxId = Array.from(this.plates.keys()).reduce(function (curMax, curVal) {
			return Math.max(curMax, curVal);
		}, 0);
		return curMaxId + 1;
	}

	/**
	 * Add a Plate to Baseplate's Plate collection
	 * @param {Plate} p Plate to add
	 */
	addPlate(p) {
		if (!(p instanceof Plate)) {
			return;
		}
		this.plates.set(p.id, p);
	}

	/**
	 * Get Plate by plate's id
	 * @param   {number} pid Id of plate
	 * @returns {?Plate} Plate that has given id. Null of no Plate founds
	 */
	getPlateById(pid) {
		if (this.plates.has(pid)) {
			return this.plates.get(pid);
		} else {
			return null;
		}
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

		if (!this.plates.has(pid)) {
			return false;
		}

		// TODO: This should be done by copying possible data from p, not by just moving data around
		this.plates.set(pid, p);
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
		this.plates.delete(pid);
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

	/**
	 * Return Iterator that contains all the Plates
	 * @returns {Iterator<Plate>} Plates contained in this Baseplate
	 */
	getPlates() {
		return this.plates.values();
	}

	getCopy() {
		let copy = new Baseplate(this.id);
		Array.from(this.plates.values()).forEach(function (p) {
			copy.addPlate(p);
		});
		return copy;
	}
}

class CallbackMap extends Map {
	constructor(callback) {
		super();
		this.callback_function = callback;
	}

	/**
	 * Adds or updates item specified by key
	 * @param   {Object} key  Identifying object
	 * @param   {Object} item Object to save
	 * @returns {Map} Reference to called object
	 */
	set(key, item) {
		let val = super.set(key, item);
		this.onSet();
		return val;
	}

	/**
	 * Returns item specified by key
	 * @param   {Object} key Identifying object
	 * @returns {?Object} Item specified by key or undefined if no items are found
	 */
	delete(key) {
		let val = super.delete(key);
		this.onSet();
		return val;
	}

	/**
	 * Calls defined callback_function when there is change in the collection
	 */
	onSet() {
		if (this.callback_function instanceof Function) {
			this.callback_function();
		}
	}

	/**
	 * Set callback function
	 * @param    {Function} oncallback Callback function
	 */
	setOnCallbackFunction(oncallbackfunction) {
		if (oncallbackfunction instanceof Function) {
			this.callback_function = oncallbackfunction;
		}
	}
}