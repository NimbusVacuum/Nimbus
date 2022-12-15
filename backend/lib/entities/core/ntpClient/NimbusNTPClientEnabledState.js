const NimbusNTPClientState = require("./NimbusNTPClientState");

class NimbusNTPClientEnabledState extends NimbusNTPClientState {
    /**
     * The NTP Client is enabled but there hasn't been an attempt to sync yet
     * 
     * @param {object} options
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);
    }
}

module.exports = NimbusNTPClientEnabledState;
