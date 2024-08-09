import {SDKException} from "./exception/sdk_exception.js";
import {Constants} from "../utils/util/constants.js";
import {Environment} from "../core/com/zoho/officeintegrator/dc/environment.js";
import {TokenStore} from "../models/authenticator/store/token_store.js";
import {RequestProxy} from "./request_proxy.js";
import {Token} from "../models/authenticator/token.js";
import {Initializer} from "./initializer.js";
import {Utility} from "../utils/util/utility.js";
import {SDKConfigBuilder} from "./sdk_config_builder.js";
import {FileStore} from "../models/authenticator/store/file_store.js";
import * as path from "path";
import {SDKConfig} from "./sdk_config.js";
import {Logger, Levels} from "./logger/logger.js";
import url from "url";
import {LogBuilder} from "./logger/log_builder.js";
import { OAuth2 } from "../models/authenticator/oauth2.js"; // No I18N
const __dirname = url.fileURLToPath(new URL(".",import.meta.url));


class InitializeBuilder {
    _environment;

    _store;

    _tokens;

    _requestProxy;

    _sdkConfig;

    _logger;

    errorMessage;

    initializer;

    constructor() {
        return (async () => {
            this.initializer = await Initializer.getInitializer();

            this.errorMessage = (await this.initializer != null) ? Constants.SWITCH_USER_ERROR : Constants.INITIALIZATION_ERROR;

            if (this.initializer != null) {
                this._environment = await this.initializer.getEnvironment();

                this._tokens = await this.initializer.getTokens();

                this._sdkConfig = await this.initializer.getSDKConfig();
            }
            return this;
        })();
    }

    async initialize() {
        Utility.assertNotNull(this._environment, this.errorMessage, Constants.ENVIRONMENT_ERROR_MESSAGE);

        Utility.assertNotNull(this._tokens, this.errorMessage, Constants.TOKEN_ERROR_MESSAGE);

        if(this._store == null) {
            let is_create = false;
            for(let tokenInstance of this._tokens) {
                if (tokenInstance instanceof OAuth2) {
                    is_create = true;
                    break;
                }
            }
            if(is_create) {
                this._store = new FileStore(path.join(__dirname, "../../../../", Constants.TOKEN_FILE));
            }
        }

        if(this._sdkConfig == null) {
            this._sdkConfig = new SDKConfigBuilder().build();
        }

        if(this._logger == null) {
            this._logger = new LogBuilder().level(Levels.OFF).filePath(null).build();
        }

        await Initializer.initialize(this._environment, this._tokens, this._store, this._sdkConfig, this._logger, this._requestProxy).catch(err => { throw err; });
    }

    async switchUser() {
        Utility.assertNotNull(Initializer.getInitializer(), Constants.SDK_UNINITIALIZATION_ERROR, Constants.SDK_UNINITIALIZATION_MESSAGE);

        await Initializer.switchUser(this._environment, this._tokens, this._sdkConfig, this._requestProxy);
    }

    logger(logger) {
        if (logger != null && !(logger instanceof Logger)) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.LOGGER;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Logger.name;

            throw new SDKException(Constants.INITIALIZATION_ERROR, Constants.INITIALIZATION_EXCEPTION, error);
        }

        this._logger = logger;

        return this;
    }

    tokens(tokens) {
        Utility.assertNotNull(tokens, this.errorMessage, Constants.TOKEN_ERROR_MESSAGE);

        tokens.forEach(token=>
        {
            if (!(token instanceof Token)) {
                let error = {};

                error[Constants.ERROR_HASH_FIELD] = Constants.TOKEN;

                error[Constants.ERROR_HASH_EXPECTED_TYPE] = Token.name;

                throw new SDKException(Constants.INITIALIZATION_ERROR, Constants.INITIALIZATION_EXCEPTION, error);
            }
        });

        this._tokens = tokens;

        return this;
    }

    SDKConfig(sdkConfig) {
        if (sdkConfig != null && !(sdkConfig instanceof SDKConfig)) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.SDK_CONFIG;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = SDKConfig.name;

            throw new SDKException(Constants.INITIALIZATION_ERROR, Constants.INITIALIZATION_EXCEPTION, error);
        }

        this._sdkConfig = sdkConfig;

        return this;
    }

    requestProxy(requestProxy) {
        if (requestProxy != null && !(requestProxy instanceof RequestProxy)) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.REQUEST_PROXY;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = RequestProxy.name;

            throw new SDKException(Constants.INITIALIZATION_ERROR, Constants.INITIALIZATION_EXCEPTION, error);
        }

        this._requestProxy = requestProxy;

        return this;
    }

    store(store) {
        if (store != null && !(store instanceof TokenStore)) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.STORE;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = TokenStore.name;

            throw new SDKException(Constants.INITIALIZATION_ERROR, Constants.INITIALIZATION_EXCEPTION, error);
        }

        this._store = store;

        return this;
    }

    environment(environment) {
        Utility.assertNotNull(environment, this.errorMessage, Constants.ENVIRONMENT_ERROR_MESSAGE);

        if (!(environment instanceof Environment)) {
            let error = {};

            error[Constants.ERROR_HASH_FIELD] = Constants.ENVIRONMENT;

            error[Constants.ERROR_HASH_EXPECTED_TYPE] = Environment.name;

            throw new SDKException(Constants.INITIALIZATION_ERROR, Constants.INITIALIZATION_EXCEPTION, error);
        }

        this._environment = environment;

        return this;
    }
}

export {
    InitializeBuilder as MasterModel,
    InitializeBuilder as InitializeBuilder
}