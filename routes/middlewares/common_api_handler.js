import {Constants} from "../../utils/util/constants.js";
import {FormDataConverter} from "../../utils/util/form_data_converter.js";
import {XMLConverter} from "../../utils/util/xml_converter.js";
import {JSONConverter} from "../../utils/util/json_converter.js";
import {Downloader} from "../../utils/util/downloader.js";
import {SDKException} from "../exception/sdk_exception.js";
import {Initializer} from "../initializer.js";
import {APIHTTPConnector} from "../controllers/api_http_connector.js";
import {ParameterMap} from "../parameter_map.js";
import {HeaderMap} from "../header_map.js";
import pkg from "winston";
let Logger = pkg;
import os from "os";
import {APIResponse} from "../controllers/api_response.js";
import {Param} from "../param.js";
import {Header} from "../header.js";

/**
 * This class is to process the API request and its response.
 * Construct the objects that are to be sent as parameters or in the request body with the API.
 * The Request parameter, header and body objects are constructed here.
 * Process the response JSON and converts it to relevant objects in the library.
 */
class CommonAPIHandler {
	apiPath;

	param = new ParameterMap();

	header = new HeaderMap();

	request;

	httpMethod;

	moduleAPIName;

	contentType;

	categoryMethod;

	mandatoryChecker;

	methodName;

	operationClassName;

	/**
	 * This is a setter method to set an API request content type.
	 * @param {string} contentType - A String containing the API request content type.
	 */
	setContentType(contentType) {
		this.contentType = contentType;
	}

	/**
	 * This is a setter method to set the API request URL.
	 * @param {string} apiPath - A String containing the API request URL.
	 */
	setAPIPath(apiPath) {
		this.apiPath = apiPath;
	}

	/**
	 * This method is to add an API request parameter.
	 * @param {Param} paramInstance - A Param instance containing the API request parameter.
	 * @param {object} paramValue - An object containing the API request parameter value.
	 * @throws {SDKException}
	 */
	async addParam(paramInstance, paramValue) {
		if (paramValue == null) {
			return;
		}

		if (this.param == null) {
			this.param = new ParameterMap();
		}

		await this.param.add(paramInstance, paramValue);
	}

	/**
	 * This method is to add an API request header.
	 * @param {Header} headerInstance - A Header instance containing the API request header.
	 * @param {object} headerValue - An object containing the API request header value.
	 * @throws {SDKException}
	 */
	async addHeader(headerInstance, headerValue) {
		if (headerValue == null) {
			return;
		}

		if (this.header == null) {
			this.header = new HeaderMap();
		}

		await this.header.add(headerInstance, headerValue);
	}

	/**
	 * This is a setter method to set the API request parameter map.
	 * @param {ParameterMap} param - A ParameterMap class instance containing the API request parameter.
	 */
	setParam(param) {
		if (param == null) {
			return;
		}

		if (this.param.getParameterMap() != null && this.param.getParameterMap().size > 0) {
			for (let key of param.getParameterMap().keys()) {
				this.param.getParameterMap().set(key, param.getParameterMap().get(key));
			}
		}
		else {
			this.param = param;
		}
	}

	/**
	 * This is a getter method to get the Zoho module API name.
	 * @returns A String representing the Zoho module API name.
	 */
	getModuleAPIName() {
		return this.moduleAPIName;
	}

	/**
	 * This is a setter method to set the Zoho module API name.
	 * @param {string} moduleAPIName - A String containing the Zoho module API name.
	 */
	setModuleAPIName(moduleAPIName) {
		this.moduleAPIName = moduleAPIName;
	}

	/**
	 * This is a setter method to set the API request header map.
	 * @param {HeaderMap} header - A HeaderMap class instance containing the API request header.
	 */
	setHeader(header) {
		if (header == null) {
			return;
		}

		if (this.header.getHeaderMap() != null && this.header.getHeaderMap().size > 0) {
			for (let key of header.getHeaderMap().keys()) {
				this.header.getHeaderMap().set(key, header.getHeaderMap().get(key));
			}
		}
		else {
			this.header = header;
		}
	}

	/**
	 * This is a setter method to set the API request body object.
	 * @param {object} request - An Object containing the API request body object.
	 */
	setRequest(request) {
		this.request = request;
	}

	/**
	 * This is a setter method to set the HTTP API request method.
	 * @param {string} httpMethod - A String containing the HTTP API request method.
	 */
	setHttpMethod(httpMethod) {
		this.httpMethod = httpMethod;
	}

