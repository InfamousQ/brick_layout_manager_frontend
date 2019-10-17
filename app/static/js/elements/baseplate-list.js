/*jshint esversion: 6 */
/*global App, EventHandler, document, CallbackMap, Baseplate, Plate, Rect, window */
App.baseplate_list = (function () {
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
			mainDiv: 'baseplate-list',
			baseplatelistElement: 'baseplate-collection',
			addBaseplateButtonElement: 'add-baseplate',
		},

		storage: null,

		$baseplatelist: null,
		$addBaseplateButton: null,

		bindEvents: function() {
			this.$addBaseplateButton.onclick = this.addBaseplate.bind(this);

			EventHandler.listen(EventHandler.MODULES_SAVE_BASEPLATE, this.saveBaseplate.bind(this));
			EventHandler.listen(EventHandler.MODULES_DELETE_BASEPLATE_BY_ID, this.deleteBaseplate.bind(this));
		},

		init: function () {
			this.storage = new Storage(this.onStorageUpdate.bind(this));
			this.$baseplatelist = document.getElementById(this.settings.baseplatelistElement);
			this.$addBaseplateButton = document.getElementById(this.settings.addBaseplateButtonElement);

			// TESTING - Loading initial baseplates to storage
			let modules = [];
				const bp1 = new Baseplate(1, function() {});
				bp1.addPlate(new Plate(new Rect(1, 20, 20, 1, 20, 20)));
				bp1.addPlate(new Plate(new Rect(2, 40, 40, 2, 20, 20)));
			modules.push(bp1);
				const bp2 = new Baseplate(2, function() {});
				bp2.addPlate(new Plate(new Rect(1, 60, 60, 1, 20, 20)));
				bp2.addPlate(new Plate(new Rect(2, 80, 80, 2, 20, 20)));
			modules.push(bp2);
			this.storage.loadArray(modules);
			// END TESTING

			this.bindEvents();

			return this;
		},

		onActivation: function () {

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
				li.getElementsByTagName('a')[0].setAttribute('href', '#baseplate-' + bp.id);
				this.$baseplatelist.appendChild(li);
			}, this);
		},

		addBaseplate: function() {
			// Route to new baseplate view
			window.location = window.location.origin + window.location.pathname + "#baseplate-0";
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
		},

		deleteBaseplate: function(baseplate_id) {
			if (this.storage.baseplates.has(baseplate_id)) {
				this.storage.baseplates.delete(baseplate_id);
			} else {
				EventHandler.emit(EventHandler.ERROR_MSG, 'BaseplateList - trying to delete non-existing baseplate #' + baseplate_id);
			}
		}
	};
	return Modules.init();
}());