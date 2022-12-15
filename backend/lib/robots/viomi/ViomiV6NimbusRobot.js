const capabilities = require("./capabilities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");
const ViomiQuirkFactory = require("./ViomiQuirkFactory");
const ViomiNimbusRobot = require("./ViomiNimbusRobot");

class ViomiV6NimbusRobot extends ViomiNimbusRobot {
    /**
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     * @param {object} [options.fanSpeeds]
     * @param {object} [options.waterGrades]
     */
    constructor(options) {
        super(options);

        this.registerCapability(new capabilities.ViomiVoicePackManagementCapability({
            robot: this
        }));

        const quirkFactory = new ViomiQuirkFactory({
            robot: this
        });
        this.registerCapability(new QuirksCapability({
            robot: this,
            quirks: [
                quirkFactory.getQuirk(ViomiQuirkFactory.KNOWN_QUIRKS.BUTTON_LEDS),
                quirkFactory.getQuirk(ViomiQuirkFactory.KNOWN_QUIRKS.MOP_PATTERN)
            ]
        }));
    }

    getModelName() {
        return "V6";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(ViomiNimbusRobot.DEVICE_CONF_PATH);
        return !!(deviceConf && deviceConf.model === "viomi.vacuum.v6");
    }
}

module.exports = ViomiV6NimbusRobot;
