class NimbusUpdaterError extends Error {
    /**
     * 
     * @param {NimbusUpdaterErrorType} type
     * @param {string} message
     */
    constructor(type, message) {
        super(message);
        this.name = "NimbusUpdaterError";

        this.type = type;
    }
}

/**
 *  @typedef {string} NimbusUpdaterErrorType
 *  @enum {string}
 *
 */
NimbusUpdaterError.ERROR_TYPE = Object.freeze({
    UNKNOWN: "unknown",
    NOT_EMBEDDED: "not_embedded",
    NOT_DOCKED: "not_docked",
    NOT_WRITABLE: "not_writable",
    NOT_ENOUGH_SPACE: "not_enough_space",
    DOWNLOAD_FAILED: "download_failed",
    NO_RELEASE: "no_release",
    NO_MATCHING_BINARY: "no_matching_binary",
    INVALID_CHECKSUM: "invalid_checksum",
});

module.exports = NimbusUpdaterError;
