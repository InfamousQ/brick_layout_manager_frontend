/*jshint esversion: 6 */
/*global App, EventHandler, document, CallbackMap, Baseplate, Plate, Rect */
App.modules = (function () {
	"use strict";
	class Storage {
		constructor (onchangefunction) {
			this.baseplates = new CallbackMap(onchangefunction);
		}

		loadArray(arr) {
			arr.forEach(function (item) {
				this.baseplates.set(item.id, item);
			}, this);
		}

	/**
	 * Get next id (greatest + 1) for Plate in this module
	 * @returns {number} Next available id
	 */
	getNextId() {
		var curMaxId = Array.from(this.baseplates.keys()).reduce(function (curMax, curVal) {
			return Math.max(curMax, curVal);
		}, 0);
		return curMaxId + 1;
	}

		getBaseplates() {
			return this.baseplates.values();
		}
	}

	const Modules = {
		settings: {
			baseplatelistElement: 'baseplate-list',
		},

		storage: null,

		$baseplatelist: null,

		init: function () {
			this.storage = new Storage(this.onStorageUpdate.bind(this));
			this.$baseplatelist = document.getElementById(this.settings.baseplatelistElement);

			EventHandler.listen(EventHandler.MODULES_SAVE_BASEPLATE, this.saveBaseplate.bind(this));

			// TESTING - Loading initial baseplates to storage
			let modules = [];
				const bp1 = new Baseplate(1, function() {});
				bp1.addPlate(new Plate(new Rect(0, 20, 20, 1, 20, 20)));
				bp1.addPlate(new Plate(new Rect(1, 40, 40, 2, 20, 20)));
			modules.push(bp1);
				const bp2 = new Baseplate(2, function() {});
				bp2.addPlate(new Plate(new Rect(0, 60, 60, 1, 20, 20)));
				bp2.addPlate(new Plate(new Rect(1, 80, 80, 2, 20, 20)));
			modules.push(bp2);
			this.storage.loadArray(modules);
			// END TESTING

			return this;
		},

		// When Storage is edited, re-populate list of available baseplates
		onStorageUpdate: function () {
			// Remove existing li-elements excluding the skeleton
			Array.from(this.$baseplatelist.querySelectorAll("li:not(.skeleton)")).forEach(function (li) {
				li.remove();
			});

			// Generate new li-element for each baseplate in this.baseplates. li-elements contains link that opens baseplate in edit view.
			Array.from(this.storage.getBaseplates()).forEach(function (bp) {
				let li = this.$baseplatelist.getElementsByClassName('skeleton')[0].cloneNode(true);
				// Add Baseplate information
				li.classList.remove('skeleton');
				li.getElementsByClassName('id')[0].textContent = bp.id;
				li.getElementsByTagName('a')[0].setAttribute('href', '#module-' + bp.id);
				this.$baseplatelist.appendChild(li);
			}, this);
		},

		// Save/update Baseplate
		saveBaseplate(baseplate) {
			if (baseplate.id > 0) {
				// If baseplate has id, save it to Storage
			} else {
				// Get new id for baseplate
				baseplate.id = this.storage.getNextId();
			}
			this.storage.baseplates.set(baseplate.id, baseplate);
		}

	};
	return Modules.init();
}());