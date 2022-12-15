const SerializableEntity = require("../SerializableEntity");

/**
 * @class NimbusVoicePackOperationStatus
 * @property {NimbusVoicePackOperationStatusType} type
 * @property {number} [progress]
 */
class NimbusVoicePackOperationStatus extends SerializableEntity {
    /**
     * This entity represents the status of a voice pack operation.
     *
     * @param {object} options
     * @param {NimbusVoicePackOperationStatusType} options.type
     * @param {number} [options.progress] represents the download or installation progress in the range 0-100
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);

        this.type = options.type;
        this.progress = options.progress;
    }
}

/**
 *  @typedef {string} NimbusVoicePackOperationStatusType
 *  @enum {string}
 *
 */
NimbusVoicePackOperationStatus.TYPE = Object.freeze({
    IDLE: "idle",
    DOWNLOADING: "downloading",
    INSTALLING: "installing",
    ERROR: "error"
});

module.exports = NimbusVoicePackOperationStatus;
