const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");
const ViomiQuirkFactory = require("./ViomiQuirkFactory");
const ViomiNimbusRobot = require("./ViomiNimbusRobot");

class ViomiV7NimbusRobot extends ViomiNimbusRobot {
    /**
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     * @param {object} [options.fanSpeeds]
     * @param {object} [options.waterGrades]
     */
    constructor(options) {
        super(options);

        const quirkFactory = new ViomiQuirkFactory({
            robot: this
        });
        this.registerCapability(new QuirksCapability({
            robot: this,
            quirks: [
                quirkFactory.getQuirk(ViomiQuirkFactory.KNOWN_QUIRKS.BUTTON_LEDS)
            ]
        }));
    }

    getModelName() {
        return "V7";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(ViomiNimbusRobot.DEVICE_CONF_PATH);
        return !!(deviceConf && deviceConf.model === "viomi.vacuum.v7");
    }
}

module.exports = ViomiV7NimbusRobot;
