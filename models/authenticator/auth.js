import {Token} from "./token.js";

class Auth extends Token
{
    _authenticationSchema;

    _parameterMap = new Map();

    _headerMap = new Map();

    getAuthenticationSchema()
    {
        return this._authenticationSchema;
    }
    setAuthenticationSchema(authenticationSchema)
    {
        this._authenticationSchema = authenticationSchema;
    }
    authenticate(urlConnection, config) {
        if(this._headerMap.size > 0)
        {
            for (const header of this._headerMap.keys())
            {
                urlConnection.addHeader(header, this._headerMap.get(header))
            }
        }
        if (this._parameterMap.size > 0)
        {
            for (const param of this._parameterMap.keys())
            {
                urlConnection.addParam(param, this._parameterMap.get(param))
            }
        }
    }
    remove() {}
    generateToken() {}
    getId()
    {
        return null
    }
    constructor(parameterMap, headerMap, authenticationSchema) {
        super();
        this._parameterMap = parameterMap;
        this._headerMap = headerMap;
        this._authenticationSchema = authenticationSchema;
    }
}
export {
    Auth as MasterModel,
    Auth as Auth
}