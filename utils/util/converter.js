import {Constants} from "./constants.js";
import {Initializer} from "../../routes/initializer.js";
import {SDKException} from "../../routes/exception/sdk_exception.js";
import {Choice} from "./choice.js";

/**
 * This class is to construct API request and response.
 */
class Converter {
	commonAPIHandler;

	/**
	 * Creates a Converter class instance with the CommonAPIHandler class instance.
	 * @param {CommonAPIHandler} commonAPIHandler - A CommonAPIHandler class instance.
	 */
	constructor(commonAPIHandler) {
		this.commonAPIHandler = commonAPIHandler;
	}

	getWrappedRequest(response, pack) { }
	/**
	 * This abstract method is to process the API response.
	 * @param {object|Map} response - An Object containing the API response contents or response.
	 * @param {string} pack - A String containing the expected method return type.
	 * @param groupType
	 * @returns An Object representing the class instance.
	 * @throws {Error}
	 */
	getResponse(response, pack, groupType) { }

	/**
	 * This method is to construct the API request.
	 * @param {object} requestObject - An Object containing the class instance.
	 * @param {string} pack - A String containing the expected method return type.
	 * @param {int} instanceNumber - An Integer containing the class instance list number.
	 * @param {object} memberDetail - An object containing the member properties
	 * @param groupType
	 * @returns An Object representing the API request body object.
	 * @throws {Error}
	 */
	formRequest(requestObject, pack, instanceNumber, memberDetail, groupType) { }
	9
	/**
	 * This abstract method is to construct the API request body.
	 * @param {object} requestBase
	 * @param {object} requestObject - A Object containing the API request body object.
	 * @throws {Error}
	 */
	appendToRequest(requestBase, requestObject) { }

	/**
	 * This abstract method is to process the API response.
	 * @param {object} response - An Object containing the HttpResponse class instance.
	 * @param {Array} contents - A String containing the expected method return type.
	 * @returns An Object representing the class instance.
	 * @throws {Error}
	 */
	getWrappedResponse(response, contents) { }

