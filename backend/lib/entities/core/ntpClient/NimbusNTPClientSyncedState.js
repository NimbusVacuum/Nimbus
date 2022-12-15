const NimbusNTPClientState = require("./NimbusNTPClientState");

class NimbusNTPClientSyncedState extends NimbusNTPClientState {
    /**
     * The NTP sync has been successful at timestamp with offset from previous vacuum time
     * 
     * @param {object}  options
     * @param {number}  options.offset
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);

        this.offset = options.offset;
    }
}

module.exports = NimbusNTPClientSyncedState;