	/**
	 * This method is used in constructing API request and response details. To make the Zoho API calls.
	 * @see APIHTTPConnector
	 * @returns {APIResponse} An instance of APIResponse representing the Zoho API response
	 * @throws {SDKException}
	 */
	async apiCall() {
		const Location = (await import("../../models/authenticator/token.js")).Location

		let initializer = await Initializer.getInitializer();

		if (initializer == null) {
			throw new SDKException(Constants.SDK_UNINITIALIZATION_ERROR, Constants.SDK_UNINITIALIZATION_MESSAGE);
		}

		var connector = new APIHTTPConnector();

		try {
			await this.setAPIUrl(connector).catch(err => { throw err; });
		}
		catch (error) {
			if (!(error instanceof SDKException)) {
				error = new SDKException(null, null, null, error);
			}

			Logger.error(Constants.SET_API_URL_EXCEPTION, error);

			throw error;
		}

		connector.setRequestMethod(this.httpMethod);

		let environment = (await Initializer.getInitializer()).getEnvironment();

		if (this.header != null && this.header.getHeaderMap().size > 0) {
			connector.setHeaders(this.header.getHeaderMap());
			if (environment.getLocation() != null && environment.getLocation().name == Location.HEADER.name)
			{
				connector.addHeader(environment.getName(), environment.getValue());
			}
		}

		if (this.param != null && this.param.getParameterMap().size > 0) {
			connector.setParams(this.param.getParameterMap());
			if (environment.getLocation() != null && environment.getLocation().name == Location.PARAM.name)
			{
				connector.addParam(environment.getName(), environment.getValue());
			}
		}

		try
		{
			let initializer = await Initializer.getInitializer().catch(err=> {throw err;});
			if (initializer.getTokens() != null && initializer.getTokens().length > 0) {
				let tokenConfig = await this.getToken();
				await tokenConfig[0].authenticate(connector, tokenConfig[1]);
			}
		}
		catch (error) {
			if (!(error instanceof SDKException)) {
				error = new SDKException(null, null, null, error);
			}

			Logger.error(Constants.AUTHENTICATION_EXCEPTION, error);

			throw error;
		}
		var returnObject = null;

		var converterInstance = null;

		if (Constants.GENERATE_REQUEST_BODY.includes(this.httpMethod.toUpperCase()) && this.request != null)
		{
			let request;
			try
			{
				let pack = await this.getClassName(false, null, null);
				if (pack != null) {
					converterInstance = await this.getConverterClassInstance(this.contentType.toLowerCase());
					connector.setContentType(this.contentType);
					let isSet = false;
					if (typeof pack === 'object' && pack != null)
					{
						let pack1 = pack;
						if (pack1.hasOwnProperty(Constants.CLASSES))
						{
							const classes = pack1[Constants.CLASSES];
							if (Array.isArray(classes) && classes.length === 1 && classes[0].toLowerCase() === 'object') {
								connector.setRequestBody(this.request);
								isSet = true;
							}
						}
					}
					if (!isSet)
					{
						request = await converterInstance.getWrappedRequest(this.request, pack);
						connector.setRequestBody(request);
					}
				}
			}
			catch (error) {
				if (error instanceof SDKException)
				{
					Logger.error(Constants.FORM_REQUEST_EXCEPTION, error);
					throw error
				}
				else{
					error = new SDKException(null, null, null, error);
					Logger.error(Constants.FORM_REQUEST_EXCEPTION, error);
					throw error;
				}
			}
		}


		try {
			let response = await connector.fireRequest(converterInstance).catch(err => { throw err; });

			let statusCode = response.statusCode;

			let headerMap = await this.getHeaders(response.headers);

			if (response.headers.hasOwnProperty(Constants.CONTENT_TYPE_HEADER.toLowerCase())) {
				let contentTypeHeader = response.headers[Constants.CONTENT_TYPE_HEADER.toLowerCase()];

				let contentType = contentTypeHeader.split(";")[0];

				converterInstance = this.getConverterClassInstance(contentType.toLowerCase());

				let pack = await this.getClassName(true, statusCode, contentType);

				let returnObject = null;

				let responseJSON = null;

				if (pack != null)
				{
					let responseObject = await converterInstance.getWrappedResponse(response, pack);
					if (responseObject != null)
					{
						returnObject = responseObject[0];
						if (responseObject.length == 2)
						{
							responseJSON = responseObject[1];
						}
					}
				}
				return new APIResponse(headerMap, statusCode, returnObject, responseJSON);

			}
			else {
				Logger.info(Constants.API_ERROR_RESPONSE + response.statusCode.toString());
			}

			return new APIResponse(headerMap, response.statusCode, returnObject, null);
		}
		catch (error) {
			if (!(error instanceof SDKException)) {
				error = new SDKException(null, null, null, error);
			}

			Logger.error(Constants.API_CALL_EXCEPTION, error);

			throw error;
		}
	}

