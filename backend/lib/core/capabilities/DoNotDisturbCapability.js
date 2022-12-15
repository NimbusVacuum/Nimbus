const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

/**
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class DoNotDisturbCapability extends Capability {
    /**
     *
     * @abstract
     * @returns {Promise<import("../../entities/core/NimbusDNDConfiguration")>}
     */
    async getDndConfiguration() {
        throw new NotImplementedError();
    }

    /**
     * @abstract
     * @param {import("../../entities/core/NimbusDNDConfiguration")} dndConfig
     * @returns {Promise<void>}
     */
    async setDndConfiguration(dndConfig) {
        throw new NotImplementedError();
    }

    getType() {
        return DoNotDisturbCapability.TYPE;
    }
}

DoNotDisturbCapability.TYPE = "DoNotDisturbCapability";

module.exports = DoNotDisturbCapability;
