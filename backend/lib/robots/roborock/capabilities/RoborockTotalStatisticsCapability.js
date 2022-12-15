const TotalStatisticsCapability = require("../../../core/capabilities/TotalStatisticsCapability");
const NimbusDataPoint = require("../../../entities/core/NimbusDataPoint");

/**
 * @extends TotalStatisticsCapability<import("../RoborockNimbusRobot")>
 */
class RoborockTotalStatisticsCapability extends TotalStatisticsCapability {
    /**
     * @return {Promise<Array<NimbusDataPoint>>}
     */
    async getStatistics() {
        const res = await this.robot.sendCommand("get_clean_summary", [], {});

        // This is how roborock robots before the S7 reported total statistics
        if (Array.isArray(res) && res.length === 4) {
            return [
                new NimbusDataPoint({
                    type: NimbusDataPoint.TYPES.TIME,
                    value: res[0]
                }),
                new NimbusDataPoint({
                    type: NimbusDataPoint.TYPES.AREA,
                    value: Math.round(res[1] / 100)
                }),
                new NimbusDataPoint({
                    type: NimbusDataPoint.TYPES.COUNT,
                    value: res[2]
                })
            ];
        } else if ( //S7 and up
            res &&
            res.clean_time !== undefined &&
            res.clean_area !== undefined &&
            res.clean_count !== undefined
        ) {
            return [
                new NimbusDataPoint({
                    type: NimbusDataPoint.TYPES.TIME,
                    value: res.clean_time
                }),
                new NimbusDataPoint({
                    type: NimbusDataPoint.TYPES.AREA,
                    value: Math.round(res.clean_area / 100)
                }),
                new NimbusDataPoint({
                    type: NimbusDataPoint.TYPES.COUNT,
                    value: res.clean_count
                })
            ];
        } else {
            throw new Error("Received invalid response");
        }
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

module.exports = RoborockTotalStatisticsCapability;