	async getToken()
	{
		let authenticationTypes = await this.getRequestMethodDetails(this.operationClassName);
		if(authenticationTypes != null)
		{
			for (let token of (await Initializer.getInitializer()).getTokens())
			{
				for (let authenticationType of authenticationTypes)
				{
					let authentication =  authenticationType;
					let schemaName = authentication[Constants.SCHEMA_NAME];
					if(schemaName == token.getAuthenticationSchema().getSchema())
					{
						return [token, authentication];
					}
				}
			}
		}
		return [(await Initializer.getInitializer()).getTokens()[0], null];
	}

	async getRequestMethodDetails(operationsClassName)
	{
		try
		{
			operationsClassName = await this.getFileName(operationsClassName).catch(err=> { throw err; });

			if(Initializer.jsonDetails.hasOwnProperty(operationsClassName.toLowerCase()))
			{
				let classDetails = Initializer.jsonDetails[operationsClassName.toLowerCase()];
				let methodName = this.getMethodName();
				if(classDetails.hasOwnProperty(methodName))
				{
					let methodDetails = classDetails[methodName];
					if(methodDetails.hasOwnProperty(Constants.AUTHENTICATION))
					{
						return methodDetails[Constants.AUTHENTICATION];
					}
					else if (classDetails.hasOwnProperty(Constants.AUTHENTICATION))
					{
						return classDetails[Constants.AUTHENTICATION];
					}
					return null;
				}
				else
				{
					throw new SDKException(null, Constants.SDK_OPERATIONS_METHOD_DETAILS_NOT_FOUND_IN_JSON_DETAILS_FILE);
				}
			}
			else
			{
				throw new SDKException(null, Constants.SDK_OPERATIONS_CLASS_DETAILS_NOT_FOUND_IN_JSON_DETAILS_FILE);
			}
		}
		catch(error)
		{
			if (error instanceof SDKException)
			{
				throw error;
			}
			else {
				let exception = new SDKException(null, null, null, error);
				Logger.error(Constants.API_CALL_EXCEPTION, exception);
				throw exception;
			}
		}
	}

