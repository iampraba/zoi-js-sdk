import {Converter} from "./converter.js";
import {Constants} from "./constants.js";
import {Initializer} from "../../routes/initializer.js";
import {SDKException} from "../../routes/exception/sdk_exception.js";
import {DataTypeConverter} from "./datatype_converter.js";

/**
 * This class processes the API response to the object and an object to a JSON object, containing the request body.
 */
class JSONConverter extends Converter {
	uniqueValuesMap = {};

	constructor(commonAPIHandler) {
		super(commonAPIHandler);
	}

	async appendToRequest(requestBase, requestObject) {
		return JSON.stringify(requestBase.getRequestBody()) || null;
	}

	async getWrappedRequest(requestInstance, pack)
	{
		var classes = pack[Constants.CLASSES];
		for (let class1 of classes) {
			let groupType = pack[Constants.GROUP_TYPE];
			if (groupType == Constants.ARRAY_OF) {
				if (pack.hasOwnProperty(Constants.INTERFACE) && pack[Constants.INTERFACE]) {
					if (requestInstance instanceof Array) {
						let requestObjects = requestInstance;
						if (requestObjects.length > 0) {
							let jsonArray = [];
							let instanceCount = 0;
							for (let request of requestObjects) {
								jsonArray.push(request, request.constructor.name, instanceCount, null, groupType);
								instanceCount++;
							}
							return jsonArray;
						}
					} else {
						return await this.formRequest(requestInstance, class1, null, null, groupType);
					}
				} else {
					return await this.formRequest(requestInstance, class1, null, null, groupType);
				}
			} else {
				return await this.formRequest(requestInstance, class1, null, null, groupType);
			}
		}
		return null;
	}
	async formRequest(requestInstance, pack, instanceNumber, memberDetail, groupType) {
		var classDetail = Initializer.jsonDetails[pack];

		if (classDetail.hasOwnProperty(Constants.INTERFACE) && classDetail[Constants.INTERFACE]) {
			let groupType1 = classDetail[groupType];
			if (groupType1 != null){
				var classes = classDetail[Constants.CLASSES];

				var baseName = pack.split('/').slice(0, -1);

				let className = this.getFileName(requestInstance.constructor.name);

				baseName.push(className);

				let requestObjectClassName = baseName.join('/');

				for (let className1 in classes) {
					if (className1.toLowerCase() == requestObjectClassName) {

						classDetail = Initializer.jsonDetails[requestObjectClassName];

						break;
					}
				}
			}
		}
		return await this.isNotRecordRequest(requestInstance, classDetail, instanceNumber, memberDetail).catch(err => { throw err; });
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

			if (memberDetail.hasOwnProperty(Constants.REQUEST_SUPPORTED) || !memberDetail.hasOwnProperty(Constants.NAME))
			{
				let requestSupported = memberDetail[Constants.REQUEST_SUPPORTED];

				for (let i=0; i<requestSupported.length; i++)
				{
					if (requestSupported[i] == this.commonAPIHandler.getCategoryMethod().toLowerCase())
					{
						found = true;
						break;
					}
				}
			}
			if (!found)
			{
				continue;
			}

			var keyName = memberDetail[Constants.NAME];

			try {
				modification = requestInstance.isKeyModified(keyName);
			}
			catch (ex) {
				throw new SDKException(Constants.EXCEPTION_IS_KEY_MODIFIED, null, null, ex);
			}
			if (memberDetail.hasOwnProperty(Constants.REQUIRED_FOR) && (memberDetail[Constants.REQUIRED_FOR] == Constants.ALL || memberDetail[Constants.REQUIRED_FOR] == Constants.REQUEST)) {
				requiredKeys.set(keyName, true);
			}

			var fieldValue = null;

			if (modification != null && modification != 0) {
				fieldValue = Reflect.get(requestInstance, memberName);

				if (fieldValue != null) {
					if (await this.valueChecker(requestInstance.constructor.name, memberName, memberDetail, fieldValue, this.uniqueValuesMap, instanceNumber).catch(err => { throw err; })) {

						if (requiredKeys.has(keyName)){
							requiredKeys.delete(keyName);
						}
					}
					requestJSON[keyName] = await this.setData(memberDetail, fieldValue)
				}
			}
		}

		if (!skipMandatory)
		{
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

			let type = memberDetail[Constants.TYPE].toString();

			return await this.setDataValue(type, memberDetail, fieldValue);
		}

