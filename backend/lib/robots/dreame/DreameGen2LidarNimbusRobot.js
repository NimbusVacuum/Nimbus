const DreameGen2NimbusRobot = require("./DreameGen2NimbusRobot");

const capabilities = require("./capabilities");

class DreameGen2LidarNimbusRobot extends DreameGen2NimbusRobot {
    constructor(options) {
        super(options);

        this.registerCapability(new capabilities.DreameMappingPassCapability({
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
                }
            },
            mappingModeId: 21
        }));
    }
}

module.exports = DreameGen2LidarNimbusRobot;
