const capabilities = require("./capabilities");
const entities = require("../../entities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const RoborockNimbusRobot = require("./RoborockNimbusRobot");

class RoborockM1SNimbusRobot extends RoborockNimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        super(Object.assign({}, options, {fanSpeeds: FAN_SPEEDS}));

        this.registerCapability(new capabilities.RoborockMapSnapshotCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockCombinedVirtualRestrictionsCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockPersistentMapControlCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapResetCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapSegmentSimpleCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapSegmentEditCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapSegmentRenameCapability({
            robot: this
        }));
    }

    setEmbeddedParameters() {
        this.deviceConfPath = RoborockM1SNimbusRobot.DEVICE_CONF_PATH;
        this.tokenFilePath = RoborockM1SNimbusRobot.TOKEN_FILE_PATH;
    }

    getModelName() {
        return "M1S";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(RoborockNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && deviceConf.model === "roborock.vacuum.m1s");
    }
}

RoborockM1SNimbusRobot.DEVICE_CONF_PATH = "/mnt/default/device.conf";
RoborockM1SNimbusRobot.TOKEN_FILE_PATH = "/data/miio/device.token";

const FAN_SPEEDS = {
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.LOW]: 101,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 102,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.HIGH]: 103,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MAX]: 104,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.OFF] : 105 //also known as mop mode
};

module.exports = RoborockM1SNimbusRobot;
