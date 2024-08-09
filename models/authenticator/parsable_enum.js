class ParsableEnum {
    static parse(cl, value) {
        if (!cl || typeof cl !== 'function' || !cl.hasOwnProperty('values')) {
            throw new Error('Given class is not an enum');
        }
        const enumMap = STORE.get(cl);
        if (!enumMap) {
            throw new Error('Enum class not registered');
        }
        const enumValue = enumMap.get(value);
        if (!enumValue) {
            throw new Error(`Given value '${value}' is not a valid '${cl.name}'`);
        }
        return enumValue;
    }
}

const STORE = new Map();

export { ParsableEnum as MasterModel, ParsableEnum as ParsableEnum, STORE }