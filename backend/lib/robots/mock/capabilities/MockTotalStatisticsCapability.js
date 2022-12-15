const TotalStatisticsCapability = require("../../../core/capabilities/TotalStatisticsCapability");

const NimbusDataPoint = require("../../../entities/core/NimbusDataPoint");

/**
 * @extends TotalStatisticsCapability<import("../MockRobot")>
 */
class MockTotalStatisticsCapability extends TotalStatisticsCapability {
    constructor(options) {
        super(options);

        const count = 5;
        this.totalStatistics = {
            time: count * 24 * 60,
            area: count * 63 * 10000,
            count
        };
    }

    /**
     * @return {Promise<Array<NimbusDataPoint>>}
     */
    async getStatistics() {
        return [
            new NimbusDataPoint({
                type: NimbusDataPoint.TYPES.TIME,
                value: this.totalStatistics.time
            }),
            new NimbusDataPoint({
                type: NimbusDataPoint.TYPES.AREA,
                value: this.totalStatistics.area
            }),
            new NimbusDataPoint({
                type: NimbusDataPoint.TYPES.COUNT,
                value: this.totalStatistics.count
            })
        ];
    }

    getProperties() {
        return {
            availableStatistics: [
                NimbusDataPoint.TYPES.TIME,
                NimbusDataPoint.TYPES.AREA,
                NimbusDataPoint.TYPES.COUNT
            ]
        };
    }
}

module.exports = MockTotalStatisticsCapability;
