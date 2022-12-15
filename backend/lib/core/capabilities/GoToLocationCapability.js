const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

/**
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class GoToLocationCapability extends Capability {
    /**
     * @abstract
     * @param {import("../../entities/core/NimbusGoToLocation")} nimbusGoToLocation
     * @returns {Promise<void>}
     */
    async goTo(nimbusGoToLocation) {
        throw new NotImplementedError();
    }

    getType() {
        return GoToLocationCapability.TYPE;
    }
}

GoToLocationCapability.TYPE = "GoToLocationCapability";

module.exports = GoToLocationCapability;
