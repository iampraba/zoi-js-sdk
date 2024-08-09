import {Converter} from "./converter.js";
import formData  from "form-data";
import {StreamWrapper} from "./stream_wrapper.js";
import {Constants} from "./constants.js";
import {Initializer} from "../../routes/initializer.js";
import {SDKException} from "../../routes/exception/sdk_exception.js";
import {DataTypeConverter} from "./datatype_converter.js";

/**
 * This class is to process the upload file and stream.
 * @extends {Converter}
 */
class FormDataConverter extends Converter {
    uniqueValuesMap = new Map();

    constructor(commonApiHandler) {
        super(commonApiHandler);
    }

    async appendToRequest(requestBase, requestObject) {
        var formDataRequestBody = new formData();

        await this.addFileBody(requestBase.getRequestBody(), formDataRequestBody).catch(err => {
            throw err;
        });

        return formDataRequestBody;
    }

    async addFileBody(requestObject, formData) {
        let requestKeys = Object.keys(requestObject);

        for (let key of requestKeys) {
            let value = requestObject[key];

            if (Array.isArray(value)) {
                for (let fileObject of value) {
                    if (fileObject instanceof StreamWrapper) {
                        formData.append(key, fileObject.getStream());
                    } else {
                        formData.append(key, fileObject);
                    }
                }
            } else if (value instanceof StreamWrapper) {
                formData.append(key, value.getStream());
            } else if (value != null && await this.isObject(value)) {
                if (value[Object.keys(value)[0]] instanceof StreamWrapper) {
                    await this.addFileBody(value, formData);
                } else {
                    formData.append(key, await this.isObject(value) ? this.toJson(value) : value);
                }
            } else {
                formData.append(key, await this.isObject(value) ? this.toJson(value) : value);
            }
        }
    }

    async isObject(val) {
        if (val === null) {
            return false;
        }
        return ((typeof val === 'function') || (typeof val === 'object'));
    }

    async getWrappedRequest(requestInstance, pack) {
        var classes = pack[Constants.CLASSES];
        for (let class1 of classes)
        {
            let groupType = pack[Constants.GROUP_TYPE];
            return await this.formRequest(requestInstance, class1 , null, null, groupType).catch(err => {
                throw err;
            });
        }
    }

    async formRequest(requestInstance, pack, instanceNumber, classMemberDetail, groupType) {
        var request = {};

        if (!Initializer.jsonDetails.hasOwnProperty(pack)) {
            return request;
        }
        var classDetail = Initializer.jsonDetails[pack];

        for (let memberName in classDetail) {
            var modification = null;

            var memberDetail = classDetail[memberName];

            let found = false;

            if (memberDetail.hasOwnProperty(Constants.REQUEST_SUPPORTED) || !memberDetail.hasOwnProperty(Constants.NAME)) {
                let requestSupported = memberDetail[Constants.REQUEST_SUPPORTED];
                for (let i = 0; i < requestSupported.length; i++) {
                    if (requestSupported[i] == this.commonAPIHandler.getCategoryMethod().toLowerCase()) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                continue;
            }

            try {
                modification = requestInstance.isKeyModified(memberDetail[Constants.NAME]);
            } catch (e) {
                throw new SDKException(Constants.EXCEPTION_IS_KEY_MODIFIED, null, null, e);
            }

            // check required
            if ((modification == null || modification == 0) && memberDetail.hasOwnProperty(Constants.REQUIRED) && memberDetail[Constants.REQUIRED] == 'true') {
                throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR + memberName);
            }

            var fieldValue = Reflect.get(requestInstance, memberName);

            if (modification != null && modification != 0 && await this.valueChecker(requestInstance.constructor.name, memberName, memberDetail, fieldValue, this.uniqueValuesMap, instanceNumber)) {
                var keyName = memberDetail[Constants.NAME];

                var type = memberDetail[Constants.TYPE];

                let memberGroupType = memberDetail.hasOwnProperty(Constants.GROUP_TYPE) ? memberDetail[Constants.GROUP_TYPE] : null;

                if (type.toLowerCase() == Constants.LIST_NAMESPACE.toLowerCase()) {
                    request[keyName] = await this.setJSONArray(fieldValue, memberDetail, memberGroupType).catch(err => {
                        throw err;
                    });
                } else if (type.toLowerCase() == Constants.MAP_NAMESPACE.toLowerCase()) {
                    request[keyName] = await this.setJSONObject(fieldValue, memberDetail).catch(err => {
                        throw err;
                    });
                } else if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
                    request[keyName] = await this.formRequest(fieldValue, memberDetail[Constants.STRUCTURE_NAME], 0, memberDetail, memberGroupType).catch(err => {
                        throw err;
                    });
                } else {
                    request[keyName] = fieldValue;
                }
            }
        }

