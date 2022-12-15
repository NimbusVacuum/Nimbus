const PersistentMapControlCapability = require("../../../core/capabilities/PersistentMapControlCapability");

/**
 * @extends PersistentMapControlCapability<import("../RoborockNimbusRobot")>
 */
class RoborockPersistentMapControlCapability extends PersistentMapControlCapability {
    /**
     * @param {object} options
     * @param {import("../RoborockNimbusRobot")} options.robot
     */
    constructor(options) {
        super(options);
    }

    /**
     * @returns {Promise<boolean>}
     */
    async isEnabled() {
        await this.robot.pollState(); //The labStatus is part of the status response and gets stored in the robot instance

        return this.robot.labStatus?.persistentMapEnabled ?? false;
    }

    /**
     * @returns {Promise<void>}
     */
    async enable() {
        await this.robot.sendCommand("set_lab_status", [1], {});
    }

    /**
     * @returns {Promise<void>}
     */
    async disable() {
        await this.robot.sendCommand("set_lab_status", [0], {});
    }
}

module.exports = RoborockPersistentMapControlCapability;
