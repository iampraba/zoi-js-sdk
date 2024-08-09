import {SDKException} from "../../routes/exception/sdk_exception.js";
import {Constants} from "../../utils/util/constants.js";
import {Auth} from "./auth.js";

class AuthBuilder
{
    _authenticationSchema;
    _parameterMap = new Map();
    _headerMap = new Map();
    addParam(paramName, paramValue)
    {
        if (this._parameterMap.has(paramName) && this._parameterMap.get(paramName).length > 0)
        {
            let existingParamValue = this._parameterMap.get(paramName);
            existingParamValue = existingParamValue + "," + paramValue;
            this._parameterMap.set(paramName, existingParamValue);
        }
        else
        {
            this._parameterMap.set(paramName, paramValue);
        }
        return this;
    }

    addHeader(headerName, headerValue)
    {
        if (this._headerMap.has(headerName) && this._headerMap.get(headerName).length > 0)
        {
            let existingHeaderValue = this._headerMap.get(headerName);
            existingHeaderValue = existingHeaderValue + "," + headerValue;
            this._headerMap.set(headerName, existingHeaderValue);
        }
        else
        {
            this._headerMap.set(headerName, headerValue);
        }
        return this;
    }

    parameterMap(parameterMap)
    {
        this._parameterMap = parameterMap;
        return this;
    }
    headerMap(headerMap)
    {
        this._headerMap = headerMap;
        return this;
    }
    authenticationSchema(authenticationSchema)
    {
        this._authenticationSchema = authenticationSchema;
        return this;
    }

    build()
    {
        if (this._authenticationSchema == null)
        {
            throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.OAUTH_MANDATORY_KEYS_1)
        }
        return new Auth(this._parameterMap, this._headerMap, this._authenticationSchema);
    }
}
export
{
    AuthBuilder as MasterModel,
    AuthBuilder as AuthBuilder
}