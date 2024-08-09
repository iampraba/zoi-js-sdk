# Zoho Office Integrator NodeJS SDK

[![NPM version](https://img.shields.io/npm/v/zoi-nodejs-sdk.svg)](https://www.npmjs.com/package/zoi-nodejs-sdk)
[![NPM downloads](https://img.shields.io/npm/dm/zoi-nodejs-sdk.svg)](https://www.npmjs.com/package/zoi-nodejs-sdk)

## Table Of Contents

* [Getting Started](#Getting-Started)
* [Registering a Zoho Office Integrator APIKey](#registering-a-zoho-office-integrator-apikey)
* [Environmental Setup](#environmental-setup)
* [Including the SDK in your project](#including-the-sdk-in-your-project)
* [Configuration](#configuration)
* [Initialization](#initializing-the-application)
* [Responses And Exceptions](#responses-and-exceptions)
* [Sample Code](#sdk-sample-code)
* [Release Notes](#release-notes)
* [License](#license)

## Getting Started

Zoho Office Integrator NodeJS SDK used to help you quickly integrator Zoho Office Integrator editors in side your web application.

## Registering a Zoho Office Integrator APIKey

Since Zoho Office Integrator APIs are authenticated with apikey, you should register your with Zoho to get an apikey. To register your app:

- Visit this page [https://officeintegrator.zoho.com/](https://officeintegrator.zoho.com). ( Sign-up for a Zoho Account if you don't have one)

- Enter your company name and short discription about how you are going to using zoho office integrator in your application. Choose the type of your application(commerial or non-commercial) and generate the apikey.

- After filling above details, create an account in Zoho Office Integrator service and copy the apikey from the dashboard.

## Environmental Setup

NodeJS SDK is installable through **npm**. **npm** is a tool for dependency management in NodeJS. SDK expects the following from the client app.

- Client app must have Node(version 12 and above)

- NodeJS SDK must be installed into client app through **npm**.

## Including the SDK in your project

You can include the SDK to your project using:

- Install **Node** from [nodejs.org](https://nodejs.org/en/download/) (if not installed).

- Installing **Office Integrator NodeJS SDK**
    - Navigate to the workspace of your client app.
    - Run the command below:
        ```sh
        npm install @zoho/office-integrator-sdk
        ```
    - Or add **@zoho/office-integrator-sdk** in dependencies section of your projects's package.json with the latest version (recommended)
        - Run **npm install** in the directory, which installs all the dependencies mentioned in package.json.
    - The NodeJS SDK will be installed and a package named **/@zoho/office-integrator-sdk-1.\*.\*** will be created in the local machine.

## Configuration

Before you get started with creating your NodeJS application, you need to register with Zoho Office Integrator to get an apikey for authentication. 

| Mandatory Keys    | Optional Keys |
| :---------------- | :------------ |
| environment, apikey | logger        |
-------------------------------------

- Configure API environment which decides the domain and the URL to make API calls.

    ```js
    /*
     * Refer this help page for api end point domain details -  https://www.zoho.com/officeintegrator/api/v1/getting-started.html
    */
    let environment = await new SDK.ApiServer.Production("https://api.office-integrator.com");
    ```

- Use below script to configure your apikey that you get from [Zoho Office Integrator](https://officeintegrator.zoho.com) dashboard.

    ```js
    /**
     * You can configure where the apikey needs to added in the request object.
     * To add apikey to params - addParam("apikey", "<your register apikey from https://www.zoho.com/officeintegrator >")
     */
     let auth = new SDK.AuthBuilder()
        .addParam("apikey", "2ae438cf864488657cc9754a27daa480") //Update this apikey with your own apikey signed up in office inetgrator service
        .authenticationSchema(await new SDK.V1.Authentication().getTokenFlow())
        .build();
    let tokens = [ auth ];
    ```

- Create an instance of **Logger** Class to log exception and API information. By default, the SDK constructs a Logger instance with level - INFO and file_path - (sdk_logs.log parallel to node_modules)

    ```js
    /*
    * Create an instance of Logger Class that requires the following
    * level -> Level of the log messages to be logged. Can be configured by typing Levels "." and choose any level from the list displayed.
    * filePath -> Absolute file path, where messages need to be logged.
    */
    let logger = new SDK.LogBuilder()
        .level(SDK.Levels.INFO)
        //.filePath("<file absolute path where logs would be written>") //No I18N
        .build();
    ```

## Initializing the Application

Initialize the SDK using the following code.

```js
import * as SDK from "@zoho/office-integrator-sdk";
import { readFileSync } from 'fs';
const __dirname = import.meta.dirname;

class Initializer {

    //Include office-integrator-sdk package in your package json and the execute this code.

    static async initializeSdk() {

        // Refer this help page for api end point domain details -  https://www.zoho.com/officeintegrator/api/v1/getting-started.html
        let environment = await new SDK.ApiServer.Production("https://api.office-integrator.com");

        let auth = new SDK.AuthBuilder()
            .addParam("apikey", "2ae438cf864488657cc9754a27daa480") //Update this apikey with your own apikey signed up in office inetgrator service
            .authenticationSchema(await new SDK.V1.Authentication().getTokenFlow())
            .build();

        let tokens = [ auth ];

        //Sdk application log configuration
        let logger = new SDK.LogBuilder()
            .level(SDK.Levels.INFO)
            //.filePath("<file absolute path where logs would be written>") //No I18N
            .build();

        let initialize = await new SDK.InitializeBuilder();

        await initialize.environment(environment).tokens(tokens).logger(logger).initialize();

        console.log("SDK initialized successfully.");
    }
}

Initializer.initializeSdk();
```

- You can now access the functionalities of the SDK. Refer to the sample codes to make various API calls through the SDK.

## Responses and Exceptions

All SDK method calls return an instance of **[APIResponse](routes/controllers/api_response.js)**.

After a successful API request, the **getObject()** method returns an instance of the ResponseWrapper (for **GET**) or the ActionWrapper (for **POST, PUT, DELETE**).

Whenever the API returns an error response, the **getObject()** returns an instance of **APIException** class.

**ResponseWrapper** (for **GET** requests) and ActionWrapper (for **POST, PUT, DELETE** requests) are the expected objects for Zoho Office Integrator APIs’ responses

### GET Requests

- The **getObject()** returns instance of one of the following classes, based on the return type.
    - For  **application/json** responses
        - **SessionInfo**
        - **InvalidConfigurationException**

### POST, PUT, DELETE Requests

- The **getObject()** returns instance of one of the following classes
    - **CreateDocumentResponse**
    - **CreateSheetResponse**
    - **InvaildConfigurationException**

All other exceptions such as SDK anomalies and other unexpected behaviours are thrown under the **[SDKException](routes/exception/sdk_exception.js)** class.

## SDK Sample code

Make sure you have [intialized the sdk](#initializing-the-application) before running below sample code snippet.


```js
import * as SDK from "@zoho/office-integrator-sdk";

class ZohoWriter {

    static async createDocument() {
        try {
            var sdk_operations = new SDK.V1.V1Operations();
            var create_document_parameters = new SDK.V1.CreateDocumentParameters();

            var writer_response = await sdk_operations.createDocument(create_document_parameters);

            console.log(writer_response);
        } catch (error) {
            console.log(error);
        }
    }
}

ZohoWriter.createDocument();
```

Refer this **[repository](https://github.com/zoho/office-integrator-nodejs-sdk-examples)** for example codes to all Office Integrator API endpoints.


## Release Notes

*Version 1.0.0*

- Based version released

## License

This SDK is distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0), see LICENSE.txt for more information.