	async getFileName(name) {
		let classPath = []
		let spl = name.toString().split(".");
		for(let name of spl) {
			let name1 = await this.getSplitFileName(name);
			classPath.push(name1.join("_"))
		}
		return "core/" + classPath.join('/'); //No i18N
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

	async getHeaders(headers) {
		let headerMap = new Map();

		if (Object.keys(headers).length > 0) {
			for (let key in headers) {
				headerMap.set(key, headers[key]);
			}
		}

		return headerMap;
	}

	/**
	 * This method is used to get a Converter class instance.
	 * @param {string} encodeType - A String containing the API response content type.
	 * @returns A Converter class instance.
	 */
	getConverterClassInstance(encodeType) {
		var type = null;

		switch (encodeType) {
			case "application/json":
			case "text/plain":
			case "application/ld+json":
				type = new JSONConverter(this);
				break;
			case "application/xml":
			case "text/xml":
				type = new XMLConverter(this);
				break;
			case "multipart/form-data":
				type = new FormDataConverter(this);
				break;
			case "image/png":
			case "image/jpeg":
			case "image/gif":
			case "image/tiff":
			case "image/tif":
			case "image/svg+xml":
			case "image/bmp":
			case "image/webp":
			case "text/csv":
			case "text/html":
			case "text/css":
			case "text/javascript":
			case "text/calendar":
			case "application/x-download":
			case "application/zip":
			case "application/pdf":
			case "application/java-archive":
			case "application/javascript":
			case "application/octet-stream":
			case "application/xhtml+xml":
			case "application/x-bzip":
			case "application/msword":
			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			case "application/gzip":
			case "application/x-httpd-php":
			case "application/vnd.ms-powerpoint":
			case "application/vnd.rar":
			case "application/x-sh":
			case "application/x-tar":
			case "application/vnd.ms-excel":
			case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
			case "application/x-7z-compressed":
			case "audio/mpeg":
			case "audio/x-ms-wma":
			case "audio/vnd.rn-realaudio":
			case "audio/x-wav":
			case "audio/3gpp":
			case "audio/3gpp2":
			case "video/mpeg":
			case "video/mp4":
			case "video/webm":
			case "video/3gpp":
			case "video/3gpp2":
			case "font/ttf":
				type = new Downloader(this);
				break;
		}

		return type;
	}

	async getClassName(isResponse, statusCode, mimeType)
	{
		let jsonDetails = Initializer.jsonDetails;
		var operationClassName = await this.getFileName(this.operationClassName);
		if (jsonDetails.hasOwnProperty(operationClassName))
		{
			let methods = jsonDetails[operationClassName.toLowerCase()];
			let methodName = this.getMethodName();
			if (methods.hasOwnProperty(methodName))
			{
				let methodDetails = methods[methodName];
				if(isResponse)
				{
					if(methodDetails.hasOwnProperty(Constants.RESPONSE))
					{
						let response = methodDetails[Constants.RESPONSE];
						if(response.hasOwnProperty(statusCode.toString()))
						{
							let contentResponse = response[statusCode.toString()];
							for(let content of contentResponse)
							{
								let contentJSON = content;
								if(contentJSON.hasOwnProperty(mimeType))
								{
									return contentJSON[mimeType];
								}
							}
							Logger.error(Constants.API_CALL_EXCEPTION);
						}
						else
						{
							Logger.error(Constants.API_CALL_EXCEPTION);
						}
					}
				}
				else
				{
					if(methodDetails.hasOwnProperty(Constants.REQUEST))
					{
						return await this.getRequestClassName(methodDetails[Constants.REQUEST]).catch(err=>{ throw err; });
					}
				}
			}
			else
			{
				Logger.error(Constants.API_CALL_EXCEPTION);
			}
		}
		else
		{
			Logger.error(Constants.API_CALL_EXCEPTION);
		}
		return null;
	}
	async getRequestClassName(requests)
	{
		let name = this.request.constructor.name;
		if (this.request instanceof Array)
		{
			name = this.request[0].constructor.name;
		}
		for (let type in requests)
		{
			let contents = requests[type];
			for (let content1 of contents)
			{
				let content = content1;
				if (content.hasOwnProperty(Constants.INTERFACE) && content[Constants.INTERFACE])
				{
					let interfaceName = content[Constants.CLASSES][0];
					if (interfaceName == name)
					{
						this.contentType = type;
						return content;
					}
					let classDetail = Initializer.jsonDetails[interfaceName];
					for (let groupType in classDetail.keys)
					{
						let groupTypeContent = classDetail[groupType];
						let classes =  groupTypeContent[Constants.CLASSES];
						for (let className in classes)
						{
							if (className.toString() == name)
							{
								this.contentType = type;
								return content;
							}
						}
					}
				}
				else
				{
					let classes = content[Constants.CLASSES];

					for (let className of classes)
					{
						let classSplit = className.split("/");
						className = this.buildName(classSplit[classSplit.length - 1]);
						className = className.substring(0, 1).toUpperCase().concat(className.substring(1, className.length));
						if (className.toString() == name)
						{
							this.contentType = type;
							return content;
						}
					}
					if (classes.length == 1 && classes[0].toLowerCase === 'object')
					{
						this.contentType = type;
						return content;
					}
				}
			}
		}
		return null;
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

	async setAPIUrl(connector) {
		var apiPath = "";

		let initializer = await Initializer.getInitializer();

		if (this.apiPath.toString().includes(Constants.HTTP)) {
			if (this.apiPath.substring(0, 1) == "/") {
				this.apiPath = this.apiPath.substring(1);
			}

			apiPath = apiPath.concat(this.apiPath);
		}
		else {
			apiPath = apiPath.concat(initializer.getEnvironment().getUrl());

			apiPath = apiPath.concat(this.apiPath);
		}

		connector.url = apiPath;
	}

	/**
	 * This is a getter method to get operationClassName
	 * @returns {string} - A string value representing operationClassName
	 */
	getOperationClassName()
	{
		return this.operationClassName;
	}

	/**
	 * This is a setter method to set operationClassName
	 * @param {string} operationClassName - A string value
	 */
	setOperationClassName(operationClassName)
	{
		this.operationClassName = operationClassName;
	}
	/**
	 * This is a getter method to get mandatoryChecker
	 * @returns {Boolean} - A Boolean value representing mandatoryChecker
	 */
	isMandatoryChecker() {
		return this.mandatoryChecker;
	}

	/**
	 * This is a setter method to set mandatoryChecker
	 * @param {Boolean} mandatoryChecker - A Boolean value
	 */
	setMandatoryChecker(mandatoryChecker) {
		this.mandatoryChecker = mandatoryChecker;
	}

	/**
	 * This is a getter method to get the HTTP API request method.
	 * @returns {string} A String containing the HTTP API request method.
	 */
	getHttpMethod() {
		return this.httpMethod;
	}

	/**
	 * This is a getter method to get categoryMethod
	 * @returns {String} - A String value representing categoryMethod
	 */
	getCategoryMethod() {
		return this.categoryMethod;
	}

	/**
	 * This is a setter method to set categoryMethod
	 * @param {String} categoryMethod - A String value representing categoryMethod
	 */
	setCategoryMethod(categoryMethod) {
		this.categoryMethod = categoryMethod;
	}

	/**
	 * This is a getter method to get the API request URL.
	 * @returns {String} A String containing the API request URL.
	 */
	getAPIPath() {
		return this.apiPath;
	}

	getMethodName()
	{
		return this.buildName(this.methodName);
	}

	setMethodName(methodName)
	{
		this.methodName = methodName;
	}
}

export {
	CommonAPIHandler as MasterModel,
	CommonAPIHandler as CommonAPIHandler
}