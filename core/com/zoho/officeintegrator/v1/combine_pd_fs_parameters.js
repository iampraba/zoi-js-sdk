import {SDKException} from "../../../../../routes/exception/sdk_exception.js";
import {Constants} from "../../../../../utils/util/constants.js";

class CombinePDFsParameters{

	inputOptions;
	outputSettings;
	keyModified = new Map();
	/**
	 * The method to get the inputOptions
	 * @returns {Map} A Map representing the inputOptions
	 */
	getInputOptions()	{
		return this.inputOptions;

	}

	/**
	 * The method to set the value to inputOptions
	 * @param {Map} inputOptions A Map representing the inputOptions
	 */
	setInputOptions(inputOptions)	{
		if((inputOptions != null) && (!(Object.prototype.toString.call(inputOptions) == "[object Map]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: inputOptions EXPECTED TYPE: Map", null, null);
		}
		this.inputOptions = inputOptions;
		this.keyModified.set("input_options", 1);

	}

	/**
	 * The method to get the outputSettings
	 * @returns {CombinePDFsOutputSettings} An instance of CombinePDFsOutputSettings
	 */
	getOutputSettings()	{
		return this.outputSettings;

	}

	/**
	 * The method to set the value to outputSettings
	 * @param {CombinePDFsOutputSettings} outputSettings An instance of CombinePDFsOutputSettings
	 */
	async setOutputSettings(outputSettings)	{
		const CombinePdFsOutputSettings = (await (import("./combine_pd_fs_output_settings.js"))).MasterModel;
		if((outputSettings != null) && (!(outputSettings instanceof CombinePDFsOutputSettings)))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: outputSettings EXPECTED TYPE: CombinePDFsOutputSettings", null, null);
		}
		this.outputSettings = outputSettings;
		this.keyModified.set("output_settings", 1);

	}

	/**
	 * The method to check if the user has modified the given key
	 * @param {String} key A String representing the key
	 * @returns {number} A number representing the modification
	 */
	isKeyModified(key)	{
		if((key != null) && (!(Object.prototype.toString.call(key) == "[object String]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: key EXPECTED TYPE: String", null, null);
		}
		if(this.keyModified.has(key))	{
			return this.keyModified.get(key);
		}
		return null;

	}

	/**
	 * The method to mark the given key as modified
	 * @param {String} key A String representing the key
	 * @param {number} modification A number representing the modification
	 */
	setKeyModified(key, modification)	{
		if((key != null) && (!(Object.prototype.toString.call(key) == "[object String]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: key EXPECTED TYPE: String", null, null);
		}
		if((modification != null) && (!(Object.prototype.toString.call(modification) == "[object Number]")))	{
			throw new SDKException(Constants.DATA_TYPE_ERROR, "KEY: modification EXPECTED TYPE: number", null, null);
		}
		this.keyModified.set(key, modification);

	}


}
export {
	CombinePDFsParameters as MasterModel,
	CombinePDFsParameters as CombinePDFsParameters
}
