const MapResetCapability = require("../../../core/capabilities/MapResetCapability");

/**
 * @extends MapResetCapability<import("../ViomiNimbusRobot")>
 */
class ViomiMapResetCapability extends MapResetCapability {
    /**
     * @returns {Promise<void>}
     */
    async reset() {
        await this.robot.sendCommand("set_resetmap", [], {});

        this.robot.clearNimbusMap();
    }
}

module.exports = ViomiMapResetCapability;
