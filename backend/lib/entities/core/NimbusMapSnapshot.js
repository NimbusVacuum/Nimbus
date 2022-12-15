const SerializableEntity = require("../SerializableEntity");

// noinspection JSCheckFunctionSignatures
class NimbusMapSnapshot extends SerializableEntity {
    /**
     *
     * @param {object} options
     * @param {string} options.id
     * @param {Date} [options.timestamp]
     * @param {import("../map/NimbusMap")} [options.map]
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);

        this.id = options.id;
        this.timestamp = options.timestamp;
        this.map = options.map;
    }
}

module.exports = NimbusMapSnapshot;
