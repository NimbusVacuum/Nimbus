const NotImplementedError = require("../../core/NotImplementedError");

class NimbusTimerAction {
    /**
     * @abstract
     * @param {object} options
     * @param {import("../../core/NimbusRobot")} options.robot
     */
    constructor(options) {
        this.robot = options.robot;
    }

    /**
     * @returns {Promise<void>}
     */
    async run() {
        throw new NotImplementedError();
    }
}

module.exports = NimbusTimerAction;
