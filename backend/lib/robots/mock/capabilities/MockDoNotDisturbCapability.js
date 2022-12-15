const DoNotDisturbCapability = require("../../../core/capabilities/DoNotDisturbCapability");
const NimbusDNDConfiguration = require("../../../entities/core/NimbusDNDConfiguration");

/**
 * @extends DoNotDisturbCapability<import("../MockRobot")>
 */
class MockDoNotDisturbCapability extends DoNotDisturbCapability {
    /**
     * @param {object} options
     * @param {import("../MockRobot")} options.robot
     */
    constructor(options) {
        super(options);

        this.dndConfig = new NimbusDNDConfiguration({
            enabled: true,
            start: {
                hour: 22,
                minute: 0
            },
            end: {
                hour: 8,
                minute: 0
            }
        });
    }

    /**
     * @returns {Promise<import("../../../entities/core/NimbusDNDConfiguration")>}
     */
    async getDndConfiguration() {
        return new NimbusDNDConfiguration(this.dndConfig);
    }

    /**
     * @param {import("../../../entities/core/NimbusDNDConfiguration")} dndConfig
     * @returns {Promise<void>}
     */
    async setDndConfiguration(dndConfig) {
        this.dndConfig = dndConfig;
    }
}

module.exports = MockDoNotDisturbCapability;
