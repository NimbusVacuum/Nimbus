const capabilities = require("./capabilities");
const entities = require("../../entities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");
const RoborockQuirkFactory = require("./RoborockQuirkFactory");
const RoborockNimbusRobot = require("./RoborockNimbusRobot");
const NimbusRestrictedZone = require("../../entities/core/NimbusRestrictedZone");

class RoborockS6NimbusRobot extends RoborockNimbusRobot {
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
            robot: this,
            supportedRestrictedZoneTypes: [
                NimbusRestrictedZone.TYPE.REGULAR,
                NimbusRestrictedZone.TYPE.MOP
            ]
        }));
        this.registerCapability(new capabilities.RoborockMultiMapPersistentMapControlCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMultiMapMapResetCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapSegmentationCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapSegmentEditCapability({
            robot: this
        }));
        this.registerCapability(new capabilities.RoborockMapSegmentRenameCapability({
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
        return "S6";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(RoborockNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && (deviceConf.model === "roborock.vacuum.s6" || deviceConf.model === "roborock.vacuum.t6"));
    }
}

const FAN_SPEEDS = {
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.LOW]: 101,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 102,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.HIGH]: 103,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MAX]: 104,
    [entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.OFF] : 105 //also known as mop mode
};

module.exports = RoborockS6NimbusRobot;
