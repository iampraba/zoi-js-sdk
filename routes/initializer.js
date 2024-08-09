import {SDKException} from "./exception/sdk_exception.js";
import {Constants} from "../utils/util/constants.js";
import {SDKLogger} from "./logger/sdk_logger.js";
import * as path from "path";
import {OAuth2} from "../models/authenticator/oauth2.js";
import {Environment} from "../core/com/zoho/officeintegrator/dc/environment.js";
import {Token} from "../models/authenticator/token.js";
import {TokenStore} from "../models/authenticator/store/token_store.js";
import pkg from "winston";
let Logger1 = pkg;
import {RequestProxy} from "./request_proxy.js";
import {Logger} from "./logger/logger.js"
import {SDKConfig} from "./sdk_config.js";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".",import.meta.url));
import * as fs from "fs";

/**
 * The class to initialize Zoho SDK.
 */
class Initializer {
	static initializer;

	_environment;

	_store;

	_tokens;

	static jsonDetails;

	_requestProxy;

	_sdkConfig;

	/**
	 * The method is to initialize the SDK.
	 * @param {Environment} environment - A Environment class instance containing the Zoho API base URL and Accounts URL.
	 * @param {Array} tokens - A Token class instance containing the OAuth client application information.
	 * @param {TokenStore} store - A TokenStore class instance containing the token store information.
	 * @param {SDKConfig} sdkConfig - A SDKConfig class instance containing the configuration.
	 * @param {Logger} logger - A Logger class instance containing the log file path and Logger type.
	 * @param {RequestProxy} proxy - A RequestProxy class instance containing the proxy properties of the user.
	 * @throws {SDKException}
	 */
	static async initialize(environment, tokens, store, sdkConfig, logger = null, proxy = null) {
		try {
			SDKLogger.initialize(logger);

			try {
				if (Initializer.jsonDetails == null) {
					Initializer.jsonDetails = Initializer.getJSON(path.join(__dirname, "..", Constants.CONFIG_DIRECTORY, Constants.JSON_DETAILS_FILE_PATH));
				}
			}
			catch (ex) {
				throw new SDKException(Constants.JSON_DETAILS_ERROR, null, null, ex);
			}

			let initializer = new Initializer();

			initializer._environment = environment;

			initializer._tokens = tokens;

			initializer._store = store;

			initializer._sdkConfig = sdkConfig;

			initializer._requestProxy = proxy;

			Initializer.initializer = initializer;

			Logger1.info(Constants.INITIALIZATION_SUCCESSFUL.concat(Initializer.initializer.toString()));

		} catch (err) {
			if (!(err instanceof SDKException)) {
				err = new SDKException(Constants.INITIALIZATION_EXCEPTION, null, null, err);
			}

			throw err;
		}
	}

	/**
	 * This method to get record field and class details.
	 * @param filePath A String containing the file path.
	 * @returns A JSON representing the class information details.
	 */
	static getJSON(filePath) {

		let fileData = fs.readFileSync(filePath);

		return JSON.parse(fileData);
	}

	/**
	 * This method is to get Initializer class instance.
	 * @returns A Initializer class instance representing the SDK configuration details.
	 */
	static async getInitializer() {
		return Initializer.initializer;
	}

	/**
	 * This method is to switch the different user in SDK environment.
	 * @param {Environment} environment - A Environment class instance containing the Zoho API base URL and Accounts URL.
	 * @param {Array} tokens - A Token class instance containing the OAuth client application information.
	 * @param {SDKConfig} sdkConfig - A SDKConfig instance representing the configuration
	 * @param {RequestProxy} proxy - A RequestProxy class instance containing the proxy properties.
	 */
	static async switchUser(environment, tokens, sdkConfig, proxy = null) {
		let initializer = new Initializer();

		initializer._environment = environment;

		initializer._tokens = tokens;

		initializer._store = Initializer.initializer.getStore();

		initializer._sdkConfig = sdkConfig;

		initializer._requestProxy = proxy;

		Initializer.initializer = initializer;

		Logger1.info(Constants.INITIALIZATION_SWITCHED.concat(Initializer.initializer.toString()))
	}

	/**
	 * This is a getter method to get API environment.
	 * @returns A Environment representing the API environment.
	 */
	getEnvironment() {
		return this._environment;
	}

	/**
	 * This is a getter method to get Token Store.
	 * @returns A TokenStore class instance containing the token store information.
	 */
	getStore() {
		return this._store;
	}

	/**
	 * This is a getter method to get Proxy information.
	 * @returns {RequestProxy} A RequestProxy class instance representing the API Proxy information.
	 */
	getRequestProxy() {
		return this._requestProxy;
	}

	/**
	 * This is a getter method to get OAuth client application information.
	 * @returns An Array of  class instances representing the OAuth client application information.
	 */
	getTokens() {
		return this._tokens;
	}

	/**
	 * This is a getter method to get the SDK Configuration
	 * @returns {SDKConfig} A SDKConfig instance representing the configuration
	 */
	getSDKConfig() {
		return this._sdkConfig;
	}

	async toString() {
		return Constants.IN_ENVIRONMENT.concat((await Initializer.initializer)._environment.getUrl()).concat(".");
	}

	toUTF8Array(str) {
		var utf8 = [];

		for (var i = 0; i < str.length; i++) {
			var charcode = str.charCodeAt(i);

			if (charcode < 0x80) utf8.push(charcode);
			else if (charcode < 0x800) {
				utf8.push(0xc0 | (charcode >> 6),
					0x80 | (charcode & 0x3f));
			}
			else if (charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(0xe0 | (charcode >> 12),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
			else {
				i++;
				// UTF-16 encodes 0x10000-0x10FFFF by
				// subtracting 0x10000 and splitting the
				// 20 bits of 0x0-0xFFFFF into two halves
				charcode = 0x10000 + (((charcode & 0x3ff) << 10)
					| (str.charCodeAt(i) & 0x3ff));

				utf8.push(0xf0 | (charcode >> 18),
					0x80 | ((charcode >> 12) & 0x3f),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
		}
		return utf8;
	}
}

export  {
	Initializer as MasterModel,
	Initializer as Initializer
}