        return request;
    }

    async isNotRecordRequest(requestInstance, classDetail, instanceNumber, classMemberDetail) {
        var lookUp = false;

        var skipMandatory = false;

        var classMemberName = null;

        if (classMemberDetail != null) {
            lookUp = (classMemberDetail.hasOwnProperty(Constants.LOOKUP) ? classMemberDetail[Constants.LOOKUP] : false);

            classMemberName = this.buildName(classMemberDetail[Constants.NAME]);
        }

        var requestJSON = {};

        var requiredKeys = new Map();

        for (let memberName in classDetail) {
            var modification = null;

            var memberDetail = classDetail[memberName];

            let found = false;

            if (memberDetail.hasOwnProperty(Constants.REQUEST_SUPPORTED) || !memberDetail.hasOwnProperty(Constants.NAME)) {
                let requestSupported = memberDetail[Constants.REQUEST_SUPPORTED];

                for (let i = 0; i < requestSupported.length; i++) {
                    if (requestSupported[i] == this.commonAPIHandler.getCategoryMethod().toLowerCase()) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                continue;
            }

            var keyName = memberDetail[Constants.NAME];

            try {
                modification = requestInstance.isKeyModified(keyName);
            } catch (ex) {
                throw new SDKException(Constants.EXCEPTION_IS_KEY_MODIFIED, null, null, ex);
            }
            if (memberDetail.hasOwnProperty(Constants.REQUIRED_FOR) && (memberDetail[Constants.REQUIRED_FOR] == Constants.ALL || memberDetail[Constants.REQUIRED_FOR] == Constants.REQUEST)) {
                requiredKeys.set(keyName, true);
            }

            var fieldValue = null;

            if (modification != null && modification != 0) {
                fieldValue = Reflect.get(requestInstance, memberName);
                if (fieldValue != null) {

                    if (await this.valueChecker(requestInstance.constructor.name, memberName, memberDetail, fieldValue, this.uniqueValuesMap, instanceNumber).catch(err => {throw err;})) {
                        if (requiredKeys.has(keyName)){
                            requiredKeys.delete(keyName);
                        }
                    }

                    requestJSON[keyName] = await this.setData(memberDetail, fieldValue)
                }
            }
        }

        if (!skipMandatory) {
            this.checkException(classMemberName, requestInstance, instanceNumber, requiredKeys);
        }
        return requestJSON;
    }

    checkException(memberName, requestInstance, instanceNumber, requiredKeys) {
        if (requiredKeys.size > 0 && this.commonAPIHandler && this.commonAPIHandler.getCategoryMethod() != null && this.commonAPIHandler.getCategoryMethod().toUpperCase() == Constants.REQUEST_CATEGORY_UPDATE) {
            let error = {};
            error.field = memberName;
            error.type = requestInstance.constructor.name;
            error.keys = Array.from(requiredKeys.keys()).toString();

            if (instanceNumber != null) {
                error.instance_number = instanceNumber;
            }

            throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR, error, null);
        }
    }

    async setData(memberDetail, fieldValue) {
        if (fieldValue != null) {
            let groupType = memberDetail.hasOwnProperty(Constants.GROUP_TYPE) ? memberDetail[Constants.GROUP_TYPE] : null;

            let type = memberDetail[Constants.TYPE].toString();

            if (type.toLowerCase() == Constants.LIST_NAMESPACE.toLowerCase()) {
                return await this.setJSONArray(fieldValue, memberDetail, groupType).catch(err => {
                    throw err;
                });
            } else if (type.toLowerCase() == Constants.MAP_NAMESPACE.toLowerCase()) {
                return await this.setJSONObject(fieldValue, memberDetail).catch(err => {
                    throw err;
                });
            } else if (type == Constants.CHOICE_NAMESPACE || (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME) && memberDetail[Constants.STRUCTURE_NAME] == Constants.CHOICE_NAMESPACE)) {
                return fieldValue.getValue();
            } else if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
                return await this.isNotRecordRequest(fieldValue, Initializer.jsonDetails[Constants.STRUCTURE_NAME], null, memberDetail).catch(err => {
                    throw err;
                });
            } else {
                return DataTypeConverter.postConvert(fieldValue, type);
            }
        }

        return null;
    }

    getFileName(name) {
        let fileName = [];

        let nameParts = name.split(/([A-Z][a-z]+)/).filter(function (e) {
            return e
        });

        fileName.push(nameParts[0].toLowerCase());

        for (let i = 1; i < nameParts.length; i++) {
            fileName.push(nameParts[i].toLowerCase());
        }

        return fileName.join("_");
    }

    async setJSONObject(fieldValue, memberDetail) {
        let jsonObject = {};

        let requestObject = fieldValue;

        if (Array.from(requestObject.keys()).length > 0) {
            if (memberDetail == null) {
                for (let key of Array.from(requestObject.keys())) {
                    jsonObject[key] = await this.redirectorForObjectToJSON(requestObject.get(key)).catch(err => {
                        throw err;
                    });
                }
            } else {

                if (memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS)) {
                    let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
                    if (extraDetails != null && extraDetails.length > 0) {
                        let members = await this.getValidStructure(extraDetails, Array.from(requestObject.keys())).catch(err => {
                            throw err;
                        });
                        return this.isNotRecordRequest(fieldValue, members, null, null).catch(err => {
                            throw err;
                        });
                    }
                } else {
                    for (let key of Array.from(requestObject.keys())) {
                        jsonObject[key.toString()] = await this.redirectorForObjectToJSON(requestObject.get(key)).catch(err => {
                            throw err;
                        });
                    }
                }
            }
        }
        return jsonObject;
    }

    async areArraysEqual(arr1, arr2){
        if (arr1.length !== arr2.length) {
            return false;
        }
        const sortedArr1 = arr1.slice().sort();
        const sortedArr2 = arr2.slice().sort();
        for (let i = 0; i < sortedArr1.length; i++) {
            if (sortedArr1[i] !== sortedArr2[i]) {
                return false;
            }
        }
        return true;
    }

    async getValidStructure(extraDetails, keys) {
        for (let key in extraDetails)
        {
            let extraDetail = extraDetails[key];

            if (!extraDetail.hasOwnProperty(Constants.MEMBERS))
            {
                let members = Initializer.jsonDetails[extraDetail[Constants.TYPE]];
                if (await this.areArraysEqual(keys, members.keys))
                {
                    return members;
                }
            }
            else
            {
                if (extraDetail.hasOwnProperty(Constants.MEMBERS))
                {
                    let members  = extraDetail[Constants.MEMBERS];
                    if (await this.areArraysEqual(keys, members.keys))
                    {
                        return members;
                    }
                }
            }
        }
        return null;
    }

    async setJSONArray(fieldValue, memberDetail, groupType) {
        var jsonArray = [];

        var requestObjects = fieldValue;

        if (memberDetail == null) {
            for (let request of requestObjects) {
                jsonArray.push(await this.redirectorForObjectToJSON(request).catch(err => {
                    throw err;
                }));
            }
        } else {
            if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
                let instanceCount = 0;

                let pack = memberDetail[Constants.STRUCTURE_NAME];

                for (let request of requestObjects) {
                    jsonArray.push(await this.isNotRecordRequest(request, Initializer.jsonDetails[pack], instanceCount++, memberDetail).catch(err => {
                        throw err;
                    }));
                }
            } else {
                for (let request of requestObjects) {
                    jsonArray.push(await this.redirectorForObjectToJSON(request).catch(err => {
                        throw err;
                    }));
                }
            }
        }

        return jsonArray;
    }

    async redirectorForObjectToJSON(request) {
        let type = Object.prototype.toString.call(request)

        if (type == Constants.ARRAY_TYPE) {
            return await this.setJSONArray(request, null).catch(err => {
                throw err;
            });
        } else if (type == Constants.MAP_TYPE) {
            return await this.setJSONObject(request, null).catch(err => {
                throw err;
            });
        } else {
            return request;
        }
    }

    async getWrappedResponse(response, contents) {
        let pack;
        if (contents.length == 1) {
            pack = contents[0];
            if (pack.hasOwnProperty(Constants.GROUP_TYPE)) {
                let data = await this.findMatchAndParseResponseClass(contents, response);
                if (data != null) {
                    let pack = data[0];
                    let groupType = pack[Constants.GROUP_TYPE];
                    let responseData = data[1];
                    return [await this.getResponse(responseData, await this.findMatchClass(pack[Constants.CLASSES], responseData), groupType)];
                }
            } else {
                return [await this.getStreamInstance(response, pack[Constants.CLASSES][0])];
            }
        }
        return null;
    }

    async getResponse(response, packageName, groupType) {

        let classDetail = Initializer.jsonDetails[packageName];
        let instance = null;
        let responseJSON = await this.getJSONResponse(response);
        if (responseJSON != null && groupType != null) {
            if (response instanceof Map) {
                if (classDetail.hasOwnProperty(Constants.INTERFACE) && classDetail[Constants.INTERFACE]) {
                    let classDetail1 = Initializer.jsonDetails[packageName];
                    let groupType1 = classDetail1[groupType];
                    if (groupType1 != null) {
                        let classes = groupType1[Constants.CLASSES];
                        let className = await this.findMatchClass(classes, response);
                        let instanceHolder = (await import("../../" + className + ".js")).MasterModel;
                        instance = new instanceHolder();
                        await this.getMapResponse(instance, response, classDetail);
                    }
                } else {
                    let instanceHolder = (await import("../../" + packageName + ".js")).MasterModel;
                    instance = new instanceHolder();
                    await this.getMapResponse(instance, response, classDetail);
                }
            } else {
                if (classDetail.hasOwnProperty(Constants.INTERFACE) && classDetail[Constants.INTERFACE]) {
                    let classDetail1 = Initializer.jsonDetails[packageName];
                    let groupType1 = classDetail1[groupType];
                    if (groupType1 != null) {
                        let classes = groupType1[Constants.CLASSES];
                        instance = await this.findMatch(classes, responseJSON, groupType);
                    }
                } else {
                    let instanceHolder = (await import("../../" + packageName + ".js")).MasterModel;
                    instance = new instanceHolder();
                    await this.notRecordResponse(instance, responseJSON, classDetail);
                }
            }
        }
        return instance;
    }

    async getMapResponse(instance, response, classDetail) {
        for (let memberName in classDetail) {
            let keyDetail = classDetail[memberName];
            let keyName = keyDetail.hasOwnProperty(Constants.NAME) ? keyDetail[Constants.NAME] : null;
            if (keyName != null && response.has(keyName) && response.get(keyName) != null) {
                let keyData = response.get(keyName);
                let memberValue = await this.getData(keyData, keyDetail);
                Reflect.set(instance, memberName, memberValue);
            }
        }
    }

    async notRecordResponse(instance, responseJSON, classDetail) {
        for (let memberName in classDetail) {
            let keyDetail = classDetail[memberName];
            let keyName = keyDetail.hasOwnProperty(Constants.NAME) ? keyDetail[Constants.NAME] : null;// api-name of the member
            if (keyName != null && responseJSON.hasOwnProperty(keyName) && responseJSON[keyName] !== null) {
                let keyData = responseJSON[keyName];
                let memberValue = await this.getData(keyData, keyDetail).catch(err => { throw err; });
                Reflect.set(instance, memberName, memberValue);
            }
        }
        return instance;
    }

    async getData(keyData, memberDetail)
    {
        let memberValue = null;

        if (keyData != null) {

            let groupType = memberDetail.hasOwnProperty(Constants.GROUP_TYPE) ? memberDetail[Constants.GROUP_TYPE] : null;

            let type = memberDetail[Constants.TYPE].toString();

            if (type.toLowerCase() == Constants.LIST_NAMESPACE.toLowerCase()) {
                memberValue = await this.getCollectionsData(keyData, memberDetail, groupType).catch(err => { throw err; });
            }
            else if (type.toLowerCase() == Constants.MAP_NAMESPACE.toLowerCase()) {
                memberValue = await this.getMapData(keyData, memberDetail).catch(err => { throw err; });
            }
            else if (type == Constants.CHOICE_NAMESPACE || (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME) && memberDetail[Constants.STRUCTURE_NAME] == Constants.CHOICE_NAMESPACE)) {
                let Choice = (await import(Constants.CHOICE_PATH + ".js")).MasterModel // No I18N

                memberValue = new Choice(keyData);
            }
            else if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
                memberValue = await this.getResponse(keyData, memberDetail[Constants.STRUCTURE_NAME], groupType).catch(err => { throw err; });
            }
            else {
                memberValue = await DataTypeConverter.preConvert(keyData, type);
            }
        }

        return memberValue;
    }

    async getCollectionsData(responses, memberDetail, groupType) {
        var values = [];

        if (responses.length > 0) {
            if (memberDetail == null)
            {
                for (let response of responses) {
                    values.push(await this.redirectorForJSONToObject(response).catch(err => {
                        throw err;
                    }));
                }
            }
            else
            {
                let specType = memberDetail[Constants.SPEC_TYPE];
                if (groupType != null) {
                    if (specType == Constants.TARRAY_TYPE)
                    {
                        return await this.getTArrayResponse(memberDetail, groupType, responses).catch(err => {throw err;});
                    }
                    else
                    {
                        let orderedStructures = null;
                        if (memberDetail.hasOwnProperty(Constants.ORDERED_STRUCTURES)) {
                            orderedStructures = memberDetail[Constants.ORDERED_STRUCTURES];
                            if (Object.keys(orderedStructures).length > responses.length) {
                                return values;
                            }
                            for (let index in orderedStructures)
                            {
                                let orderedStructure = orderedStructures[index];
                                if (!orderedStructure.hasOwnProperty(Constants.MEMBERS)) {
                                    values.push(await this.getResponse(responses[parseInt(index)], orderedStructure[Constants.STRUCTURE_NAME], groupType));
                                } else {
                                    if (orderedStructure.hasOwnProperty(Constants.MEMBERS)) {
                                        values.push(await this.getMapData(responses[parseInt(index)], orderedStructure[Constants.MEMBERS]));
                                    }
                                }
                            }
                        }
                        if (groupType == Constants.ARRAY_OF && memberDetail.hasOwnProperty(Constants.INTERFACE) && memberDetail[Constants.INTERFACE]) {
                            let interfaceName = memberDetail[Constants.STRUCTURE_NAME];
                            let classDetail = await Initializer.jsonDetails[interfaceName];
                            let groupType1 = classDetail[Constants.ARRAY_OF];
                            if (groupType1 != null) {
                                let classes = groupType1[Constants.CLASSES];
                                if (orderedStructures != null) {
                                    classes = await this.validateInterfaceClass(orderedStructures, groupType1[Constants.CLASSES]);
                                }
                                values.push((await this.getArrayOfResponse(responses, classes, groupType))[0]);
                            }
                        } else if (groupType == Constants.ARRAY_OF && memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS)) {
                            let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
                            if (orderedStructures != null) {
                                extraDetails = await this.validateStructure(orderedStructures, extraDetails);
                            }
                            let i = 0;
                            for (let responseObject of responses)
                            {
                                if (i == extraDetails.length) {
                                    i = 0;
                                }
                                let extraDetail = extraDetails[i];
                                if (!extraDetails[i].hasOwnProperty(Constants.MEMBERS)) {
                                    values.push(await this.getResponse(responseObject, extraDetail[Constants.STRUCTURE_NAME], groupType).catch(err => {throw err;}));
                                } else {
                                    if (extraDetail.hasOwnProperty(Constants.MEMBERS)) {
                                        values.push(await this.getMapData(responseObject, extraDetail[Constants.MEMBERS]).catch(err => {throw err;}));
                                    }
                                }
                                i++;
                            }
                        } else {
                            if (memberDetail.hasOwnProperty(Constants.INTERFACE) && memberDetail[Constants.INTERFACE]) {
                                if (orderedStructures != null) {
                                    let interfaceName = memberDetail[Constants.STRUCTURE_NAME];
                                    let classDetail = await Initializer.jsonDetails[interfaceName];
                                    let groupType1 = classDetail[Constants.ARRAY_OF];
                                    if (groupType1 != null) {
                                        let classes = await this.validateInterfaceClass(orderedStructures, groupType1[Constants.CLASSES]).catch(err => {throw err;});
                                        for (let response of responses)
                                        {
                                            let packName = await this.findMatchClass(classes, response).catch(err => {throw err;});
                                            values.push(await this.getResponse(response, packName, groupType).catch(err => {throw err;}));
                                        }
                                    }
                                }
                                else
                                {
                                    for (let response of responses)
                                    {
                                        values.push(await this.getResponse(response, memberDetail[Constants.STRUCTURE_NAME], groupType).catch(err => {throw err;}));
                                    }
                                }
                            }
                            else
                            {
                                if (memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS)) {
                                    let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
                                    if (orderedStructures != null) {
                                        extraDetails = await this.validateStructure(orderedStructures, extraDetails).catch(err => {throw err;});
                                    }
                                    for (let responseObject of responses)
                                    {
                                        let extraDetail = await this.findMatchExtraDetail(extraDetails, responseObject).catch(err => {throw err;});
                                        if (!extraDetail.hasOwnProperty(Constants.MEMBERS))
                                        {
                                            values.push(await this.getResponse(responseObject, extraDetail[Constants.STRUCTURE_NAME], groupType).catch(err => {throw err;}));
                                        }
                                        else
                                        {
                                            if (extraDetail.hasOwnProperty(Constants.MEMBERS)) {
                                                values.push(await this.getMapData(responseObject, extraDetail[Constants.MEMBERS]).catch(err => {throw err;}));
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    let pack = null;
                                    if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
                                        pack = memberDetail[Constants.STRUCTURE_NAME];
                                    }

                                    if (pack != null) {
                                        for (let response of responses)
                                        {
                                            values.push(await this.getResponse(response, pack, groupType).catch(err => {throw err;}));
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
                else// need to have structure Name in memberDetail
                {
                    let pack = null;
                    if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
                        pack = memberDetail[Constants.STRUCTURE_NAME];
                    }
                    if (pack != null && pack.toLowerCase() == Constants.CHOICE_NAMESPACE) {
                        for (let response in responses)
                        {
                            let Choice = (await import(Constants.CHOICE_PATH + ".js")).MasterModel // No I18N

                            let memberValue = new Choice(response);

                            values.push(memberValue);
                        }
                    }
                    else
                    {
                        for (let response in responses)
                        {
                            values.push(await this.getResponse(response, pack, null).catch(err => {throw err;}));
                        }
                    }
                }
            }
        }
        return values;
    }

    async getTArrayResponse(memberDetail, groupType, responses)
    {
        let values = [];
        if (memberDetail.hasOwnProperty(Constants.INTERFACE) && memberDetail[Constants.INTERFACE] && memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME))
        {
            let classDetail1 = Initializer.jsonDetails[memberDetail[Constants.STRUCTURE_NAME]];
            let groupType1 = classDetail1[groupType];
            if(groupType1 != null)
            {
                let className = await this.findMatchClass(groupType1[Constants.CLASSES], responses[0]).catch(err => {throw err;});
                for (let response in responses)
                {
                    values.push(await this.getResponse(response, className, null).catch(err => {throw err;}));
                }
            }
        }
        else
        {
            if (memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS))
            {
                let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
                if(extraDetails != null && extraDetails.length() > 0)
                {
                    for (let response in responses)
                    {
                        let extraDetail = await this.findMatchExtraDetail(extraDetails, response);
                        if(!extraDetail.hasOwnProperty(Constants.MEMBERS))
                        {
                            values.push(await this.getResponse(response, extraDetail[Constants.STRUCTURE_NAME], null));
                        }
                        else
                        {
                            if(extraDetail.hasOwnProperty(Constants.MEMBERS))
                            {
                                values.push(await this.getMapData(response, extraDetail[Constants.MEMBERS]));
                            }
                        }
                    }
                }
            }
        }
        return values;
    }

    async getMapData(response, memberDetail) {
        var mapInstance = new Map();

        if (Object.keys(response).length > 0) {
            if (memberDetail == null) {
                for (let key in response) {
                    mapInstance.set(key, await this.redirectorForJSONToObject(response[key]).catch(err => {
                        throw err;
                    }));
                }
            } else {
                let responseKeys = response.keys;
                if (memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS)) {
                    let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
                    let extraDetail = await this.findMatchExtraDetail(extraDetails, response);
                    if (extraDetails[Constants.MEMBERS]) {
                        let memberDetails = extraDetail[Constants.MEMBERS];
                        for (let key in responseKeys) {
                            if (memberDetails.hasOwnProperty(key)) {
                                let memberDetail1 = memberDetails[key];
                                mapInstance.set(memberDetail1[Constants.NAME], await this.getData(response[key], memberDetail1));
                            }
                        }
                    }
                }
            }
        }
        return mapInstance;
    }

    async redirectorForJSONToObject(keyData) {
        let type = Object.prototype.toString.call(keyData);

        if (type == Constants.OBJECT_TYPE) {
            return await this.getMapData(keyData, null).catch(err => { throw err; });
        }
        else if (type == Constants.ARRAY_TYPE) {
            return await this.getCollectionsData(keyData, null, null).catch(err => { throw err; });
        }
        else {
            return keyData;
        }
    }

    async getStreamInstance(response, type)
    {
        let contentDispositionHeader = (response.headers[Constants.CONTENT_DISPOSITION]).toString();

        var fileName = "";

        var instance = null;

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

    async parseMultipartPart(part) {
        const partData = {};
        const nameMatch = /name="(.*?)"/.exec(part);
        partData.name = nameMatch ? nameMatch[1] : null;
        const filenameMatch = /filename="(.*?)"/.exec(part);
        if (filenameMatch) {
            partData.filename = filenameMatch[1];
            partData.data = part.substring(part.indexOf('\r\n\r\n') + 4);
        } else {
            partData.value = part.substring(part.indexOf('\r\n\r\n') + 4);
        }
        return partData;
    }

    async parseMultipartResponse(responseEntity)
    {
        const response = {};
        const header = responseEntity.headers;
        const body = responseEntity.body;
        const boundaryMatch = /boundary=([^;]+)/.exec(header['content-type']);
        const boundary = boundaryMatch ? boundaryMatch[1].replace(/"/g, '') : null;
        if (!boundary) {
            throw new Error('Boundary not found in Content-Type header');
        }
        const parts = body.split('--' + boundary);
        parts.shift(); // Remove the first empty part
        parts.pop(); // Remove the last empty part
        for (const part of parts) {
            let data = await this.parseMultipartPart(part);
            response[data['name']] = data['value'];
        }
        return response;
    }

    async findMatchAndParseResponseClass(contents, responseStream)
    {
        let response = await this.parseMultipartResponse(responseStream);
        if (Object.keys(response).length > 0)
        {
            let ratio = 0;
            let structure = 0;
            let classes = null;
            for(let i = 0; i < contents.length ; i++)
            {
                let content = contents[i];
                let ratio1 = 0;
                if (content.hasOwnProperty(Constants.INTERFACE) && content[Constants.INTERFACE])
                {
                    let interfaceName = content[Constants.CLASSES][0];
                    let classDetail = Initializer.jsonDetails[interfaceName];
                    let groupType1 = classDetail[content[Constants.GROUP_TYPE]];
                    if(groupType1 == null)
                    {
                        return null;
                    }
                    classes = groupType1[Constants.CLASSES];
                }
                else
                {
                    classes = content[Constants.CLASSES];
                }
                if(classes == null || classes.length == 0)
                {
                    return null;
                }
                for (let className of classes)
                {
                    let matchRatio = await this.findRatio(className, response);
                    if (matchRatio == 1.0)
                    {
                        return [contents[i], response];
                    }
                    else if (matchRatio > ratio1)
                    {
                        ratio1 = matchRatio;
                    }
                }
                if(ratio < ratio1)
                {
                    structure = i;
                }
            }
            return [classes[structure], response];
        }
        return null;
    }
    toJson(data) {
        return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}n` : v)
            .replace(/"(-?\d+)n"/g, (_, a) => a);
    }

    async findMatch(classes, responseJson, groupType)
    {
        if(classes.length() == 1)
        {
            return await this.getResponse(responseJson, classes[0], groupType).catch(err=>{throw err;});
        }
        let pack = "";
        let ratio = 0;
        for (let className in classes)
        {
            let matchRatio = await this.findRatio(className, responseJson).catch(err => {throw err;});
            if (matchRatio == 1.0)
            {
                pack = className;
                break;
            }
            else if (matchRatio > ratio)
            {
                pack = className;
                ratio = matchRatio;
            }
        }
        return await this.getResponse(responseJson, pack, groupType).catch(err=> {throw err;});
    }

    async getArrayOfResponse(responseObject, classes, groupType)
    {
        let responseArray = await this.getJSONArrayResponse(responseObject);
        if (responseArray == null)
        {
            return null;
        }
        let i = 0;
        let responseClass = [];
        for (let responseArray1 in responseArray)
        {
            if (i == classes.length)
            {
                i = 0;
            }
            responseClass.push(await this.getResponse(responseArray1, classes[i], groupType));
            i++;
        }
        return [responseClass, responseArray];
    }
}

export {
    FormDataConverter as MasterModel,
    FormDataConverter as FormDataConverter
}
