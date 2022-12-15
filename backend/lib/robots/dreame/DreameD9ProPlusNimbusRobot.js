const DreameD9NimbusRobot = require("./DreameD9NimbusRobot");
const DreameNimbusRobot = require("./DreameNimbusRobot");
const fs = require("fs");
const MiioNimbusRobot = require("../MiioNimbusRobot");

/**
 *  There is no such thing as a D9 Pro+
 *  This implementation is used by D9 Pros that use a backported D9 firmware
 */
class DreameD9ProPlusNimbusRobot extends DreameD9NimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        super(options);
    }

    getModelName() {
        return "D9 Pro+";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(DreameNimbusRobot.DEVICE_CONF_PATH);
        const isD9Pro = !!(deviceConf && deviceConf.model === "dreame.vacuum.p2187");

        return isD9Pro && fs.existsSync("/etc/dustbuilder_backport");
    }
}

module.exports = DreameD9ProPlusNimbusRobot;
