const NimbusUpdaterState = require("./NimbusUpdaterState");

class NimbusUpdaterNoUpdateRequiredState extends NimbusUpdaterState {
    /**
     *
     * @param {object} options
     * @param {object} [options.metaData]
     *
     * @param {string} options.currentVersion The currently running nimbus version
     * @param {string} [options.changelog] Github flavoured Markdown
     * @class
     */
    constructor(options) {
        super(options);

        this.currentVersion = options.currentVersion;
        this.changelog = options.changelog;
    }
}

module.exports = NimbusUpdaterNoUpdateRequiredState;
