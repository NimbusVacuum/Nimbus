const capabilities = require("./capabilities");
const DreameGen2LidarNimbusRobot = require("./DreameGen2LidarNimbusRobot");
const DreameGen2NimbusRobot = require("./DreameGen2NimbusRobot");
const DreameQuirkFactory = require("./DreameQuirkFactory");
const DreameNimbusRobot = require("./DreameNimbusRobot");
const entities = require("../../entities");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const QuirksCapability = require("../../core/capabilities/QuirksCapability");
const NimbusSelectionPreset = require("../../entities/core/NimbusSelectionPreset");

class DreameZ10ProNimbusRobot extends DreameGen2LidarNimbusRobot {

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
                },
                sensor: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.SENSOR.SIID,
                    piid: DreameGen2NimbusRobot.MIOT_SERVICES.SENSOR.PROPERTIES.TIME_LEFT.PIID
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
                },
                reset_sensor: {
                    siid: DreameGen2NimbusRobot.MIOT_SERVICES.SENSOR.SIID,
                    aiid: DreameGen2NimbusRobot.MIOT_SERVICES.SENSOR.ACTIONS.RESET.AIID
                }
            },
        }));

        this.registerCapability(new capabilities.DreameKeyLockCapability({
            robot: this,
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.KEY_LOCK.PIID
        }));

        this.registerCapability(new capabilities.DreameAutoEmptyDockAutoEmptyControlCapability({
            robot: this,
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.AUTO_EMPTY_DOCK.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.AUTO_EMPTY_DOCK.PROPERTIES.AUTO_EMPTY_ENABLED.PIID
        }));

        this.registerCapability(new capabilities.DreameAutoEmptyDockManualTriggerCapability({
            robot: this,
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.AUTO_EMPTY_DOCK.SIID,
            aiid: DreameGen2NimbusRobot.MIOT_SERVICES.AUTO_EMPTY_DOCK.ACTIONS.EMPTY_DUSTBIN.AIID
        }));

        this.registerCapability(new capabilities.DreameOperationModeControlCapability({
            robot: this,
            presets: Object.keys(this.operationModes).map(k => {
                return new NimbusSelectionPreset({name: k, value: this.operationModes[k]});
            }),
            siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
            piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.MOP_DOCK_SETTINGS.PIID
        }));

        this.registerCapability(new QuirksCapability({
            robot: this,
            quirks: [
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.CARPET_MODE_SENSITIVITY),
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.TIGHT_MOP_PATTERN),
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.AUTO_EMPTY_INTERVAL),
                QuirkFactory.getQuirk(DreameQuirkFactory.KNOWN_QUIRKS.OBSTACLE_AVOIDANCE)
            ]
        }));

        this.state.upsertFirstMatchingAttribute(new entities.state.attributes.DockStatusStateAttribute({
            value: entities.state.attributes.DockStatusStateAttribute.VALUE.IDLE
        }));

        this.state.upsertFirstMatchingAttribute(new entities.state.attributes.AttachmentStateAttribute({
            type: entities.state.attributes.AttachmentStateAttribute.TYPE.WATERTANK,
            attached: false
        }));
    }

    getStatePropertiesToPoll() {
        const superProps = super.getStatePropertiesToPoll();

        return [
            ...superProps,
            {
                siid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.SIID,
                piid: DreameGen2NimbusRobot.MIOT_SERVICES.VACUUM_2.PROPERTIES.MOP_DOCK_SETTINGS.PIID
            }
        ];
    }

    getModelName() {
        return "Z10 Pro";
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(DreameNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && (deviceConf.model === "dreame.vacuum.p2028" || deviceConf.model === "dreame.vacuum.p2028a"));
    }
}

module.exports = DreameZ10ProNimbusRobot;
