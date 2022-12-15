const NimbusNTPClientState = require("./NimbusNTPClientState");

class NimbusNTPClientDisabledState extends NimbusNTPClientState {
    /**
     * The NTP Client is disabled
     * 
     * @param {object} options
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);
    }
}

module.exports = NimbusNTPClientDisabledState;
