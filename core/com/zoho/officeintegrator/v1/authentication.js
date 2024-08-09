import {AuthenticationSchema} from "../../../../../models/authenticator/authentication_schema.js";
import {AuthenticationType} from "../../../../../models/authenticator/token.js";
import {TokenFlow} from "./token_flow.js";
import {SDKException} from "../../../../../routes/exception/sdk_exception.js";
import {Constants} from "../../../../../utils/util/constants.js";

class Authentication{
	/**
	 * The method to get the tokenFlow
	 * @returns {TokenFlow} An instance of TokenFlow
	 */
	async getTokenFlow()	{
		return new TokenFlow();

	}
}
export {
	Authentication as MasterModel,
	Authentication as Authentication
}
