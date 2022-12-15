const capabilities = require("./capabilities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");
const RoborockGen4NimbusRobot = require("./RoborockGen4NimbusRobot");
const RoborockQuirkFactory = require("./RoborockQuirkFactory");
const RoborockNimbusRobot = require("./RoborockNimbusRobot");

class RoborockS4MaxNimbusRobot extends RoborockGen4NimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        super(options);

        this.registerCapability(new capabilities.RoborockCombinedVirtualRestrictionsCapability({
            robot: this
        }));

        const quirkFactory = new RoborockQuirkFactory({
            robot: this
        });
        this.registerCapability(new QuirksCapability({
            robot: this,
            quirks: [
                quirkFactory.getQuirk(RoborockQuirkFactory.KNOWN_QUIRKS.BUTTON_LEDS)
            ]
        }));
    }
    getModelName() {
        return "S4 Max";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(RoborockNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && deviceConf.model === "roborock.vacuum.a19");
    }
}

module.exports = RoborockS4MaxNimbusRobot;
