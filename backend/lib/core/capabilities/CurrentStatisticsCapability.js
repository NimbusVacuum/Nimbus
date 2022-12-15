const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");
const NimbusDataPoint = require("../../entities/core/NimbusDataPoint");

/**
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class CurrentStatisticsCapability extends Capability {
    /**
     * The amount and type of stuff returned here depends on the robots implementation
     *
     * @return {Promise<Array<NimbusDataPoint>>}
     */
    async getStatistics() {
        throw new NotImplementedError();
    }

    getType() {
        return CurrentStatisticsCapability.TYPE;
    }

    /**
     * @return {{availableStatistics: Array<NimbusDataPoint.TYPES>}}
     */
    getProperties() {
        return {
            availableStatistics: []
        };
    }
}

CurrentStatisticsCapability.TYPE = "CurrentStatisticsCapability";

module.exports = CurrentStatisticsCapability;
