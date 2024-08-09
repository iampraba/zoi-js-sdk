import {SDKException} from "../../../../../routes/exception/sdk_exception.js";
import {Constants} from "../../../../../utils/util/constants.js";

class DocumentDeleteSuccessResponse{

	documentDeleted;
	keyModified = new Map();
	/**
	 * The method to get the documentDeleted
	 * @returns {Boolean} A Boolean representing the documentDeleted
	 */
	getDocumentDeleted()	{
		return this.documentDeleted;

	}

	/**
	 * The method to set the value to documentDeleted
	 * @param {Boolean} documentDeleted A Boolean representing the documentDeleted
	 */
	setDocumentDeleted(documentDeleted)	{
		if((documentDeleted != null) && (!(Object.prototype.toString.call(documentDeleted) == "[object Boolean]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: documentDeleted EXPECTED TYPE: Boolean", null, null);
		}
		this.documentDeleted = documentDeleted;
		this.keyModified.set("document_deleted", 1);

	}

	/**
	 * The method to check if the user has modified the given key
	 * @param {String} key A String representing the key
	 * @returns {number} A number representing the modification
	 */
	isKeyModified(key)	{
		if((key != null) && (!(Object.prototype.toString.call(key) == "[object String]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: key EXPECTED TYPE: String", null, null);
		}
		if(this.keyModified.has(key))	{
			return this.keyModified.get(key);
		}
		return null;

	}

	/**
	 * The method to mark the given key as modified
	 * @param {String} key A String representing the key
	 * @param {number} modification A number representing the modification
	 */
	setKeyModified(key, modification)	{
		if((key != null) && (!(Object.prototype.toString.call(key) == "[object String]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: key EXPECTED TYPE: String", null, null);
		}
		if((modification != null) && (!(Object.prototype.toString.call(modification) == "[object Number]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: modification EXPECTED TYPE: number", null, null);
		}
		this.keyModified.set(key, modification);

	}


}
export {
	DocumentDeleteSuccessResponse as MasterModel,
	DocumentDeleteSuccessResponse as DocumentDeleteSuccessResponse
}
