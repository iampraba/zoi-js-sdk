
/**
 * This class represents the Zoho User.
 */
class UserSignature {

	_name;

	/**
	 * Creates an UserSignature class instance with the specified user name.
	 * @param {string} name - A String containing the Zoho user name.
	 */
	constructor(name) {

		this._name = name;
	}

	/**
	 * This is a getter method to get user name.
	 * @returns {string} A String representing the Zoho user name.
	 */
	getName() {
		return this._name;
	}
}

export {
	UserSignature as MasterModel,
	UserSignature as UserSignature
}