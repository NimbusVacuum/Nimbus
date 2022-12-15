const SerializableEntity = require("../SerializableEntity");

class NimbusWifiConfiguration extends SerializableEntity {
    /**
     * @param {object} options
     * @param {string} options.ssid
     * @param {object} options.credentials
     * @param {NimbusWifiConfigurationCredentialsType} options.credentials.type
     * @param {object} options.credentials.typeSpecificSettings //e.g. key or user/password
     * @param {object} [options.metaData]
     *
     * @class
     */
    constructor(options) {
        super(options);

        this.ssid = options.ssid;
        this.credentials = options.credentials;
    }
}

/**
 *  @typedef {string} NimbusWifiConfigurationCredentialsType
 *  @enum {string}
 *
 */
NimbusWifiConfiguration.CREDENTIALS_TYPE = Object.freeze({
    WPA2_PSK: "wpa2_psk"
});

module.exports = NimbusWifiConfiguration;
