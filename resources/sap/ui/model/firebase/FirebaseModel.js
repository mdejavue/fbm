/**
 * Firebase DataBinding
 *
 * @namespace
 * @name sap.ui.model.firebase
 * @public
 */

// Provides the Firebase backend based model implementation
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ClientModel', 'sap/ui/model/Context', './FirebasePropertyBinding'],
	function(jQuery, ClientModel, Context, FirebasePropertyBinding) {
	"use strict";


	/**
	 * Constructor for a new FirebaseModel.
	 *
	 * @class
	 * Model implementation for Firebase backend
	 *
	 * @extends sap.ui.model.ClientModel
	 *
	 * @author SAP SE
	 * @version 1.38.3
	 *
	 * @param {string} sRef Reference to Firebase Realtime database
	 * @constructor
	 * @public
	 * @alias sap.ui.model.firebase.FirebaseModel
	 */
	var FirebaseModel = ClientModel.extend("sap.ui.model.firebase.FirebaseModel", /** @lends sap.ui.model.firebase.FirebaseModel.prototype */ {

		constructor : function(sRef) {
			//this.pSequentialImportCompleted = Promise.resolve();
			ClientModel.apply(this, arguments);

			if (sRef) {
				this.setRef(sRef);
			}
		},

		metadata : {
			publicMethods : ["setJSON", "getJSON"]
		}

	});

	/**
	 * Sets the Firebase backend data to the model.
	 *
	 * @param {string} sRef Reference to Firebase Realtime database
	 *
	 * @public
	 */
	FirebaseModel.prototype.setRef = function(sRef){

		var that = this;		
		firebase.database().ref(sRef).on('value', function(snapshot) {
			// TODO: Resolution of JSON Object structure from string sRef
			that.oData = snapshot.val();
			that.checkUpdate();
		});
	};



	FirebaseModel.prototype.loadData = function(sURL, oParameters, bAsync, sType, bMerge, bCache, mHeaders){
		this.setRef(sURL);
	};


	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 *
	 */
	FirebaseModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new FirebasePropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};
	
	/**
	 * Sets a new value for the given property <code>sPropertyName</code> in the model.
	 * If the model value changed all interested parties are informed.
	 *
	 * @param {string}  sPath path of the property to set
	 * @param {any}     oValue value to set the property to
	 * @param {object} [oContext=null] the context which will be used to set the property
	 * @param {boolean} [bAsyncUpdate] whether to update other bindings dependent on this property asynchronously
	 * @return {boolean} true if the value was set correctly and false if errors occurred like the entry was not found.
	 * @public
	 */
	FirebaseModel.prototype.setProperty = function(sPath, oValue, oContext, bAsyncUpdate) {
		firebase.database().ref(this.resolve(sPath, oContext)).set(oValue);
		return true;
	};

	/**
	* Returns the value for the property with the given <code>sPropertyName</code>
	*
	* @param {string} sPath the path to the property
	* @param {object} [oContext=null] the context which will be used to retrieve the property
	* @type any
	* @return the value of the property
	* @public
	*/
	FirebaseModel.prototype.getProperty = function(sPath, oContext) {
		return this._getObject(sPath, oContext);
	};

	/**
	 * @param {string} sPath
	 * @param {object} [oContext]
	 * @returns {any} the node of the specified path/context
	 */
	FirebaseModel.prototype._getObject = function (sPath, oContext) {
		var oNode = this.isLegacySyntax() ? this.oData : null;
		if (oContext instanceof Context) {
			oNode = this._getObject(oContext.getPath());
		} else if (oContext) {
			oNode = oContext;
		}
		if (!sPath) {
			return oNode;
		}
		var aParts = sPath.split("/"),
			iIndex = 0;
		if (!aParts[0]) {
			// absolute path starting with slash
			oNode = this.oData;
			iIndex++;
		}
		while (oNode && aParts[iIndex]) {
			oNode = oNode[aParts[iIndex]];
			iIndex++;
		}
		return oNode;
	};

	return FirebaseModel;

});
