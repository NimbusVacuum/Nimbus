const SerializableEntity = require("../SerializableEntity");

class NimbusSensor extends SerializableEntity {
    /**
     * @param {object} options
     * @param {NimbusSensorType} options.type
     * @param {NimbusSensorSubType} [options.subType]
     * @param {any} options.value
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);

        this.type = options.type;
        this.subType = options.subType;
        this.value = options.value;
        this.metadata = options.metaData;
    }
}

/**
 *  @typedef {string} NimbusSensorType
 *  @enum {string}
 *
 */
NimbusSensor.TYPE = Object.freeze({
    ALL: "all",
    ACCELEROMETER: "accelerometer",
    GYROSCOPE: "gyroscope",
    BUMPER: "bumper",
    CLIFF: "cliff",
    LIDAR: "lidar",
});

/**
 *  @typedef {string} NimbusSensorSubType
 *  @enum {string}
 *
 */
NimbusSensor.SUB_TYPE = Object.freeze({
});

module.exports = NimbusSensor;
