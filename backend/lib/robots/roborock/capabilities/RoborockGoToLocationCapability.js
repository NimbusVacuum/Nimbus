const GoToLocationCapability = require("../../../core/capabilities/GoToLocationCapability");
const RoborockMapParser = require("../RoborockMapParser");

/**
 * @extends GoToLocationCapability<import("../RoborockNimbusRobot")>
 */
class RoborockGoToLocationCapability extends GoToLocationCapability {
    /**
     * @param {import("../../../entities/core/NimbusGoToLocation")} nimbusGoToLocation
     * @returns {Promise<void>}
     */
    async goTo(nimbusGoToLocation) {
        await this.robot.sendCommand(
            "app_goto_target",
            [
                Math.floor(nimbusGoToLocation.coordinates.x * 10),
                Math.floor(RoborockMapParser.DIMENSION_MM - nimbusGoToLocation.coordinates.y * 10)
            ],
            {}
        );
    }
}

module.exports = RoborockGoToLocationCapability;
