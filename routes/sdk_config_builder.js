import {SDKConfig} from "./sdk_config.js";

class SDKConfigBuilder {
    _pickListValidation = true;

    _timeout = 0;

    _connectionTimeout = 0;

    _requestTimeout = 0;

    _socketTimeout = 0;

    /**
     * This is a setter method to set pickListValidation.
     * @param {Boolean} pickListValidation A boolean value
     * @returns {SDKConfigBuilder} An instance of SDKConfigBuilder
     */
    pickListValidation(pickListValidation) {
        this._pickListValidation = pickListValidation;

        return this;
    }

    /**
     * This is a setter method to set API timeout.
     * @param {number} timeout
     * @returns {SDKConfigBuilder} An instance of SDKConfigBuilder
     */
    timeout(timeout) {
        this._timeout = timeout > 0 ? timeout : 0;

        return this;
    }

    /**
     * This is a setter method to set connectionTimeout.
     * @param {number} connectionTimeout
     * @returns {SDKConfigBuilder} An instance of SDKConfigBuilder
     */
    connectionTimeout(connectionTimeout)
    {
        this._connectionTimeout = connectionTimeout > 0 ? connectionTimeout : 0;

        return this;
    }

    /**
     * This is a setter method to set requestTimeout.
     * @param {number} requestTimeout
     * @returns {SDKConfigBuilder} An instance of SDKConfigBuilder
     */
    requestTimeout(requestTimeout)
    {
        this._requestTimeout = requestTimeout > 0 ? requestTimeout : 0;

        return this;
    }

    /**
     * This is a setter method to set socketTimeout.
     * @param {number} socketTimeout
     * @returns {SDKConfigBuilder} An instance of SDKConfigBuilder
     */
    socketTimeout(socketTimeout)
    {
        this._socketTimeout = socketTimeout > 0 ? socketTimeout : 0;

        return this;
    }


    /**
     * The method to build the SDKConfig instance
     * @returns {SDKConfig} An instance of SDKConfig
     */
    build() {
        return new SDKConfig(this._pickListValidation, this._timeout, this._connectionTimeout, this._requestTimeout, this._socketTimeout);
    }
}

export {
    SDKConfigBuilder as MasterModel,
    SDKConfigBuilder as SDKConfigBuilder
}