		return null;
	}
	async setDataValue(type, memberDetail, fieldValue)
	{
		let groupType = memberDetail.hasOwnProperty(Constants.GROUP_TYPE) ? memberDetail[Constants.GROUP_TYPE] : null;

		if (type.toLowerCase() == Constants.LIST_NAMESPACE.toLowerCase()) {
			return await this.setJSONArray(fieldValue, memberDetail, groupType).catch(err => { throw err; });
		}
		else if (type.toLowerCase() == Constants.MAP_NAMESPACE.toLowerCase()) {
			return await this.setJSONObject(fieldValue, memberDetail).catch(err => { throw err; });
		}
		else if (type == Constants.CHOICE_NAMESPACE || (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME) && memberDetail[Constants.STRUCTURE_NAME] == Constants.CHOICE_NAMESPACE)) {
			return fieldValue.getValue();
		}
		else if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
			return await this.formRequest(fieldValue, memberDetail[Constants.STRUCTURE_NAME], null, memberDetail, groupType).catch(err => { throw err; });
		}
		else {
			return DataTypeConverter.postConvert(fieldValue, type);
		}
	}

	async setJSONObject(fieldValue, memberDetail) {
		let jsonObject = {};

		let requestObject = fieldValue;

		if (Array.from(requestObject.keys()).length > 0) {
			if (memberDetail == null) {
				for (let key of Array.from(requestObject.keys())) {
					jsonObject[key] = await this.redirectorForObjectToJSON(requestObject.get(key)).catch(err => {throw err;});
				}
			} else {

				if (memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS)) {
					let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
					if (extraDetails != null && extraDetails.length > 0) {
						let members = await this.getValidStructure(extraDetails, requestObject.keys()).catch(err => {throw err;});
						return this.isNotRecordRequest(fieldValue, members, null, null).catch(err => {throw err;});
					}
				} else {
					for (let key in requestObject.keys()) {
						jsonObject[key.toString()] = this.redirectorForObjectToJSON(requestObject.get(key)).catch(err => {throw err;});
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

	async getValidStructure(extraDetails, keys)
	{
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
					let members = extraDetail[Constants.MEMBERS];
					if (await this.areArraysEqual(keys, members.keys))
					{
						return members;
					}
				}
			}
		}
		return null;
	}

	async setJSONArray(requestObjects, memberDetail, groupType) {
		var jsonArray = [];

		if (requestObjects.length > 0) {
			if (memberDetail == null || (memberDetail != null && !memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME))) {

				if (memberDetail != null && memberDetail.hasOwnProperty(Constants.SUB_TYPE))
				{
					let subType = memberDetail[Constants.SUB_TYPE];
					let type = subType[Constants.TYPE];
					if (type == Constants.CHOICE_NAMESPACE)
					{
						for (let response of requestObjects)
						{
							jsonArray.push(response.getValue());
						}
					}
					else
					{
						for (let response of requestObjects)
						{
							jsonArray.push(await this.setDataValue(type, memberDetail, response).catch(err=> { throw err;}));
						}
					}
				}
				else
				{
					for (let request of requestObjects) {
						jsonArray.push(await this.redirectorForObjectToJSON(request).catch(err => { throw err; }));
					}
				}
			}
			else {
				if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME))
				{
					let pack = memberDetail[Constants.STRUCTURE_NAME];
					if (pack.toLowerCase() == Constants.CHOICE_NAMESPACE)
					{
						for (let request of requestObjects)
						{
							jsonArray.push(request.getValue());
						}
					}
					else
					{
						let instanceCount = 0;
						for (let request of requestObjects)
						{
							jsonArray.push(await this.formRequest(request, pack, instanceCount, memberDetail, groupType));
							instanceCount++;
						}
					}
				}
				else
				{
					let instanceCount = 0;
					for (let request of requestObjects)
					{
						if(request instanceof Map)
						{
							let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
							if (extraDetails != null && extraDetails.length > 0)
							{
								let members = await this.getValidStructure(extraDetails, request.keys());
								jsonArray.push(await this.isNotRecordRequest(request, members, null, null).catch(err => {throw err;}));
							}
							else
							{
								jsonArray.push(await this.redirectorForObjectToJSON(request).catch(err => {throw err;}));
							}
						}
						else
						{
							jsonArray.push(await this.formRequest(request, request.constructor.name, instanceCount, memberDetail, groupType).catch(err => {throw err;}));
						}
						instanceCount++;
					}
				}
			}
		}
		return jsonArray;
	}

	async redirectorForObjectToJSON(request) {
		if (Array.isArray(request)) {
			return await this.setJSONArray(request, null, null).catch(err => { throw err; });
		}
		else if (request instanceof Map) {
			return await this.setJSONObject(request, null).catch(err => { throw err; });
		}
		else if (request instanceof Choice)
		{
			return request.getValue();
		}
		else {
			return request;
		}
	}

	async getWrappedResponse(response, contents) {
		let responseObject = JSON.parse(response.body);
		if (responseObject != null)
		{
			let pack;
			if (contents.length === 1)
			{
				pack = contents[0];
			}
			else
			{
				pack = await this.findMatchResponseClass(contents, responseObject);
			}
			if (pack != null)
			{
				let groupType = pack[Constants.GROUP_TYPE];
				if (groupType == Constants.ARRAY_OF)
				{
					if (pack.hasOwnProperty(Constants.INTERFACE) && pack[Constants.INTERFACE])
					{
						let interfaceName = pack[Constants.CLASSES][0];
						let classDetail = Initializer.jsonDetails[interfaceName];
						let groupType1 = classDetail[Constants.ARRAY_OF];
						if (groupType1 != null)
						{
							return await this.getArrayOfResponse(responseObject, groupType1[Constants.CLASSES], groupType);
						}
					}
					else
					{
						return await this.getArrayOfResponse(responseObject, pack[Constants.CLASSES], groupType);
					}
				}
				else
				{
					let responseJSON = responseObject;
					if (pack.hasOwnProperty(Constants.INTERFACE) && pack[Constants.INTERFACE])
					{
						let interfaceName = pack[Constants.CLASSES][0];
						return [await this.getResponse(responseObject, interfaceName, groupType), responseJSON];
					}
					else
					{
						let packName = await this.findMatchClass(pack[Constants.CLASSES], responseJSON);
						return [await this.getResponse(responseObject, packName, groupType), responseJSON];
					}
				}
			}
		}
		return null;
	}

	async getResponse(response, packageName, groupType) {

		let classDetail = Initializer.jsonDetails[packageName];

		let responseJSON = response;

		// let responseJSON = await this.getJSONResponse(response);

		var instance = null;

		if (responseJSON != null)
		{
			if (classDetail.hasOwnProperty(Constants.INTERFACE) && classDetail[Constants.INTERFACE])
			{
				let classDetail1 = Initializer.jsonDetails[packageName];

				let groupType1 = classDetail1[groupType];

				if (groupType1 != null)
				{
					let classes  = groupType1[Constants.CLASSES];
					instance = await this.findMatch(classes, responseJSON, groupType).catch(err => {throw err;}); // find match returns instance(calls getResponse() recursively)
				}
			}
			else
			{
				let ClassName = (await import("../../".concat(packageName).concat(".js"))).MasterModel;

				instance = new ClassName();

				await this.notRecordResponse(instance, responseJSON, classDetail).catch(err => {throw err;});
			}
		}
		return instance;
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

	async getData(keyData, memberDetail) {
		let memberValue = null;

		if (keyData != null) {

			let type = memberDetail[Constants.TYPE].toString();

			memberValue = await this.getDataValue(type, keyData, memberDetail);

		}

		return memberValue;
	}

	async getDataValue(type, keyData, memberDetail)
	{
		let memberValue = null;

		let groupType = memberDetail.hasOwnProperty(Constants.GROUP_TYPE) ? memberDetail[Constants.GROUP_TYPE] : null;

		if (type.toLowerCase() == Constants.LIST_NAMESPACE.toLowerCase()) {
			memberValue = await this.getCollectionsData(keyData, memberDetail, groupType).catch(err => { throw err; });
		}
		else if (type.toLowerCase() == Constants.MAP_NAMESPACE.toLowerCase()) {
			memberValue = await this.getMapData(keyData, memberDetail).catch(err => { throw err; });
		}
		else if (type == Constants.CHOICE_NAMESPACE || (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME) && memberDetail[Constants.STRUCTURE_NAME] == Constants.CHOICE_NAMESPACE)) {
			let Choice = (await import(Constants.CHOICE_PATH+".js")).MasterModel;

			memberValue = new Choice(keyData);
		}
		else if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
			memberValue = await this.getResponse(keyData, memberDetail[Constants.STRUCTURE_NAME], groupType).catch(err => { throw err; });
		}
		else {
			memberValue = await DataTypeConverter.preConvert(keyData, type);
		}

		return memberValue
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
					if (extraDetail.hasOwnProperty(Constants.MEMBERS)) {
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
							if (orderedStructures.length() > responses.length()) {
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
								if (i == extraDetails.length()) {
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
									else if (memberDetail.hasOwnProperty(Constants.SUB_TYPE)) {
										pack = memberDetail[Constants.SUB_TYPE][Constants.TYPE];
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
				} else// need to have structure Name in memberDetail
				{
					let pack = null;
					if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME)) {
						pack = memberDetail[Constants.STRUCTURE_NAME];
					}
					else if (memberDetail.hasOwnProperty(Constants.SUB_TYPE)) {
						pack = memberDetail[Constants.SUB_TYPE][Constants.TYPE];
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

	async findMatch(classes, responseJson, groupType) {

		if (classes.length == 1)
		{
			return await this.getResponse(responseJson, classes[0], groupType).catch(err => {throw err;});
		}
		let pack = "";

		let ratio = 0;

		for (let className of classes) {

			var matchRatio = await this.findRatio(className, responseJson);

			if (matchRatio == 1.0) {

				pack = className;

				break;
			}
			else if (matchRatio > ratio) {

				ratio = matchRatio;

				pack = className;
			}
		}

		return await this.getResponse(responseJson, pack, groupType);
	}

	async getTArrayResponse(memberDetail, groupType, responses)
	{
		let values = [];
		if (memberDetail.hasOwnProperty(Constants.INTERFACE) && memberDetail[Constants.INTERFACE] && memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME))
		{
			let classDetail1 = Initializer.jsonDetails[memberDetail[Constants.STRUCTURE_NAME]];
			let groupType1 = classDetail1[groupType];
			if (groupType1 != null)
			{
				let className = await this.findMatchClass(groupType1[Constants.CLASSES], responses[0]);
				for (let response of responses)
				{
					values.push(await this.getResponse(response, className, null));
				}
			}
		}
		else
		{
			if (memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME))
			{
				for (let response of responses)
				{
					values.push(await this.getResponse(response, memberDetail[Constants.STRUCTURE_NAME], null))
				}
			}
			else
			{
				if (memberDetail.hasOwnProperty(Constants.EXTRA_DETAILS))
				{
					let extraDetails = memberDetail[Constants.EXTRA_DETAILS];
					if (extraDetails != null && extraDetails.length > 0)
					{
						for (let response of responses)
						{
							let extraDetail = await this.findMatchExtraDetail(extraDetails, response);
							if (!extraDetail.hasOwnProperty(Constants.MEMBERS))
							{
								values.push(await this.getResponse(response, extraDetail[Constants.STRUCTURE_NAME], null));
							}
							else
							{
								if (extraDetail.hasOwnProperty(Constants.MEMBERS))
								{
									values.push(await this.getMapData(response, extraDetail[Constants.MEMBERS]));
								}
							}
						}
					}
				}
			}
		}
		return values;
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
		for (let responseArray1 of responseArray)
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

	buildName(memberName) {
		let name = memberName.toLowerCase().split("_");

		var index = 0;

		if (name.length == 0) {
			index = 1;
		}

		var sdkName = name[0]

		sdkName = sdkName[0].toLowerCase() + sdkName.slice(1);

		index = 1;

		for (var nameIndex = index; nameIndex < name.length; nameIndex++) {
			var fieldName = name[nameIndex];

			var firstLetterUppercase = "";

			if (fieldName.length > 0) {
				firstLetterUppercase = fieldName[0].toUpperCase() + fieldName.slice(1);
			}

			sdkName = sdkName.concat(firstLetterUppercase);
		}

		return sdkName;
	}

	getFileName(name) {
		let fileName = [];

		let nameParts = name.split(/([A-Z][a-z]+)/).filter(function (e) { return e });

		fileName.push(nameParts[0].toLowerCase());

		for (let i = 1; i < nameParts.length; i++) {
			fileName.push(nameParts[i].toLowerCase());
		}

		return fileName.join("_");
	}
}

export {
	JSONConverter as MasterModel,
	JSONConverter as JSONConverter
}