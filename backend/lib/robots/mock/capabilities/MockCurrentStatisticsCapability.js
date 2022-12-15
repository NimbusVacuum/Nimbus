const CurrentStatisticsCapability = require("../../../core/capabilities/CurrentStatisticsCapability");
const NimbusDataPoint = require("../../../entities/core/NimbusDataPoint");

/**
 * @extends CurrentStatisticsCapability<import("../MockRobot")>
 */
class MockCurrentStatisticsCapability extends CurrentStatisticsCapability {
    /**
     * @param {object} options
     * @param {import("../MockRobot")} options.robot
     */
    constructor(options) {
        super(options);

        this.currentStatistics = {
            time: 24*60,
            area: 63*10000
        };
    }

    /**
     * @return {Promise<Array<NimbusDataPoint>>}
     */
    async getStatistics() {
        return [
            new NimbusDataPoint({
                type: NimbusDataPoint.TYPES.TIME,
                value: this.currentStatistics.time
            }),
            new NimbusDataPoint({
                type: NimbusDataPoint.TYPES.AREA,
                value: this.currentStatistics.area
            })
        ];
    }

    getProperties() {
        return {
            availableStatistics: [
                NimbusDataPoint.TYPES.TIME,
                NimbusDataPoint.TYPES.AREA
            ]
        };
    }
}

module.exports = MockCurrentStatisticsCapability;
