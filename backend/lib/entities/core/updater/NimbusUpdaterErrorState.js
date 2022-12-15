const NimbusUpdaterState = require("./NimbusUpdaterState");

class NimbusUpdaterErrorState extends NimbusUpdaterState {
    /**
     * The update process aborted with type, message at timestamp
     *
     * @param {object}  options
     * @param {import("../../../updater/lib/NimbusUpdaterError").NimbusUpdaterErrorType} options.type
     * @param {string}  options.message
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);

        this.type = options.type;
        this.message = options.message;
    }
}

module.exports = NimbusUpdaterErrorState;
