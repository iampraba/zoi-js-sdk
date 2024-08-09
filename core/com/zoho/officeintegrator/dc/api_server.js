import {Location} from "../../../../../models/authenticator/token.js";
import {Environment} from "../../../../com/zoho/officeintegrator/dc/environment.js";
import {Production} from "./api_server/production.js";
import {SDKException} from "../../../../../routes/exception/sdk_exception.js";
import {Constants} from "../../../../../utils/util/constants.js";

class APIServer{
	/**
	 * The method to get the production
	 * @param {String} serverDomain A String representing the serverDomain
	 * @returns {Production} An instance of Production
	 */
	async getProduction(serverDomain)	{
		if((serverDomain != null) && (!(Object.prototype.toString.call(serverDomain) == "[object String]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: serverDomain EXPECTED TYPE: String", null, null);
		}
		return new Production(serverDomain);

	}
}
export {
	APIServer as MasterModel,
	APIServer as APIServer
}
