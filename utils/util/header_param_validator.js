import {Constants} from "./constants.js";
import * as path from "path";
import {DataTypeConverter} from "./datatype_converter.js";
import {JSONConverter} from "./json_converter.js"; // No I18N
import {Initializer} from "../../routes/initializer.js";
import {SDKException}  from "../../routes/exception/sdk_exception.js";
import * as url from "url"; // No I18N
const __dirname = url.fileURLToPath(new URL(".",import.meta.url));



/**
 * This class validates the Header and Parameter values with the type accepted by the Zoho APIs.
 */
class HeaderParamValidator {

    jsonDetails = Initializer.jsonDetails;

    async validate(name, className, value)
    {
        className = await this.getFileName(className).catch(err=> {throw err;});

        if (this.jsonDetails.hasOwnProperty(className))
        {
            let classObject = this.jsonDetails[className];
            for (let key in classObject)
            {
                let memberDetail = classObject[key];

                let keyName = memberDetail[Constants.NAME];

                if (name == keyName)
                {
                    if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME))
                    {
                        if (value instanceof Array)
                        {
                            let jsonArray = [];

                            let requestObjects = value;

                            if (requestObjects.length > 0)
                            {
                                for (let requestObject of requestObjects)
                                {
                                    jsonArray.push(await new JSONConverter(null).formRequest(requestObject, memberDetail[Constants.STRUCTURE_NAME], null, null, null));
                                }
                            }
                            return jsonArray.toString();
                        }
                        return (await new JSONConverter(null).formRequest(value, memberDetail[Constants.STRUCTURE_NAME], null, null, null)).toString();
                    }
                    return (await this.parseData(value, value.constructor.name)).toString();
                }
            }
        }
        return DataTypeConverter.postConvert(value, value.constructor.name);
    }

    async parseData(value, type) {
        if(type.toLowerCase() === Constants.OBJECT_KEY.toLowerCase()) {
            type = Object.prototype.toString.call(value)
        }
        if (type.toLowerCase() == Constants.MAP_NAMESPACE.toLowerCase() || type.toLowerCase() == Constants.MAP_TYPE.toLowerCase()) {
            var jsonObject = {};
            if (Array.from(value.keys()).length > 0) {
                for (let key of value.keys()) {
                    let requestObject = value.get(key);
                    jsonObject[key] = await this.parseData(requestObject, typeof requestObject).catch(err => { throw err; });
                }
            }
            return jsonObject;
        }
        else if (type.toLowerCase() == Constants.LIST_NAMESPACE.toLowerCase() || type.toLowerCase() == Constants.ARRAY_TYPE.toLowerCase()) {
            var jsonArray = [];
            if (value.length > 0) {
                for (let requestObject of value) {
                    jsonArray.push(await this.parseData(requestObject, typeof requestObject).catch(err => { throw err; }));
                }
            }
            return jsonArray;
        }
        else
        {
            return DataTypeConverter.postConvert(value, type);
        }
    }

    async getJSONDetails() {
        let Initializer = (await import("../../routes/initializer.js")).Initializer; // No I18N

        if (Initializer.jsonDetails == null) {
            Initializer.jsonDetails = await Initializer.getJSON(path.join(__dirname, "..", "..", Constants.CONFIG_DIRECTORY, Constants.JSON_DETAILS_FILE_PATH));
        }

        return Initializer.jsonDetails;
    }

    async getFileName(name) {
        let spl = name.toString().split(".");
        let className = await this.getSplitFileName(spl.pop());
        let resourceName = await this.getSplitFileName(spl.pop());
        return "core/" + spl.join("/").toLowerCase() + "/" + resourceName.join("_") + "/" + className.join("_"); //No i18N
    }

    async getSplitFileName(className) {
        let fileName = []
        let nameParts = className.split(/([A-Z][a-z]+)/).filter(function (e) { return e });

        fileName.push(nameParts[0].toLowerCase());

        for (let i = 1; i < nameParts.length; i++) {
            fileName.push(nameParts[i].toLowerCase());
        }

        return fileName;
    }

    async getKeyJSONDetails(name, jsonDetails) {
        let keyArray = Array.from(Object.keys(jsonDetails));
        for (let index = 0; index < keyArray.length; index++) {
            const key = keyArray[index];

            let detail = jsonDetails[key];

            if (detail.hasOwnProperty(Constants.NAME) && detail[Constants.NAME].toLowerCase() == name.toLowerCase()) {
                return detail;
            }
        }
    }
}

export {
    HeaderParamValidator as MasterModel,
    HeaderParamValidator as HeaderParamValidator
}