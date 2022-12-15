const NotImplementedError = require("../../core/NotImplementedError");

class NimbusEventHandler {
    /**
     * @param {object} options
     * @param {import("../../core/NimbusRobot")} options.robot
     * @param {import("../events/NimbusEvent")} options.event
     */
    constructor(options) {
        this.robot = options.robot;
        this.event = options.event;
    }

    /**
     * @abstract
     * @param {NimbusEventInteraction} interaction
     * @returns {Promise<boolean>} True if the Event should be set to processed
     */
    async interact(interaction) {
        throw new NotImplementedError();
    }
}

/**
 *
 *  Inspired by Winforms
 *  https://docs.microsoft.com/en-us/dotnet/api/system.windows.forms.dialogresult
 *
 *  @typedef {string} NimbusEventInteraction
 *  @enum {string}
 *
 */
NimbusEventHandler.INTERACTIONS = Object.freeze({
    OK: "ok",
    YES: "yes",
    NO: "no",
    RESET: "reset"
});

module.exports = NimbusEventHandler;
