import {OAuth2} from "./oauth2.js";
import {Utility} from "../../utils/util/utility.js";
import {SDKException} from "../../routes/exception/sdk_exception.js";
import {Constants} from "../../utils/util/constants.js";
import {AuthenticationSchema} from "./authentication_schema.js";

class OAuth2Builder {
    _clientID;

    _clientSecret;

    _redirectURL;

    _refreshToken;

    _grantToken;

    _accessToken;

    _id;

    _userSignature;

    _authenticationSchema;

    id(id) {
        if (id != null && typeof id !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.ID;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._id = id;

        return this;
    }

    clientId(clientID) {
        Utility.assertNotNull(clientID, Constants.TOKEN_ERROR, Constants.CLIENT_ID_NULL_ERROR_MESSAGE);

        if (typeof clientID !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.CLIENT_ID_FIELD;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._clientID = clientID;

        return this;
    }

    clientSecret(clientSecret) {
        Utility.assertNotNull(clientSecret, Constants.TOKEN_ERROR, Constants.CLIENT_SECRET_NULL_ERROR_MESSAGE);

        if (typeof clientSecret !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.CLIENT_SECRET_FIELD;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._clientSecret = clientSecret;

        return this;
    }

    redirectURL(redirectURL) {
        if (redirectURL != null && typeof redirectURL !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.REDIRECT_URL_FIELD;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._redirectURL = redirectURL;

        return this;
    }

    refreshToken(refreshToken) {
        if (typeof refreshToken !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.REFRESH_TOKEN;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._refreshToken = refreshToken;

        return this;
    }

    grantToken(grantToken) {
        if (typeof grantToken !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.GRANT_TOKEN;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._grantToken = grantToken;

        return this;
    }

    accessToken(accessToken) {
        if (accessToken != null && typeof accessToken !== Constants.STRING_NAMESPACE.toLowerCase()) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.ACCESS_TOKEN;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }

        this._accessToken = accessToken;

        return this;
    }

    userSignature(userSignature)
    {
        if (userSignature != null && typeof userSignature.getName() !== Constants.STRING_NAMESPACE.toLowerCase())
        {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.USER_SIGNATURE;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.STRING_NAMESPACE;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }
        this._userSignature = userSignature;

        return this;
    }

    authenticationSchema(authenticationSchema)
    {
        if (authenticationSchema != null && !(authenticationSchema instanceof AuthenticationSchema))
        {
            let error = {};
            error[Constants.ERROR_HASH_FIELD] = Constants.AUTHENTICATION_SCHEMA;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Constants.AUTHENTICATIONSCHEMA;

            error[Constants.ERROR_HASH_CLASS] = OAuth2.name;

            throw new SDKException(Constants.TOKEN_ERROR, null, error, null);
        }
        this._authenticationSchema = authenticationSchema;

        return this;
    }


    build() {
        if (this._grantToken == null && this._refreshToken == null && this._id == null && this._accessToken == null && this._userSignature == null && this._authenticationSchema == null)
        {
            throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.OAUTH_MANDATORY_KEYS.join(","));
        }
        if (this._grantToken != null || this._refreshToken != null) {
            if (this._clientID == null && this._clientSecret == null && this._authenticationSchema == null) {
                throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.OAUTH_MANDATORY_KEYS1.join(","))
            }
            else if (this._accessToken != null && this._authenticationSchema == null)
            {
                throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.OAUTH_MANDATORY_KEYS_1);
            }
            else {
                Utility.assertNotNull(this._clientID, Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.CLIENT_ID);

                Utility.assertNotNull(this._clientSecret, Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.CLIENT_SECRET);

                Utility.assertNotNull(this._authenticationSchema, Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + "-" + Constants.AUTHENTICATION_SCHEMA)
            }
        }
        return new OAuth2(this._clientID, this._clientSecret, this._grantToken, this._refreshToken, this._redirectURL, this._id, this._accessToken, this._userSignature, this._authenticationSchema);
    }
}

export  {
    OAuth2Builder as MasterModel,
    OAuth2Builder as OAuth2Builder
}