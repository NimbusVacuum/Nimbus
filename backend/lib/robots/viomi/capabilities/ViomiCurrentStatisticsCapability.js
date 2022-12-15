const CurrentStatisticsCapability = require("../../../core/capabilities/CurrentStatisticsCapability");
const NimbusDataPoint = require("../../../entities/core/NimbusDataPoint");

/**
 * @extends CurrentStatisticsCapability<import("../ViomiNimbusRobot")>
 */
class ViomiCurrentStatisticsCapability extends CurrentStatisticsCapability {
    /**
     * @param {object} options
     * @param {import("../ViomiNimbusRobot")} options.robot
     */
    constructor(options) {
        super(options);

        this.currentStatistics = {
            time: undefined,
            area: undefined
        };
    }

    /**
     * @return {Promise<Array<NimbusDataPoint>>}
     */
    async getStatistics() {
        await this.robot.pollState(); //fetching robot state populates the capability's internal state. somewhat spaghetti :(

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

module.exports = ViomiCurrentStatisticsCapability;
