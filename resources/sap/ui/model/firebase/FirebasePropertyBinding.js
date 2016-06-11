// Provides the Firebase model implementation of a property binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ChangeReason', 'sap/ui/model/ClientPropertyBinding'],
	function(jQuery, ChangeReason, ClientPropertyBinding) {
	"use strict";


	/**
	 *
	 * @class
	 * Property binding implementation for Firebase model
	 *
	 * @param {sap.ui.model.firebase.FirebaseModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.firebase.FirebasePropertyBinding
	 * @extends sap.ui.model.ClientPropertyBinding
	 */
	var FirebasePropertyBinding = ClientPropertyBinding.extend("sap.ui.model.firebase.FirebasePropertyBinding");

	/**
	 * @see sap.ui.model.PropertyBinding.prototype.setValue
	 */
	FirebasePropertyBinding.prototype.setValue = function(oValue){
		if (this.bSuspended) {
			return;
		}
		if (!jQuery.sap.equal(this.oValue, oValue)) {
			if (this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
				this.oValue = oValue;
				this.getDataState().setValue(this.oValue);
			}
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 *
	 */
	FirebasePropertyBinding.prototype.checkUpdate = function(bForceupdate){
		if (this.bSuspended && !bForceupdate) {
			return;
		}

		var oValue = this._getValue();
		if (!jQuery.sap.equal(oValue, this.oValue) || bForceupdate) {// optimize for not firing the events when unneeded
			this.oValue = oValue;
			this.getDataState().setValue(this.oValue);
			this.checkDataState();
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	return FirebasePropertyBinding;

});
