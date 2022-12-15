const NimbusUpdaterState = require("./NimbusUpdaterState");

class NimbusUpdaterIdleState extends NimbusUpdaterState {
    /**
     *
     * @param {object} options
     * @param {object} [options.metaData]
     *
     * @param {string} options.currentVersion The currently running nimbus version
     * @class
     */
    constructor(options) {
        super(options);

        this.currentVersion = options.currentVersion;
    }
}

module.exports = NimbusUpdaterIdleState;
