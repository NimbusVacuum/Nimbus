const entities = require("../../entities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const RoborockNimbusRobot = require("./RoborockNimbusRobot");

class RoborockV1NimbusRobot extends RoborockNimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        super(Object.assign({}, options, {fanSpeeds: FAN_SPEEDS}));
    }

    getModelName() {
        return "V1";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(RoborockNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && deviceConf.model === "rockrobo.vacuum.v1");
    }
}

const FAN_SPEEDS = {
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MIN]: 1,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.LOW]: 38,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 60,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.HIGH]: 75,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MAX]: 100
};

module.exports = RoborockV1NimbusRobot;
