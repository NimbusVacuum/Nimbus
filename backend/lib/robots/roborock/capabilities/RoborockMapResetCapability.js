const MapResetCapability = require("../../../core/capabilities/MapResetCapability");
const RobotFirmwareError = require("../../../core/RobotFirmwareError");

/**
 * @extends MapResetCapability<import("../RoborockNimbusRobot")>
 */
class RoborockMapResetCapability extends MapResetCapability {
    /**
     * @returns {Promise<void>}
     */
    async reset() {
        let res = await this.robot.sendCommand("reset_map", [], {});

        if (!(Array.isArray(res) && res[0] === "ok")) {
            throw new RobotFirmwareError("Failed to reset map: " + res);
        }

        this.robot.clearNimbusMap();
    }
}

module.exports = RoborockMapResetCapability;
