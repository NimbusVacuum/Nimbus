const PendingMapChangeHandlingCapability = require("../../../core/capabilities/PendingMapChangeHandlingCapability");
const RobotFirmwareError = require("../../../core/RobotFirmwareError");


/**
 * @extends PendingMapChangeHandlingCapability<import("../DreameNimbusRobot")>
 */
class DreamePendingMapChangeHandlingCapability extends PendingMapChangeHandlingCapability {
    /**
     *
     * @param {object} options
     * @param {import("../DreameNimbusRobot")} options.robot
     *
     * @param {object} options.miot_actions
     * @param {object} options.miot_actions.map_edit
     * @param {number} options.miot_actions.map_edit.siid
     * @param {number} options.miot_actions.map_edit.aiid
     *
     * @param {object} options.miot_properties
     * @param {object} options.miot_properties.mapDetails
     * @param {number} options.miot_properties.mapDetails.piid
     *
     * @param {object} options.miot_properties.actionResult
     * @param {number} options.miot_properties.actionResult.piid
     */
    constructor(options) {
        super(options);

        this.miot_actions = options.miot_actions;
        this.miot_properties = options.miot_properties;
    }

    /**
     * @returns {Promise<boolean>}
     */
    async hasPendingChange() {
        return this.robot?.state?.map?.metaData?.dreamePendingMapChange === true;
    }

    /**
     * @returns {Promise<void>}
     */
    async acceptChange() {
        return this.commitChoice(1);
    }

    /**
     * @returns {Promise<void>}
     */
    async rejectChange() {
        return this.commitChoice(0);
    }

    /**
     * @private
     * @param {number} choice
     * @returns {Promise<void>}
     */
    async commitChoice(choice) {
        const res = await this.robot.sendCommand("action",
            {
                did: this.robot.deviceId,
                siid: this.miot_actions.map_edit.siid,
                aiid: this.miot_actions.map_edit.aiid,
                in: [
                    {
                        piid: this.miot_properties.mapDetails.piid,
                        value: JSON.stringify({cw: choice})
                    }
                ]
            }
        );

        if (
            res && res.siid === this.miot_actions.map_edit.siid &&
            res.aiid === this.miot_actions.map_edit.aiid &&
            Array.isArray(res.out) && res.out.length === 1 &&
            res.out[0].piid === this.miot_properties.actionResult.piid
        ) {
            switch (res.out[0].value) {
                case 0:
                    this.markEventsAsProcessed();

                    this.robot.pollMap();
                    return;
                default:
                    throw new RobotFirmwareError("Got error " + res.out[0].value + " while committing choice.");
            }
        }
    }
}

module.exports = DreamePendingMapChangeHandlingCapability;
