const DreameMopNimbusRobot = require("./DreameMopNimbusRobot");
const DreameQuirkFactory = require("./DreameQuirkFactory");
const DreameNimbusRobot = require("./DreameNimbusRobot");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");

class DreameW10NimbusRobot extends DreameMopNimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        super(options);

        const QuirkFactory = new DreameQuirkFactory({
            robot: this
        });

        this.registerCapability(new QuirksCapability({
            robot: this,
            quirks: [
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.MOP_DOCK_MOP_ONLY_MODE),
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.MOP_DOCK_MOP_CLEANING_FREQUENCY),
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.MOP_DOCK_WET_DRY_SWITCH),
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.CARPET_DETECTION_SENSOR),
            ]
        }));
    }

    getModelName() {
        return "W10";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(DreameNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && deviceConf.model === "dreame.vacuum.p2027");
    }
}

module.exports = DreameW10NimbusRobot;
