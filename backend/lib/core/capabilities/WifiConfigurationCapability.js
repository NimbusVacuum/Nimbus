const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

/**
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class WifiConfigurationCapability extends Capability {
    /**
     * @abstract
     * @returns {Promise<import("../../entities/core/NimbusWifiStatus")>}
     */
    async getWifiStatus() {
        throw new NotImplementedError();
    }

    /**
     * @abstract
     * @param {import("../../entities/core/NimbusWifiConfiguration")} wifiConfig
     * @returns {Promise<void>}
     */
    async setWifiConfiguration(wifiConfig) {
        throw new NotImplementedError();
    }

    getType() {
        return WifiConfigurationCapability.TYPE;
    }

    /**
     * @return {{provisionedReconfigurationSupported: boolean}}
     */
    getProperties() {
        return {
            provisionedReconfigurationSupported: false
        };
    }
}

WifiConfigurationCapability.TYPE = "WifiConfigurationCapability";

module.exports = WifiConfigurationCapability;
