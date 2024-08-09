import {AuthenticationSchema} from "../../../../../models/authenticator/authentication_schema.js";
import {AuthenticationType} from "../../../../../models/authenticator/token.js";
import {SDKException} from "../../../../../routes/exception/sdk_exception.js";
import {Constants} from "../../../../../utils/util/constants.js";

class TokenFlow extends AuthenticationSchema{
	/**
	 * The method to get Token Url
	 * @returns {String} A String representing the TokenUrl
	 */
	getTokenUrl()	{
		return "/zest/v1/__internal/ticket";

	}

	/**
	 * The method to get Authentication Url
	 * @returns {String} A String representing the AuthenticationUrl
	 */
	getAuthenticationUrl()	{
		return "";

	}

	/**
	 * The method to get Refresh Url
	 * @returns {String} A String representing the RefreshUrl
	 */
	getRefreshUrl()	{
		return "";

	}

	/**
	 * The method to get Schema
	 * @returns {String} A String representing the Schema
	 */
	getSchema()	{
		return "TokenFlow";

	}

	/**
	 * The method to get Authentication Type
	 * @returns {AuthenticationType} An instance of AuthenticationType
	 */
	getAuthenticationType()	{
		return AuthenticationType.TOKEN;

	}


}
export {
	TokenFlow as MasterModel,
	TokenFlow as TokenFlow
}