	/**
	 * This method is to validate if the input values satisfy the constraints for the respective fields.
	 * @param {string} className - A String containing the class name.
	 * @param {string} memberName - A String containing the member name.
	 * @param {object} keyDetails - A JSONObject containing the key JSON details.
	 * @param {object} value - A Object containing the key value.
	 * @param {Map} uniqueValuesMap - A Map containing the value of constructed object's unique fields.
	 * @param {int} instanceNumber - An Integer containing the class instance list number.
	 * @returns A Boolean representing the key value is expected pattern, unique, length, and values.
	 * @throws {SDKException}
	 */
	async valueChecker(className, memberName, keyDetails, value, uniqueValuesMap, instanceNumber) {

		const Utility = (await import("./utility.js")).MasterModel;

		var detailsJO = {};

		var name = keyDetails[Constants.NAME];

		var type = keyDetails[Constants.TYPE];

		var valueType = Object.prototype.toString.call(value);

		let check = true;

		let givenType = null;

		if (Constants.TYPE_VS_DATATYPE.has(type.toLowerCase())) {
			if (Array.isArray(value) && keyDetails.hasOwnProperty(Constants.STRUCTURE_NAME)) {
				let structureName = keyDetails[Constants.STRUCTURE_NAME];

				let index = 0;

				let className = (await import("../../".concat(structureName).concat(".js"))).MasterModel;

				for (let data of value) {
					if (!(data instanceof className)) {
						check = false;

						instanceNumber = index;

						let baseName = structureName.split("/").pop();

						let classNameSplit = baseName.split("_");

						let expectedClassName = "";

						for (var nameIndex = 0; nameIndex < classNameSplit.length; nameIndex++) {
							var fieldName = classNameSplit[nameIndex];

							var firstLetterUppercase = fieldName[0].toUpperCase() + fieldName.slice(1);

							expectedClassName = expectedClassName.concat(firstLetterUppercase);
						}

						type = Constants.ARRAY_KEY + "(" + expectedClassName + ")";

						givenType = Constants.ARRAY_KEY + "(" + data.constructor.name + ")";

						break;
					}

					index = index + 1;
				}
			}
			else if (value != null) {
				check = (valueType != Constants.TYPE_VS_DATATYPE.get(type.toLowerCase()) ? false : true);

				if (check && type == Constants.INTEGER_NAMESPACE) {
					check = Utility.checkInteger(value);
				}

				givenType = Object.getPrototypeOf(value).constructor.name;
			}
		}
		else if (value != null && type.toLowerCase() !== Constants.OBJECT_KEY) {
			let expectedStructure = keyDetails[Constants.TYPE];

			let className = (await import("../../".concat(expectedStructure).concat(".js"))).MasterModel;

			if (!(value instanceof className)) {
				check = false;

				type = expectedStructure;

				givenType = value.constructor.name;
			}

			if (check == false) {
				if (givenType.toLowerCase() == Constants.INVENTORYTEMPLATE && type.toLowerCase() == Constants.TEMPLATE) {
					check = true;
				}
			}
		}

		if (!check) {
			detailsJO[Constants.ERROR_HASH_FIELD] = name;

			detailsJO[Constants.ERROR_HASH_CLASS] = className;

			detailsJO[Constants.ACCEPTED_TYPE] = Constants.SPECIAL_TYPES.has(type) ? Constants.SPECIAL_TYPES.get(type) : type;

			detailsJO[Constants.GIVEN_TYPE] = givenType;

			if (instanceNumber != null) {
				detailsJO[Constants.INDEX] = instanceNumber;
			}

			throw new SDKException(Constants.TYPE_ERROR, null, detailsJO, null);
		}

		let initializer = await Initializer.getInitializer();

		if (keyDetails.hasOwnProperty(Constants.VALUES) && (!keyDetails.hasOwnProperty(Constants.PICKLIST) || (keyDetails[Constants.PICKLIST] && initializer.getSDKConfig().getPickListValidation() == true))) {
			let valuesJA = keyDetails[Constants.VALUES];

			if (value instanceof Choice) {
				value = value.getValue();
			}

			if (!valuesJA.includes(value)) {
				detailsJO[Constants.ERROR_HASH_FIELD] = memberName;

				detailsJO[Constants.ERROR_HASH_CLASS] = className;

				if (instanceNumber != null) {
					detailsJO[Constants.INDEX] = instanceNumber;
				}

				detailsJO[Constants.GIVEN_VALUE] = value;

				detailsJO[Constants.ACCEPTED_VALUES] = valuesJA;

				throw new SDKException(Constants.UNACCEPTED_VALUES_ERROR, null, detailsJO);
			}
		}

		if (keyDetails.hasOwnProperty(Constants.UNIQUE)) {
			let valuesArray = uniqueValuesMap.get(name);

			if (valuesArray != null && valuesArray.includes(value)) {
				detailsJO[Constants.ERROR_HASH_FIELD] = memberName;

				detailsJO[Constants.ERROR_HASH_CLASS] = className;

				detailsJO[Constants.FIRST_INDEX] = valuesArray.indexOf(value);

				detailsJO[Constants.NEXT_INDEX] = instanceNumber;

				throw new SDKException(Constants.UNIQUE_KEY_ERROR, null, detailsJO);
			}
			else {
				if (valuesArray == null) {
					valuesArray = [];
				}

				valuesArray.push(value);

				uniqueValuesMap.set(name, valuesArray);
			}
		}

		if (keyDetails.hasOwnProperty(Constants.MIN_LENGTH) || keyDetails.hasOwnProperty(Constants.MAX_LENGTH)) {
			let count = value.toString().length;

			if (Array.isArray(value)) {
				count = value.length;
			}

			if (keyDetails.hasOwnProperty(Constants.MAX_LENGTH) && (count > keyDetails[Constants.MAX_LENGTH])) {
				detailsJO[Constants.ERROR_HASH_FIELD] = memberName;

				detailsJO[Constants.ERROR_HASH_CLASS] = className;

				detailsJO[Constants.GIVEN_LENGTH] = count;

				detailsJO[Constants.ERROR_HASH_MAXIMUM_LENGTH] = keyDetails[Constants.MAX_LENGTH];

				throw new SDKException(Constants.MAXIMUM_LENGTH_ERROR, null, detailsJO);
			}

			if (keyDetails.hasOwnProperty(Constants.MIN_LENGTH) && count < keyDetails[Constants.MIN_LENGTH]) {
				detailsJO[Constants.ERROR_HASH_FIELD] = memberName;

				detailsJO[Constants.ERROR_HASH_CLASS] = className;

				detailsJO[Constants.GIVEN_LENGTH] = count;

				detailsJO[Constants.ERROR_HASH_MINIMUM_LENGTH] = keyDetails[Constants.MIN_LENGTH];

				throw new SDKException(Constants.MINIMUM_LENGTH_ERROR, null, detailsJO);
			}
		}

		if (keyDetails.hasOwnProperty(Constants.REGEX) && !keyDetails[Constants.REGEX].match(value)) {
			detailsJO[Constants.ERROR_HASH_FIELD] = memberName;

			detailsJO[Constants.ERROR_HASH_CLASS] = className;

			if (instanceNumber != null) {
				detailsJO[Constants.INDEX] = instanceNumber;
			}

			throw new SDKException(Constants.REGEX_MISMATCH_ERROR, null, detailsJO);
		}

		return true;
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

	async getJSONResponse(response)
	{
		let responseString = response.toString();
		if (responseString == null || responseString === "null" || responseString === "" || responseString.trim() === "" || responseString === "{}")
		{
			return null;
		}
		return JSON.parse(responseString);
	}

	async getJSONArrayResponse(response)
	{
		let responseString = response.toString();
		if (responseString == null || responseString === "null" || responseString === "" || responseString.trim() === "" || responseString === "[]")
		{
			return null;
		}
		return JSON.parse(responseString);
	}

	async validateInterfaceClass(orderedStructures, classes)
	{
		let validClasses = [];
		for (let className in classes)
		{
			let isValid = false;
			for (let index in orderedStructures.keys)
			{
				let orderedStructure = orderedStructures[index];
				if (!orderedStructure.hasOwnProperty(Constants.MEMBERS))
				{
					if (className.toString() == orderedStructure[Constants.STRUCTURE_NAME])
					{
						isValid = true;
						break;
					}
				}
			}
			if (!isValid)
			{
				validClasses.push(className);
			}
		}
		return validClasses;
	}

	async validateStructure(orderedStructures, extraDetails)
	{
		let validStructure = [];
		for(let extraDetail of extraDetails)
		{
			let extraDetail1 = extraDetail;
			if (!extraDetail1.hasOwnProperty(Constants.MEMBERS))
			{
				let isValid = false;
				for(let index in orderedStructures.keys)
				{
					let orderedStructure = orderedStructures[index];
					if (!orderedStructure.hasOwnProperty(Constants.MEMBERS))
					{
						let extraDetailStructureName = extraDetail1[Constants.STRUCTURE_NAME];
						if (extraDetailStructureName == orderedStructure[Constants.STRUCTURE_NAME])
						{
							isValid = true;
							break;
						}
					}
				}
				if (!isValid)
				{
					validStructure.push(extraDetail1);
				}
			}
			else
			{
				if (extraDetail1.hasOwnProperty(Constants.MEMBERS))
				{
					let isValid = true;
					for (let index in orderedStructures.keys)
					{
						let orderedStructure = orderedStructures[index];
						if (orderedStructure.hasOwnProperty(Constants.MEMBERS))
						{
							let extraDetailStructureMembers = extraDetail1[Constants.MEMBERS];
							let orderedStructureMembers = orderedStructure[Constants.MEMBERS];
							if(extraDetailStructureMembers.length == orderedStructureMembers.length)
							{
								for (let name in extraDetailStructureMembers.keys)
								{
									let extraDetailStructureMember = extraDetailStructureMembers[name];
									if(orderedStructureMembers.hasOwnProperty(name))
									{
										let orderedStructureMember = orderedStructureMembers[name];
										if(extraDetailStructureMember.hasOwnProperty(Constants.TYPE) && orderedStructureMember.hasOwnProperty(Constants.TYPE) && !(extraDetailStructureMember[Constants.TYPE] == (orderedStructureMember[Constants.TYPE])))
										{
											isValid = false;
											break;
										}
									}
									break;
								}
							}
						}
					}
					if (!isValid)
					{
						validStructure.push(extraDetail1);
					}
				}
			}
		}
		return validStructure;
	}
	async findRatio(className, responseJson)
	{
		let classDetail = (Object.prototype.toString.call(className) == "[object String]") ? Initializer.jsonDetails[className] : className;

		var totalPoints = Array.from(Object.keys(classDetail)).length;

		var matches = 0;

		if (totalPoints == 0) {
			return 0;
		}
		else {
			for (let memberName in classDetail) {
				var memberDetail = classDetail[memberName];

				var keyName = memberDetail.hasOwnProperty(Constants.NAME) ? memberDetail[Constants.NAME] : null;

				if (keyName != null && responseJson.hasOwnProperty(keyName) && responseJson[keyName] != null) {// key not empty
					var keyData = responseJson[keyName];

					let type = Object.prototype.toString.call(keyData);

					let structureName = memberDetail.hasOwnProperty(Constants.STRUCTURE_NAME) ? memberDetail[Constants.STRUCTURE_NAME] : null;

					if (type == Constants.OBJECT_TYPE)
					{
						type = Constants.MAP_TYPE;
					}

					if (type == Constants.ARRAY_TYPE)
					{
						type = Constants.ARRAY_TYPE;
					}

					if (Constants.TYPE_VS_DATATYPE.has(memberDetail[Constants.TYPE].toLowerCase()) && Constants.TYPE_VS_DATATYPE.get(memberDetail[Constants.TYPE].toLowerCase()) == type) {
						matches++;
					}
					else if (keyName.toLowerCase() == Constants.COUNT && memberDetail[Constants.TYPE].toLowerCase() == Constants.LONG_NAMESPACE.toLowerCase() && type == Constants.NUMBER_TYPE) {
						matches++;
					}
					else if (memberDetail[Constants.TYPE] == Constants.CHOICE_NAMESPACE) {
						let values = memberDetail[Constants.VALUES];

						for (let value in values) {
							if (keyData == values[value]) {
								matches++;
								break;
							}
						}
					}

					if (structureName != null && structureName == memberDetail[Constants.TYPE]) {
						if (memberDetail.hasOwnProperty(Constants.VALUES)) {
							let values = memberDetail[Constants.VALUES];

							for (let value in values) {
								if (keyData == values[value]) {
									matches++;
									break;
								}
							}
						}
						else {
							matches++;
						}
					}
				}
			}
		}

		return matches / totalPoints;
	}

	async findMatchExtraDetail(extraDetails, responseObject)
	{
		let ratio = 0;
		let index = 0;
		for (let i=0; i<extraDetails.length; i++)
		{
			let classJSON = extraDetails[i];
			if (!classJSON.hasOwnProperty(Constants.MEMBERS))
			{
				let matchRatio = await this.findRatio(classJSON[Constants.STRUCTURE_NAME], responseObject);
				if (matchRatio == 1.0)
				{
					index = i;
					break;
				}
				else if (matchRatio > ratio)
				{
					index = i;
					ratio = matchRatio;
				}
			}
			else
			{
				if (classJSON.hasOwnProperty(Constants.MEMBERS)) {
					let matchRatio = await this.findRatio(classJSON[Constants.MEMBERS], responseObject);
					if (matchRatio == 1.0) {
						index = i;
						break;
					} else if (matchRatio > ratio) {
						index = i;
						ratio = matchRatio;
					}
				}
			}
		}
		return extraDetails[index];
	}

	async findMatchClass(classes, responseJson)
	{
		let pack = "";
		let ratio = 0;
		for (let className in classes)
		{
			let matchRatio = await this.findRatio(className, responseJson);
			if (matchRatio == 1.0)
			{
				pack = className.toString();
				break;
			}
			else if (matchRatio > ratio)
			{
				pack = className.toString();
				ratio = matchRatio;
			}
		}
		return pack;
	}

	async findMatchResponseClass(contents, responseObject)
	{
		let response = null;
		if (responseObject instanceof Object)
		{
			response = await this.getJSONResponse(responseObject);
		}
		else if (responseObject instanceof Array)
		{
			response = (await this.getJSONArrayResponse(responseObject))[0];
		}
		if (response != null)
		{
			let ratio = 0;
			let structure = 0;

			for (let i = 0; i< contents.length; i++)
			{
				let content = contents[i];
				let ratio1 = 0;
				let classes;
				if (content.hasOwnProperty(Constants.INTERFACE) && content[Constants.INTERFACE])
				{
					let interfaceName = content[Constants.CLASSES][0];
					let classDetail = Initializer.jsonDetails[interfaceName];
					let groupType1 = classDetail[content[Constants.GROUP_TYPE]];
					if (groupType1 != null)
					{
						return null;
					}
					classes = groupType1[Constants.CLASSES];
				}
				else
				{
					classes = content[Constants.CLASSES];
				}
				if (classes == null || classes.length == 0)
				{
					return null;
				}
				for (let className in classes)
				{
					let matchRatio = await this.findRatio(className.toString(), response);
					if (matchRatio == 1.0)
					{
						return contents[i];
					}
					else if (matchRatio > ratio1)
					{
						ratio1 = matchRatio;
					}
				}
				if (ratio < ratio1)
				{
					structure = i;
				}
			}
			return contents[structure];
		}
		return null;
	}

}
export {
	Converter as MasterModel,
	Converter as Converter
}