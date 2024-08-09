import {Converter} from "./converter.js";

class XMLConverter extends Converter{
    constructor(commonAPIHandler) {
        super(commonAPIHandler);
    }

    getWrappedResponse(response, contents) {
        return null;
    }

    getWrappedRequest(response, pack)
    {
        return null;
    }

    getResponse(response, pack, groupType) {
        return null;
    }

    appendToRequest(requestBase, requestObject) {
    }

    formRequest(requestObject, pack, instanceNumber, memberDetail, groupType) {
        return null;
    }

}
export {
    XMLConverter as MasterModel,
    XMLConverter as XMLConverter
}