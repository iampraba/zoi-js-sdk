// core file
import * as Dc from "./core/com/zoho/officeintegrator/dc/import_dc.js";
import * as ApiServer from "./core/com/zoho/officeintegrator/dc/api_server/import_api_server.js";
import * as V1 from "./core/com/zoho/officeintegrator/v1/import_v1.js";


// token store
import { DBBuilder } from "./models/authenticator/store/db_builder.js";
import { DBStore } from "./models/authenticator/store/db_store.js";
import { FileStore } from "./models/authenticator/store/file_store.js";
import * as TokenStore from "./models/authenticator/store/token_store.js";

// authenticator
import { OAuth2 } from "./models/authenticator/oauth2.js";
import { OAuth2Builder} from "./models/authenticator/oauth2_builder.js";
import { Auth } from "./models/authenticator/auth.js";
import { AuthBuilder } from "./models/authenticator/auth_builder.js";
import { AuthenticationSchema } from "./models/authenticator/authentication_schema.js";
import { ParsableEnum } from "./models/authenticator/parsable_enum.js";
import * as Token from "./models/authenticator/token.js";
import { Location } from "./models/authenticator/token.js";
import { AuthenticationType } from "./models/authenticator/token.js";

// controllers
import { APIHTTPConnector } from "./routes/controllers/api_http_connector.js";
import { APIResponse } from "./routes/controllers/api_response.js";

// exception
import {SDKException} from "./routes/exception/sdk_exception.js";


// logger
import { LogBuilder } from "./routes/logger/log_builder.js";
import { Logger } from "./routes/logger/logger.js";
import { Levels } from "./routes/logger/logger.js";
import { SDKLogger } from "./routes/logger/sdk_logger.js";

// middlewares
import { CommonAPIHandler } from "./routes/middlewares/common_api_handler.js";

// root files
import { HeaderMap } from "./routes/header_map.js";
import { Header } from "./routes/header.js";
import { InitializeBuilder } from "./routes/initialize_builder.js";
import { Initializer } from "./routes/initializer.js";
import { Param } from "./routes/param.js";
import { ParameterMap } from "./routes/parameter_map.js";
import { ProxyBuilder } from "./routes/proxy_builder.js";
import { RequestProxy } from "./routes/request_proxy.js";
import { SDKConfigBuilder } from "./routes/sdk_config_builder.js";
import { SDKConfig } from "./routes/sdk_config.js";
import { UserSignature } from "./routes/user_signature.js";

//util files
import { Choice } from "./utils/util/choice.js";
import { Constants } from "./utils/util/constants.js";
import { Converter } from "./utils/util/converter.js";
import { DataTypeConverter } from "./utils/util/datatype_converter.js";
import { Downloader } from "./utils/util/downloader.js";
import { FormDataConverter } from "./utils/util/form_data_converter.js";
import { HeaderParamValidator } from "./utils/util/header_param_validator.js";
import { JSONConverter } from "./utils/util/json_converter.js";
import { StreamWrapper } from "./utils/util/stream_wrapper.js";
import { Utility } from "./utils/util/utility.js";
import { XMLConverter } from "./utils/util/xml_converter.js";
import { TextConverter } from "./utils/util/text_converter.js";
class OfficeIntegrator {
		Dc;
	ApiServer;
	V1;


	DBBuilder;
	DBStore;
	FileStore;
	TokenStore;

	OAuth2;
  	OAuth2Builder;
	Auth;
	AuthBuilder;
	AuthenticationSchema;
	ParsableEnum;
	Token;
	Location;
	AuthenticationType;

	APIHTTPConnector;
	APIResponse;

	SDKException;

	LogBuilder;
	Logger;
	Levels;
	SDKLogger;

	CommonAPIHandler;

	HeaderMap;
	Header;
	InitializeBuilder;
	Initializer;
	Param;
	ParameterMap;
	ProxyBuilder;
	RequestProxy;
	SDKConfigBuilder;
	SDKConfig;
	UserSignature;

	Choice;
	Constants;
	Converter;
	DataTypeConverter;
	Downloader;
	FormDataConverter;
	HeaderParamValidator;
	JSONConverter;
	StreamWrapper;
	Utility;
	XMLConverter;
	TextConverter;

  constructor() {
		this.Dc = Dc;
	this.ApiServer = ApiServer;
	this.V1 = V1;


	 this.DBBuilder = DBBuilder;
	this.DBStore = DBStore;
	this.FileStore = FileStore;
	this.TokenStore = TokenStore;

	this.OAuth2Builder = OAuth2Builder;
	this.OAuth2 = OAuth2;
	this.AuthBuilder = AuthBuilder;
	this.Auth = Auth;
	this.AuthenticationSchema = AuthenticationSchema;
	this.ParsableEnum = ParsableEnum;
	this.Token = Token;
	this.Location = Location;
	this.AuthenticationType = AuthenticationType;

	this.APIHTTPConnector = APIHTTPConnector;
	this.APIResponse = APIResponse;

	this.SDKException = SDKException;

	this.LogBuilder = LogBuilder;
	this.Logger = Logger;
	this.Levels = Levels;
	this.SDKLogger = SDKLogger;

	this.CommonAPIHandler = CommonAPIHandler;

	this.HeaderMap = HeaderMap;
	this.Header = Header;
	this.InitializeBuilder = InitializeBuilder;
	this.Initializer = Initializer;
	this.Param = Param;
	this.ParameterMap = ParameterMap;
	this.ProxyBuilder = ProxyBuilder;
	this.RequestProxy = RequestProxy;
	this.SDKConfigBuilder = SDKConfigBuilder;
	this.SDKConfig = SDKConfig;
	this.UserSignature = UserSignature;

	this.Choice = Choice;
	this.Constants = Constants;
	this.Converter = Converter;
	this.DataTypeConverter = DataTypeConverter;
	this.Downloader = Downloader;
	this.FormDataConverter = FormDataConverter;
	this.HeaderParamValidator = HeaderParamValidator;
	this.JSONConverter = JSONConverter;
	this.StreamWrapper = StreamWrapper;
	this.Utility = Utility;
	this.XMLConverter = XMLConverter;
	this.TextConverter = TextConverter;
  }
}
//
export default OfficeIntegrator;
//
export {
		Dc,
	ApiServer,
	V1,

	DBBuilder,
	DBStore,
	FileStore,
	TokenStore,
	OAuth2,
	OAuth2Builder,
	Auth,
	AuthBuilder,
	AuthenticationSchema,
	ParsableEnum,
	Token,
	Location,
	AuthenticationType,
	APIHTTPConnector,
	APIResponse,
	SDKException,
	LogBuilder,
	Logger,
	Levels,
	SDKLogger,
	CommonAPIHandler,
	HeaderMap,
	Header,
	InitializeBuilder,
	Initializer,
	Param,
	ParameterMap,
	ProxyBuilder,
	RequestProxy,
	SDKConfigBuilder,
	SDKConfig,
	UserSignature,
	Choice,
	Constants,
	Converter,
	DataTypeConverter,
	Downloader,
	FormDataConverter,
	HeaderParamValidator,
	JSONConverter,
	StreamWrapper,
	Utility,
	XMLConverter,
	TextConverter,
};
