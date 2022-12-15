const NimbusEvent = require("./NimbusEvent");

class PendingMapChangeNimbusEvent extends NimbusEvent {
    /**
     *
     * @param {object}   options
     * @param {object}  [options.metaData]
     * @class
     */
    constructor(options) {
        super(Object.assign({}, options, {id: "pending_map_change"}));
    }
}

module.exports = PendingMapChangeNimbusEvent;
