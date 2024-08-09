import {SDKException} from "../../routes/exception/sdk_exception.js";

/**
 * This class handles module field details.
 */
class Utility {

    static assertNotNull(value, errorCode, errorMessage) {
        if (value == null) {
            throw new SDKException(errorCode, errorMessage);
        }
    }

    static async getJSONObject(json, key) {
        let keyArray = Array.from(Object.keys(json));

        for (let keyInJSON of keyArray) {
            if (key.toLowerCase() == keyInJSON.toLowerCase()) {
                return json[keyInJSON];
            }
        }

        return null;
    }

    static checkInteger(value) {
        return (parseInt(value) === value);
    }
}

export {
    Utility as MasterModel,
    Utility as Utility
}
