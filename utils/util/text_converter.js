import {Converter} from "./converter.js";

class TextConverter extends Converter
{
    constructor(commonAPIHandler) {
        super(commonAPIHandler);
    }

    getWrappedRequest(response, pack) {
        return null;
    }

    formRequest(requestObject, pack, instanceNumber, memberDetail, groupType) {
        return null;
    }

    appendToRequest(requestBase, requestObject) {
    }

    async getWrappedResponse(response, contents) {
        let responseEntity = response.body;
        if (responseEntity != null)
        {
            return [await this.getResponse(responseEntity, null, null), null];
        }
        return null;
    }

   async getResponse(response, pack, groupType) {
        return response;
    }
}
export {
    TextConverter as MasterModel,
    TextConverter as TextConverter
}