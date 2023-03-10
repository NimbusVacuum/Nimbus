const MapResetCapability = require("../../../core/capabilities/MapResetCapability");

/**
 * @extends MapResetCapability<import("../MockRobot")>
 */
class MockMapResetCapability extends MapResetCapability {
    /**
     * @returns {Promise<void>}
     */
    async reset() {
        this.robot.buildMap();
    }
}

module.exports = MockMapResetCapability;
