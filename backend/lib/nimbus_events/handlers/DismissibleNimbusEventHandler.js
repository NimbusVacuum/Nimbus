const NimbusEventHandler = require("./NimbusEventHandler");

class DismissibleNimbusEventHandler extends NimbusEventHandler {
    /**
     * @param {NimbusEventHandler.INTERACTIONS} interaction
     * @returns {Promise<boolean>}
     */
    async interact(interaction) {
        if (interaction === NimbusEventHandler.INTERACTIONS.OK) {
            return true;
        } else {
            throw new Error("Invalid Interaction");
        }
    }
}

module.exports = DismissibleNimbusEventHandler;
