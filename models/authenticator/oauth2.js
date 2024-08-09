import {Token} from "./token.js";
import {Initializer} from "../../routes/initializer.js";
import {Constants} from "../../utils/util/constants.js";
import {SDKException} from "../../routes/exception/sdk_exception.js";
import pkg from "winston";
import got from "got";
let Logger = pkg;
import FormData from "form-data";

class OAuth2 extends Token
{
    _clientId;
    _clientSecret;
    _redirectURL;
    _grantToken;
    _refreshToken;
    _accessToken;
    _expiresIn;
    _userSignature;
    _id;
    _authenticationSchema;

    constructor(clientId, clientSecret, grantToken, refreshToken, redirectURL, id, accessToken, userSignature, authenticationSchema) {
        super();
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._grantToken = grantToken;
        this._refreshToken = refreshToken;
        this._redirectURL = redirectURL;
        this._accessToken = accessToken;
        this._id = id;
        this._userSignature = userSignature;
        this._authenticationSchema = authenticationSchema;
    }

    getClientId()
    {
        return this._clientId;
    }

    getClientSecret()
    {
        return this._clientSecret;
    }

    setClientId(clientId)
    {
        this._clientId = clientId;
    }

    setClientSecret(clientSecret)
    {
        this._clientSecret = clientSecret;
    }

    getGrantToken()
    {
        return this._grantToken;
    }

    setGrantToken(grantToken)
    {
        this._grantToken = grantToken;
    }

    getRefreshToken()
    {
        return this._refreshToken;
    }

    setRefreshToken(refreshToken)
    {
        this._refreshToken = refreshToken;
    }

    getRedirectURL()
    {
        return this._redirectURL;
    }

    setRedirectURL(redirectURL)
    {
        this._redirectURL = redirectURL;
    }

    getAccessToken()
    {
        return this._accessToken;
    }

    setAccessToken(accessToken)
    {
        this._accessToken = accessToken;
    }

    getId()
    {
        return this._id;
    }

    setId(id)
    {
        this._id = id;
    }

    getUserSignature()
    {
        return this._userSignature;
    }

    setUserSignature(userSignature)
    {
        this._userSignature = userSignature;
    }

    getAuthenticationSchema()
    {
        return this._authenticationSchema;
    }

    setAuthenticationSchema(authenticationSchema)
    {
        this._authenticationSchema = authenticationSchema;
    }

    getExpiresIn()
    {
        return this._expiresIn;
    }

    setExpiresIn(expiresIn)
    {
        this._expiresIn = expiresIn;
    }

    async getToken()
    {
        let refreshUrl = this._authenticationSchema.getRefreshUrl();
        let tokenUrl = this._authenticationSchema.getTokenUrl();
        let initializer = await Initializer.getInitializer().catch((err) => { throw err;});
        let store = initializer.getStore();
        let oauthToken;
        if (this.getId() != null)
        {
            oauthToken = await store.findTokenById(this.getId()).catch((err) => { throw err;});
            await this.mergeObjects(this, oauthToken).catch((err) => { throw err;});
        }
        else
        {
            oauthToken = await store.findToken(this).catch((err) => { throw err;});
        }
        if (oauthToken == null)
        {
            if (this.getUserSignature() != null)
            {
                await this.checkTokenDetails().catch((err) => { throw err;});
            }
            oauthToken = this;
        }
        if (oauthToken.getAccessToken() == null || oauthToken.getAccessToken().length == 0)
        {
            if (oauthToken.getRefreshToken() != null && oauthToken.getRefreshToken().length > 0)
            {
                Logger.info(Constants.ACCESS_TOKEN_USING_REFRESH_TOKEN_MESSAGE);
                await oauthToken.refreshAccessToken(oauthToken, store, refreshUrl).catch((err) => { throw err;});
            }
            else
            {
                Logger.info(Constants.ACCESS_TOKEN_USING_GRANT_TOKEN_MESSAGE);
                await oauthToken.generateAccessToken(oauthToken, store, tokenUrl).catch((err) => { throw err;});
            }
        }
        else if (oauthToken.getExpiresIn() != null && (oauthToken.getExpiresIn()) > 0 && this.getTokenExpiry(oauthToken))
        {
            Logger.info(Constants.REFRESH_TOKEN_MESSAGE);
            await oauthToken.refreshAccessToken(oauthToken, store, refreshUrl).catch((err) => { throw err;});
        }
        else if (oauthToken.getExpiresIn() == null && oauthToken.getAccessToken() != null && oauthToken.getId() == null)
        {
            await store.saveToken(oauthToken).catch((err) => { throw err;});
        }
        return oauthToken.getAccessToken();
    }

    async authenticate(urlConnection, config) {
        if (config != null) {
            let tokenConfig = config;
            if (tokenConfig.hasOwnProperty(Constants.LOCATION) && tokenConfig.hasOwnProperty(Constants.NAME)) {
                if (tokenConfig[Constants.LOCATION].toLowerCase() == Constants.HEADER) {
                    urlConnection.addHeader(tokenConfig[Constants.NAME], Constants.OAUTH_HEADER_PREFIX.concat(await this.getToken().catch((err) => {
                        throw err;
                    })));
                } else if (tokenConfig[Constants.LOCATION].toLowerCase() == Constants.PARAM) {
                    urlConnection.addParam(tokenConfig[Constants.NAME], Constants.OAUTH_HEADER_PREFIX.concat(await this.getToken().catch((err) => {
                        throw err;
                    })));
                }
            }
        } else {
            urlConnection.addHeader(Constants.AUTHORIZATION, Constants.OAUTH_HEADER_PREFIX.concat(await this.getToken().catch((err) => {
                throw err;
            })));
        }
    }

