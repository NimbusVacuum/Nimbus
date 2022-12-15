const SerializableEntity = require("../SerializableEntity");

class NimbusRobotError extends SerializableEntity {
    /**
     * @param {object} options
     * @param {object} [options.metaData]
     * 
     * @param {object} options.severity
     * @param {NimbusRobotErrorSeverityKind} options.severity.kind
     * @param {NimbusRobotErrorSeverityLevel} options.severity.level
     * @param {NimbusRobotErrorSubsystem} options.subsystem
     * 
     * @param {string} options.message
     * @param {string} options.vendorErrorCode
     */
    constructor(options) {
        super(options);

        this.severity = options.severity;
        this.subsystem = options.subsystem;

        this.message = options.message;
        this.vendorErrorCode = options.vendorErrorCode;
    }
}

/**
 *  @typedef {string} NimbusRobotErrorSeverityKind
 *  @enum {string}
 *
 */
NimbusRobotError.SEVERITY_KIND = Object.freeze({
    TRANSIENT: "transient",
    PERMANENT: "permanent",

    UNKNOWN: "unknown",

    NONE: "none"
});

/**
 *  @typedef {string} NimbusRobotErrorSeverityLevel
 *  @enum {string}
 *
 */
NimbusRobotError.SEVERITY_LEVEL = Object.freeze({
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
    CATASTROPHIC: "catastrophic",

    UNKNOWN: "unknown",

    NONE: "none"
});

/**
 *  @typedef {string} NimbusRobotErrorSubsystem
 *  @enum {string}
 *
 */
NimbusRobotError.SUBSYSTEM = Object.freeze({
    CORE: "core",
    POWER: "power",
    SENSORS: "sensors",
    MOTORS: "motors",
    NAVIGATION: "navigation",
    ATTACHMENTS: "attachments",
    DOCK: "dock",

    UNKNOWN: "unknown",

    NONE: "none"
});

module.exports = NimbusRobotError;
