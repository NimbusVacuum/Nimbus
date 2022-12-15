const capabilities = require("./capabilities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");
const ViomiQuirkFactory = require("./ViomiQuirkFactory");
const ViomiNimbusRobot = require("./ViomiNimbusRobot");

class ViomiV8NimbusRobot extends ViomiNimbusRobot {
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
                quirkFactory.getQuirk(ViomiQuirkFactory.KNOWN_QUIRKS.BUTTON_LEDS)
            ]
        }));
    }

    getModelName() {
        return "V8";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(ViomiNimbusRobot.DEVICE_CONF_PATH);
        return !!(deviceConf && ["viomi.vacuum.v8", "viomi.vacuum.v9"].includes(deviceConf.model));
    }
}

module.exports = ViomiV8NimbusRobot;
