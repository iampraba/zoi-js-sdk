/**
 * This class verifies and sets token to APIHTTPConnector instance.
 */
class Token {

    /**
     * This method is to set authentication token to APIHTTPConnector instance.
     * @param {APIHTTPConnector} urlConnection - A APIHTTPConnector class instance.
     * @param {Object} config
     * @throws {SDKException}
     */
    authenticate(urlConnection, config) { }

    remove() { }

    generateToken() { }

    getId() { }

    getAuthenticationSchema() { }

}
import { ParsableEnum, STORE }  from './parsable_enum.js';
class Location extends ParsableEnum {
    constructor(name) {
        super();
        this.name = name;
    }
    static parse(location)
    {
        return super.parse(Location, location);
    }

    toString() {
        return this.name;
    }
}

Location.values =[
    Location.HEADER = new Location('HEADER'),
    Location.PARAM = new Location('PARAM'),
    Location.VARIABLE = new Location('VARIABLE')
];

STORE.set(Location, new Map(Location.values.map(value => [value.name, value])));

class AuthenticationType extends ParsableEnum {
    constructor(name) {
        super();
        this.name = name;
    }

    static parse(type)
    {
        return super.parse(AuthenticationType, type);
    }
    toString() {
        return this.name;
    }
}

AuthenticationType.values = [
    AuthenticationType.OAUTH2 = new AuthenticationType('OAUTH2'),
    AuthenticationType.TOKEN = new AuthenticationType('TOKEN')
];

STORE.set(AuthenticationType, new Map(AuthenticationType.values.map(value => [value.name, value])));


export {
    Token as MasterModel,
    Token as Token,
    Location as Location,
    AuthenticationType as AuthenticationType
}
