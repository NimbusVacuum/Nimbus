const DreameGen2NimbusRobot = require("./DreameGen2NimbusRobot");

const capabilities = require("./capabilities");
const DreameNimbusRobot = require("./DreameNimbusRobot");
const entities = require("../../entities");
const NimbusSelectionPreset = require("../../entities/core/NimbusSelectionPreset");

class DreameGen2VSlamNimbusRobot extends DreameGen2NimbusRobot {
    constructor(options) {
        super(options);

        //Looks like this is always enabled for LIDAR robots but a toggle for vSlam ones?
        this.registerCapability(new capabilities.DreamePersistentMapControlCapability({
            robot: this,
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.PERSISTENT_MAPS.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.PERSISTENT_MAPS.PROPERTIES.ENABLED.PIID
        }));

        this.registerCapability(new capabilities.DreameWaterUsageControlCapability({
            robot: this,
            presets: Object.keys(DreameNimbusRobot.WATER_GRADES).map(k => {
                return new NimbusSelectionPreset({name: k, value: DreameNimbusRobot.WATER_GRADES[k]});
            }),
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.WATER_USAGE.PIID
        }));

        this.registerCapability(new capabilities.DreameCarpetModeControlCapability({
            robot: this,
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.CARPET_MODE.PIID
        }));

        this.state.upsertFirstMatchingAttribute(new entities.state.attributes.AttachmentStateAttribute({
            type: entities.state.attributes.AttachmentStateAttribute.TYPE.WATERTANK,
            attached: false
        }));
    }
}

module.exports = DreameGen2VSlamNimbusRobot;
