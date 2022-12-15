const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");
const NimbusDataPoint = require("../../entities/core/NimbusDataPoint");

/**
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class TotalStatisticsCapability extends Capability {
    /**
     * The amount and type of stuff returned here depends on the robots implementation
     *
     * @return {Promise<Array<NimbusDataPoint>>}
     */
    async getStatistics() {
        throw new NotImplementedError();
    }

    getType() {
        return TotalStatisticsCapability.TYPE;
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

TotalStatisticsCapability.TYPE = "TotalStatisticsCapability";

module.exports = TotalStatisticsCapability;
