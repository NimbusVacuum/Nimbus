const NimbusUpdaterState = require("./NimbusUpdaterState");

class NimbusUpdaterDisabledState extends NimbusUpdaterState {
    /**
     *
     * @param {object} options
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);
    }
}

module.exports = NimbusUpdaterDisabledState;