    getTokenExpiry(oauthToken) {
        let num = (parseInt(oauthToken.getExpiresIn()) - new Date().getTime());
        return num < 5000;
    }
    async checkTokenDetails() {
        if (this.getGrantToken() == null && this.getRefreshToken() == null) {
            throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.GET_TOKEN_BY_USER_NAME_ERROR + " - " + Constants.OAUTH_MANDATORY_KEYS2.join())
        }
    }

    async mergeObjects(first, second) {
        if (first instanceof OAuth2 && second instanceof OAuth2) {
            let fieldsarray = Object.keys(first);
            fieldsarray.forEach(field => {
                let value1 = Reflect.get(first, field);
                let value2 = Reflect.get(second, field);
                let value = (value1 != null) ? value1 : value2;
                Reflect.set(first, field, value);
            });
        }
    }
    async refreshAccessToken(oauthToken, store, url) {
        var formDataRequestBody = new FormData();
        formDataRequestBody.append(Constants.CLIENT_ID, oauthToken.getClientId());
        formDataRequestBody.append(Constants.CLIENT_SECRET, oauthToken.getClientSecret());
        formDataRequestBody.append(Constants.GRANT_TYPE, Constants.REFRESH_TOKEN);
        formDataRequestBody.append(Constants.REFRESH_TOKEN, oauthToken.getRefreshToken());
        const requestDetails = {
            method: Constants.REQUEST_METHOD_POST,
            headers: {},
            body: formDataRequestBody,
            encoding: "utf8",
            allowGetBody: true,
            throwHttpErrors: false,
        };
        var response = await this.getResponse(url, requestDetails);

        try {
            await this.parseResponse(oauthToken, response.body).catch((err) => {
                throw err;
            });
            Logger.info(this.toURLString(url));
            await store.saveToken(oauthToken).catch((err) => {
                throw err;
            });
        } catch (error) {
            if (error instanceof SDKException) {
                throw error;
            } else if (error instanceof Error) {
                throw new SDKException(Constants.SAVE_TOKEN_ERROR, null, null, error);
            }
        }
        return oauthToken;
    }



    async generateAccessToken(oauthToken, store, url) {
        var formDataRequestBody = new FormData();
        formDataRequestBody.append(Constants.CLIENT_ID, oauthToken.getClientId());
        formDataRequestBody.append(Constants.CLIENT_SECRET, oauthToken.getClientSecret());
        if (oauthToken.getRedirectURL() != null) {
            formDataRequestBody.append(Constants.REDIRECT_URI, oauthToken.getRedirectURL());
        }
        formDataRequestBody.append(
            Constants.GRANT_TYPE,
            Constants.GRANT_TYPE_AUTH_CODE
        );
        formDataRequestBody.append(Constants.CODE, oauthToken.getGrantToken());
        const requestDetails = {
            method: Constants.REQUEST_METHOD_POST,
            headers: {},
            body: formDataRequestBody,
            encoding: "utf8",
            allowGetBody: true,
            throwHttpErrors: false,
        };
        var response = await this.getResponse(url, requestDetails);
        try {
            await this.parseResponse(oauthToken, response.body).catch((err) => {
                throw err;
            });
            Logger.info(this.toURLString(url));
            await store.saveToken(oauthToken).catch((err) => {
                throw err;
            });
        } catch (error) {
            if (error instanceof SDKException) {
                throw error;
            } else if (error instanceof Error) {
                throw new SDKException(Constants.SAVE_TOKEN_ERROR, null, null, error);
            }
        }
        return oauthToken;
    }

    async getResponse(url, requestDetails) {
        return got(url, requestDetails);
    }

    toURLString(url)
    {
        return "POST - " + Constants.URL + " = " + url + ".";
    }
    async parseResponse(oauthToken, response) {
        try {
            var responseJSON = JSON.parse(response);
            if (!responseJSON.hasOwnProperty(Constants.ACCESS_TOKEN)) {
                throw new SDKException(
                    Constants.INVALID_TOKEN_ERROR,
                    responseJSON.hasOwnProperty(Constants.ERROR_KEY)
                        ? responseJSON[Constants.ERROR_KEY].toString()
                        : Constants.NO_ACCESS_TOKEN_ERROR
                );
            }
            oauthToken.setAccessToken(responseJSON[Constants.ACCESS_TOKEN]);
            this._expiresIn = (
                new Date().getTime() + (await this.getTokenExpiryTime(responseJSON))
            ).toString();
            if (responseJSON.hasOwnProperty(Constants.REFRESH_TOKEN)) {
                oauthToken.setRefreshToken(responseJSON[Constants.REFRESH_TOKEN]);
            }
            return oauthToken;
        }
        catch (error) {
            if (error instanceof SDKException) {
                throw error;
            } else if (error instanceof Error) {
                throw new SDKException(null, Constants.PARSE_RESPONSE + " : " + response.toString(), null, error);
            }
        }
    }

    getTokenExpiryTime(response) {
        return response.hasOwnProperty(Constants.EXPIRES_IN_SEC)
            ? response[Constants.EXPIRES_IN]
            : response[Constants.EXPIRES_IN] * 1000;
    }

    async remove() {
        try {
            if (await Initializer.getInitializer() == null)
            {
                throw new SDKException(Constants.SDK_UNINITIALIZATION_ERROR, Constants.SDK_UNINITIALIZATION_MESSAGE);
            }
            let initializer = await Initializer.getInitializer();

            await initializer.getStore().deleteToken(this.id).catch((err) => {
                throw err;
            });
        } catch (error) {
            if (error instanceof SDKException) {
                throw error;
            } else if (error instanceof Error) {
                throw new SDKException(null, null, null, error);
            }
        }
    }
}
export{
    OAuth2 as MasterModel,
    OAuth2 as OAuth2
}