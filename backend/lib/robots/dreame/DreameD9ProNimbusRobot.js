const capabilities = require("./capabilities");
const DreameGen2LidarNimbusRobot = require("./DreameGen2LidarNimbusRobot");
const DreameGen2NimbusRobot = require("./DreameGen2NimbusRobot");
const DreameNimbusRobot = require("./DreameNimbusRobot");
const entities = require("../../entities");
const fs = require("fs");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const NimbusSelectionPreset = require("../../entities/core/NimbusSelectionPreset");

class DreameD9ProNimbusRobot extends DreameGen2LidarNimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        super(options);

        this.registerCapability(new capabilities.DreameCarpetModeControlCapability({
            robot: this,
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.CARPET_MODE.PIID
        }));

        this.registerCapability(new capabilities.DreameWaterUsageControlCapability({
            robot: this,
            presets: Object.keys(DreameNimbusRobot.WATER_GRADES).map(k => {
                return new NimbusSelectionPreset({name: k, value: DreameNimbusRobot.WATER_GRADES[k]});
            }),
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.WATER_USAGE.PIID
        }));

        this.registerCapability(new capabilities.DreameZoneCleaningCapability({
            robot: this,
            miot_actions: {
                start: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
                    aiid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.ACTIONS.START.AIID
                }
            },
            miot_properties: {
                mode: {
                    piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.MODE.PIID
                },
                additionalCleanupParameters: {
                    piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.ADDITIONAL_CLEANUP_PROPERTIES.PIID
                }
            },
            zoneCleaningModeId: 19
        }));

        this.registerCapability(new capabilities.DreameConsumableMonitoringCapability({
            robot: this,
            miot_properties: {
                main_brush: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.MAIN_BRUSH.SIID,
                    piid: DreameGen2NimbusRobot.MIOT_SERVICES.MAIN_BRUSH.PROPERTIES.TIME_LEFT.PIID
                },
                side_brush: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.SIDE_BRUSH.SIID,
                    piid: DreameGen2NimbusRobot.MIOT_SERVICES.SIDE_BRUSH.PROPERTIES.TIME_LEFT.PIID
                },
                filter: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.FILTER.SIID,
                    piid: DreameGen2NimbusRobot.MIOT_SERVICES.FILTER.PROPERTIES.TIME_LEFT.PIID
                }
            },
            miot_actions: {
                reset_main_brush: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.MAIN_BRUSH.SIID,
                    aiid: DreameGen2NimbusRobot.MIOT_SERVICES.MAIN_BRUSH.ACTIONS.RESET.AIID
                },
                reset_side_brush: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.SIDE_BRUSH.SIID,
                    aiid: DreameGen2NimbusRobot.MIOT_SERVICES.SIDE_BRUSH.ACTIONS.RESET.AIID
                },
                reset_filter: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.FILTER.SIID,
                    aiid: DreameGen2NimbusRobot.MIOT_SERVICES.FILTER.ACTIONS.RESET.AIID
                }
            },
        }));

        this.state.upsertFirstMatchingAttribute(new entities.state.attributes.AttachmentStateAttribute({
            type: entities.state.attributes.AttachmentStateAttribute.TYPE.WATERTANK,
            attached: false
        }));
    }

    getModelName() {
        return "D9 Pro";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(DreameNimbusRobot.DEVICE_CONF_PATH);
        const isD9Pro = !!(deviceConf && deviceConf.model === "dreame.vacuum.p2187");

        return isD9Pro && !fs.existsSync("/etc/dustbuilder_backport");
    }
}

module.exports = DreameD9ProNimbusRobot;
