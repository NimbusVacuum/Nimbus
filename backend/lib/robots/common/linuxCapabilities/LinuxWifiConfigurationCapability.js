const NotImplementedError = require("../../../core/NotImplementedError");
const spawnSync = require("child_process").spawnSync;
const Tools = require("../../../utils/Tools");
const NimbusWifiStatus = require("../../../entities/core/NimbusWifiStatus");
const WifiConfigurationCapability = require("../../../core/capabilities/WifiConfigurationCapability");

/**
 * @template {import("../../../core/NimbusRobot")} T
 * @extends WifiConfigurationCapability<T>
 */
class LinuxWifiConfigurationCapability extends WifiConfigurationCapability {
    /**
     * @param {object} options
     * @param {T} options.robot
     * @param {string} options.networkInterface
     *
     */
    constructor(options) {
        super(options);

        this.networkInterface = options.networkInterface;
    }

    /**
     * @returns {Promise<NimbusWifiStatus>}
     */
    async getWifiStatus() {
        if (this.robot.config.get("embedded") !== true) {
            throw new NotImplementedError("Linux Wi-Fi configuration capability only works on the robot itself");
        }

        /*
            root@rockrobo:~# iw
            Usage:  iw [options] command
            Do NOT screenscrape this tool, we don't consider its output stable.

            :-)
         */
        const iwOutput = spawnSync("iw", ["dev", this.networkInterface, "link"]).stdout.toString();
        const wifiStatus = this.parseIwStdout(iwOutput);

        //IPs are not part of the iw output
        if (wifiStatus.state === NimbusWifiStatus.STATE.CONNECTED) {
            wifiStatus.details.ips = Tools.GET_CURRENT_HOST_IP_ADDRESSES().sort().filter(ip => {
                return ip !== "127.0.0.1" && ip !== "::1";
            });
        }

        return wifiStatus;
    }

    /**
     * @param {import("../../../entities/core/NimbusWifiConfiguration")} wifiConfig
     * @returns {Promise<void>}
     * @abstract
     */
    async setWifiConfiguration(wifiConfig) {
        throw new NotImplementedError();
    }

    /**
     *
     * @param {string} stdout
     * @return {NimbusWifiStatus}
     */
    parseIwStdout(stdout) {
        const output = {
            state: NimbusWifiStatus.STATE.UNKNOWN,
            details: {}
        };

        // eslint-disable-next-line regexp/no-super-linear-backtracking,regexp/optimal-quantifier-concatenation
        const WIFI_CONNECTED_IW_REGEX = /^Connected to (?<bssid>[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}:[\da-f]{2}).*(?:[\n\r\u2028\u2029]\s*)?SSID: (?<ssid>.*)\s*freq: (?<freq>\d*)\s*signal: (?<signal>-\d{1,3}) dBm\s*tx bitrate: (?<txbitrate>[\d.]*).*/;
        const WIFI_NOT_CONNECTED_IW_REGEX = /^Not connected\.$/;

        const extractedWifiData = stdout.match(WIFI_CONNECTED_IW_REGEX);
        if (extractedWifiData) {
            output.state = NimbusWifiStatus.STATE.CONNECTED;
            output.details.upspeed = parseFloat(extractedWifiData.groups.txbitrate);
            output.details.signal = parseInt(extractedWifiData.groups.signal);
            output.details.ssid = extractedWifiData.groups.ssid.trim();
            output.details.bssid = extractedWifiData.groups.bssid.trim();
            output.details.frequency = NimbusWifiStatus.FREQUENCY_TYPE.W2_4Ghz;
        } else if (stdout.trim().match(WIFI_NOT_CONNECTED_IW_REGEX)) {
            output.state = NimbusWifiStatus.STATE.NOT_CONNECTED;
        }

        return new NimbusWifiStatus(output);
    }
}

module.exports = LinuxWifiConfigurationCapability;
