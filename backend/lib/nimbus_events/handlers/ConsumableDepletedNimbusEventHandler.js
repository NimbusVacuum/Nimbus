const ConsumableMonitoringCapability = require("../../core/capabilities/ConsumableMonitoringCapability");
const NimbusEventHandler = require("./NimbusEventHandler");

class ConsumableDepletedNimbusEventHandler extends NimbusEventHandler {
    /**
     * @param {NimbusEventHandler.INTERACTIONS} interaction
     * @returns {Promise<boolean>}
     */
    async interact(interaction) {
        if (interaction === NimbusEventHandler.INTERACTIONS.RESET) {
            if (this.robot.hasCapability(ConsumableMonitoringCapability.TYPE)) {
                //@ts-ignore
                await this.robot.capabilities[ConsumableMonitoringCapability.TYPE].resetConsumable(this.event.type, this.event.subType);

                return true;
            } else {
                throw new Error("Robot is missing the required ConsumableMonitoringCapability");
            }
        } else {
            throw new Error("Invalid Interaction");
        }
    }
}

module.exports = ConsumableDepletedNimbusEventHandler;
