const LinuxWifiConfigurationCapability = require("../linuxCapabilities/LinuxWifiConfigurationCapability");
const NimbusWifiConfiguration = require("../../../entities/core/NimbusWifiConfiguration");
const NimbusWifiStatus = require("../../../entities/core/NimbusWifiStatus");

/**
 * @extends LinuxWifiConfigurationCapability<import("../../MiioNimbusRobot")>
 */
class MiioWifiConfigurationCapability extends LinuxWifiConfigurationCapability {
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

        let res = await this.robot.sendCommand("miIO.info");

        if (typeof res === "object") {
            if (res.ap.bssid !== "") {
                output.state = NimbusWifiStatus.STATE.CONNECTED;
                output.details.ips = [res.netif.localIp];
                output.details.ssid = res.ap.ssid;
                output.details.frequency = NimbusWifiStatus.FREQUENCY_TYPE.W2_4Ghz;
                output.details.signal = res.ap.rssi;
            } else {
                output.state = NimbusWifiStatus.STATE.NOT_CONNECTED;
            }
        }

        return new NimbusWifiStatus(output);
    }

    /**
     * @param {import("../../../entities/core/NimbusWifiConfiguration")} wifiConfig
     * @returns {Promise<void>}
     */
    async setWifiConfiguration(wifiConfig) {
        if (
            wifiConfig?.ssid !== undefined &&
            wifiConfig.credentials?.type === NimbusWifiConfiguration.CREDENTIALS_TYPE.WPA2_PSK &&
            wifiConfig.credentials.typeSpecificSettings?.password !== undefined
        ) {
            if (!MiioWifiConfigurationCapability.IS_VALID_PARAMETER(wifiConfig.ssid)) {
                throw new Error(`SSID must not contain any of the following characters: ${INVALID_CHARACTERS.join(" ")}`);
            }

            if (!MiioWifiConfigurationCapability.IS_VALID_PARAMETER(wifiConfig.credentials.typeSpecificSettings.password)) {
                throw new Error(`Password must not contain any of the following characters: ${INVALID_CHARACTERS.join(" ")}`);
            }

            await this.robot.sendCommand(
                "miIO.config_router",
                {
                    "ssid": wifiConfig.ssid,
                    "passwd": wifiConfig.credentials.typeSpecificSettings.password,
                    "uid": 0,
                    "cc": "de",
                    "country_domain": "de",
                    "config_type": "app"
                },
                {
                    interface: "local" //This command will only work when received on the local interface!
                }
            );
        } else {
            throw new Error("Invalid wifiConfig");
        }
    }
}

MiioWifiConfigurationCapability.IS_VALID_PARAMETER = (password) => {
    return !(
        new RegExp(
            `[${INVALID_CHARACTERS.join("")}]`
        ).test(password)
    );
};

const INVALID_CHARACTERS = [
    ";",
    "\\",
    "/",
    "#",
    "'",
    "\""
];

module.exports = MiioWifiConfigurationCapability;
