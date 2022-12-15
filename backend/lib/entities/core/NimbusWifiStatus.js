const SerializableEntity = require("../SerializableEntity");

/*
    Further expansion could include the Wi-Fi channel used
 */

class NimbusWifiStatus extends SerializableEntity {
    /**
     * @param {object} options
     * @param {NimbusWifiState} options.state
     * @param {object} options.details
     * @param {string} [options.details.ssid]
     * @param {string} [options.details.bssid]
     * @param {number} [options.details.downspeed] unit: mbps
     * @param {number} [options.details.upspeed] unit: mbps
     * @param {number} [options.details.signal] unit: dBm
     * @param {Array<string>} [options.details.ips] all the ips that we can find
     * @param {NimbusWifiStatusFrequencyType} [options.details.frequency]
     * @param {object} [options.metaData]
     *
     * @class
     */
    constructor(options) {
        super(options);

        this.state = options.state;
        this.details = options.details;
    }
}

/**
 *  @typedef {string} NimbusWifiStatusFrequencyType
 *  @enum {string}
 *
 */
NimbusWifiStatus.FREQUENCY_TYPE = Object.freeze({
    W2_4Ghz: "2.4ghz", //Cannot start with a number. Therefore, prefixed with w
    W5Ghz: "5ghz"
});

/**
 *  @typedef {string} NimbusWifiState
 *  @enum {string}
 *
 */
NimbusWifiStatus.STATE = Object.freeze({
    CONNECTED: "connected",
    NOT_CONNECTED: "not_connected",
    UNKNOWN: "unknown"
});

module.exports = NimbusWifiStatus;
