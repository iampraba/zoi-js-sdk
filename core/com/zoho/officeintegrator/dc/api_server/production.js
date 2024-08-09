import {Location} from "../../../../../../models/authenticator/token.js";
import {Environment} from "../../../../../com/zoho/officeintegrator/dc/environment.js";
import {SDKException} from "../../../../../../routes/exception/sdk_exception.js";
import {Constants} from "../../../../../../utils/util/constants.js";

class Production extends Environment{

	serverDomain;
	/**
	 * Creates an instance of Production with the given parameters
	 * @param {String} serverDomain A String representing the serverDomain
	 */
	constructor(serverDomain){
		super();
		if((serverDomain != null) && (!(Object.prototype.toString.call(serverDomain) == "[object String]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: serverDomain EXPECTED TYPE: String", null, null);
		}
		this.serverDomain = serverDomain;

	}

	/**
	 * The method to get Url
	 * @returns {String} A String representing the Url
	 */
	getUrl()	{
		return "" + this.serverDomain + "";

	}

	/**
	 * The method to get dc
	 * @returns {String} A String representing the dc
	 */
	getDc()	{
		return "alldc";

	}

	/**
	 * The method to get location
	 * @returns {Location} An instance of Location
	 */
	getLocation()	{
		return null;

	}

	/**
	 * The method to get name
	 * @returns {String} A String representing the name
	 */
	getName()	{
		return "";

	}

	/**
	 * The method to get value
	 * @returns {String} A String representing the value
	 */
	getValue()	{
		return "";

	}


}
export {
	Production as MasterModel,
	Production as Production
}
