/**
 * The class to configure the SDK.
 */
class SDKConfig {
    pickListValidation;

    _timeout;

    _connectionTimeout = 0;

    _requestTimeout = 0;

    _socketTimeout = 0;

    /**
     * Creates an instance of SDKConfig with the given parameters
     * @param {Boolean} pickListValidation A boolean representing pickListValidation
     * @param {number} timeout A Integer representing timeout
     * @param connectionTimeout A Integer representing connectionTimeout
     * @param requestTimeout A Integer representing requestTimeout
     * @param socketTimeout A Integer representing socketTimeout
     */
    constructor(pickListValidation, timeout, connectionTimeout, requestTimeout, socketTimeout) {

        this.pickListValidation = pickListValidation;

        this._timeout = timeout;

        this._connectionTimeout = connectionTimeout;

        this._requestTimeout = requestTimeout;

        this._socketTimeout = socketTimeout;
    }

    /**
     *  This is a getter method to get pickListValidation.
     * @returns {Boolean} A boolean representing pickListValidation
     */
    getPickListValidation() {
        return this.pickListValidation;
    }

    /**
     *  This is a getter method to get timeout.
     * @returns {number} A Integer representing API timeout
     */
    getTimeout() {
        return this._timeout;
    }

    /**
     * This is a getter method to get connectionTimeout.
     * @return AN int representing connectionTimeout
     */
    getConnectionTimeout()
    {
        return this._connectionTimeout;
    }

    /**
     * This is a getter method to get requestTimeout.
     * @return A int representing requestTimeout
     */
    getRequestTimeout()
    {
        return this._requestTimeout;
    }

    /**
     * This is a getter method to get socketTimeout.
     * @return AN int representing socketTimeout
     */
    getSocketTimeout()
    {
        return this._socketTimeout;
    }
}

export {
    SDKConfig as MasterModel,
    SDKConfig as SDKConfig
}