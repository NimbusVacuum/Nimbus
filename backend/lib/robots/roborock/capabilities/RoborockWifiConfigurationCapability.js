const MiioWifiConfigurationCapability = require("../../common/miioCapabilities/MiioWifiConfigurationCapability");
const NimbusWifiStatus = require("../../../entities/core/NimbusWifiStatus");

class RoborockWifiConfigurationCapability extends MiioWifiConfigurationCapability {
    /**
     * @returns {Promise<NimbusWifiStatus>}
     */
    async getWifiStatus() {
        if (this.robot.config.get("embedded") === true) {
            return super.getWifiStatus();
        }

        const output = {
            state: NimbusWifiStatus.STATE.UNKNOWN,
            details: {}
        };

        let res = await this.robot.sendCommand("get_network_info");

        if (res !== "unknown_method") {
            if (typeof res === "object" && res.bssid !== "") {
                output.state = NimbusWifiStatus.STATE.CONNECTED;

                output.details.signal = parseInt(res.rssi);
                output.details.ips = [res.ip];
                output.details.ssid = res.ssid;
                output.details.frequency = NimbusWifiStatus.FREQUENCY_TYPE.W2_4Ghz;
            } else {
                output.details.state = NimbusWifiStatus.STATE.NOT_CONNECTED;
            }
        }

        return new NimbusWifiStatus(output);
    }
}

module.exports = RoborockWifiConfigurationCapability;
