import {Converter} from "./converter.js";
import {Constants} from "./constants.js";
import {StreamWrapper} from "./stream_wrapper.js";

/**
 * This class is to process the download file and stream response.
 * @extends Converter
 */
class Downloader extends Converter {
    uniqueValuesMap = [];

    constructor(commonApiHandler) {
        super(commonApiHandler);
    }

    getWrappedRequest(response, pack)
    {
        return null;
    }

    appendToRequest(requestBase, requestObject)
    {}

    formRequest(requestObject, pack, instanceNumber, memberDetail, groupType) {
        return null;
    }

    async getWrappedResponse(response, contents) {

        const Initializer = (await import("../../routes/initializer.js")).Initializer;

        if (contents.length >= 1)
        {
            let pack = contents[0];

            if(pack.hasOwnProperty(Constants.INTERFACE) && pack[Constants.INTERFACE])    
            {
                return [await this.getResponse(response, pack[Constants.CLASSES][0], pack[Constants.GROUP_TYPE])];
            }
            else
            {
                let className = pack[Constants.CLASSES][0];
                if (className.toString().includes(Constants.FILE_BODY_WRAPPER))
                {
                    return [await this.getResponse(response, className, null)];
                }
                return [await this.getStreamInstance(response, className)];
            }

        }
        return null;
    }

    async getResponse(response, pack, groupType) {

        const Initializer = (await import("../../routes/initializer.js")).Initializer; // No I18N

        var recordJsonDetails = Initializer.jsonDetails[pack];
        var instance = null;
        if (recordJsonDetails.hasOwnProperty(Constants.INTERFACE) && recordJsonDetails[Constants.INTERFACE] && groupType != null) 
        {
            let groupType1 = recordJsonDetails[groupType];
            if(groupType1 != null)
            {
                let classes = groupType1[Constants.CLASSES];
                for(let index = 0; index < classes.length; index++)
                {
                    let className = classes[index];
                    if (className.toString().includes(Constants.FILE_BODY_WRAPPER))
                    {
                        return this.getResponse(response, className, null);
                    }   
                }   
            }
            return instance;
        }
        else {
            let ClassName = (await import("../../"+pack+".js")).MasterModel;
            instance = new ClassName();
            for (let memberName in recordJsonDetails) {
                var memberJsonDetails = recordJsonDetails[memberName];
                var type = memberJsonDetails[Constants.TYPE];
                let instanceValue = null;
                if (type === Constants.STREAM_WRAPPER_CLASS_PATH) {
                    var fileName = "";
                    let contentDisposition = (response.headers[Constants.CONTENT_DISPOSITION]).toString();
                    if (contentDisposition.includes("'")) {
                        let start_index = contentDisposition.lastIndexOf("'");
                        fileName = contentDisposition.substring(start_index + 1);
                    }
                    else if (contentDisposition.includes("\"")) {
                        let start_index = contentDisposition.lastIndexOf("=");
                        fileName = contentDisposition.substring(start_index + 1).replace(/"/g, "");
                    }
                    instanceValue = new StreamWrapper(fileName, response.rawBody, null);
                }
                Reflect.set(instance, memberName, instanceValue);
            }
            return instance;
        }
    }


    async getStreamInstance(response, type)
    {
        let contentDispositionHeader = (response.headers[Constants.CONTENT_DISPOSITION]).toString();

        var fileName = "";

        var instance = null;

        var instanceValue = null;

        var className = (await import("../../".concat(type).concat(".js"))).MasterModel;

        if (contentDispositionHeader.includes("'")) {
            let start_index = contentDispositionHeader.lastIndexOf("'");

            fileName = contentDispositionHeader.substring(start_index + 1);
        }
        else if (contentDispositionHeader.includes("\"")) {
            let start_index = contentDispositionHeader.lastIndexOf("=");

            fileName = contentDispositionHeader.substring(start_index + 1).replace(/"/g, "");
        }
        instance = new className(fileName, response.rawBody, null);
        
        return instance;

    }
}

export {
    Downloader as MasterModel,
    Downloader as Downloader
}