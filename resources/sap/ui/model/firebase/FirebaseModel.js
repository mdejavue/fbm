/**
 * Firebase DataBinding
 *
 * @namespace
 * @name sap.ui.model.firebase
 * @public
 */

// Provides the Firebase backend based model implementation
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ClientModel', 'sap/ui/model/Context', 'sap/ui/model/json/JSONPropertyBinding', 'sap/ui/model/json/JSONListBinding'],
	function(jQuery, ClientModel, Context, JSONPropertyBinding, JSONListBinding) {
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
	 * @param {object} config for Firebase Realtime database
	 * @constructor
	 * @public
	 * @alias sap.ui.model.firebase.FirebaseModel
	 */
	var FirebaseModel = ClientModel.extend("sap.ui.model.firebase.FirebaseModel", /** @lends sap.ui.model.firebase.FirebaseModel.prototype */ {

		constructor : function(config) {
			//this.pSequentialImportCompleted = Promise.resolve();
			ClientModel.apply(this, arguments);
			firebase.initializeApp(config);
		},

		metadata : {
			publicMethods : ["setJSON", "getJSON"]
		}

	});

	/**
	 * Sets the Firebase backend data to the model.
	 *
	 * @param {string} sRef Reference to Firebase Realtime database
	 * @param {boolean} bIsNode Distinguishes between nodes and leafs in Firebase database model
	 *
	 * @public
	 */
	FirebaseModel.prototype.addRef = function(sRef,bIsNode){

		var that = this;	
		if (!bIsNode) {	
			firebase.database().ref(sRef).on('value', function(snapshot) {
				that.oData[sRef] = snapshot.val();
				that.checkUpdate();
			});
		} 
		else {
			this.oData[sRef] = {};
			firebase.database().ref(sRef).on('child_changed', function(data) {
				that.oData[sRef][data.key] = data.val();
				that.checkUpdate();
			});
			firebase.database().ref(sRef).on('child_added', function(data) {
				that.oData[sRef][data.key] = data.val();
				that.checkUpdate();
			});
			firebase.database().ref(sRef).on('child_removed', function(data) {
				that.oData[sRef][data.key] = null;
				that.checkUpdate();
			});
		}
	};



	FirebaseModel.prototype.loadData = function(sURL, oParameters, bAsync, sType, bMerge, bCache, mHeaders){
		
	};


	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 *
	 */
	FirebaseModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		this.addRef(this.resolve(sPath,oContext), mParameters ? mParameters.isNode : null);
		var oBinding = new JSONPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindList
	 *
	 */
	FirebaseModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		this.addRef(this.resolve(sPath,oContext), true);
		var oBinding = new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
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

	FirebaseModel.prototype._getObject = function(sPath, oContext) {
		return this.oData[this.resolve(sPath, oContext)];
	};




	FirebaseModel.prototype.isList = function(sPath, oContext) {
		return jQuery.isArray(this._getObject(sPath, oContext));
	};

	return FirebaseModel;

});
