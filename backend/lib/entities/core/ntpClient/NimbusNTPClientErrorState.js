const NimbusNTPClientState = require("./NimbusNTPClientState");

class NimbusNTPClientErrorState extends NimbusNTPClientState {
    /**
     * The NTP sync aborted with type, message at timestamp
     * 
     * @param {object}  options
     * @param {NimbusNTPClientErrorType} options.type
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

/**
 *  @typedef {string} NimbusNTPClientErrorType
 *  @enum {string}
 *
 */
NimbusNTPClientErrorState.ERROR_TYPE = Object.freeze({
    UNKNOWN: "unknown",
    TRANSIENT: "transient",
    NAME_RESOLUTION: "name_resolution",
    CONNECTION: "connection",
    PERSISTING: "persisting"
});

module.exports = NimbusNTPClientErrorState;
