const SerializableEntity = require("../SerializableEntity");

class NimbusDataPoint extends SerializableEntity {
    /**
     * @param {object} options
     * @param {object} [options.metaData]
     * @param {Date} [options.timestamp]
     * @param {NimbusDataPointType} options.type
     * @param {number} options.value
     */
    constructor(options) {
        super(options);

        this.timestamp = options.timestamp ?? new Date();

        this.type = options.type;
        this.value = options.value;
    }
}

/**
 *
 * @typedef {string} NimbusDataPointType
 * @enum {string}
 */
NimbusDataPoint.TYPES = Object.freeze({
    COUNT: "count",
    TIME: "time", //in seconds
    AREA: "area" //in cm²
});

module.exports = NimbusDataPoint;
