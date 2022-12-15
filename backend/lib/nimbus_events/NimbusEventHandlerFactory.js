const events = require("./events");
const handlers = require("./handlers");

class NimbusEventHandlerFactory {
    /**
     * @param {object} options
     * @param {import("../core/NimbusRobot")} options.robot
     */
    constructor(options) {
        this.robot = options.robot;
    }

    /**
     *
     * @param {import("./events/NimbusEvent")} event
     * @returns {import("./handlers/NimbusEventHandler")}
     */
    getHandlerForEvent(event) {
        if (event instanceof events.DismissibleNimbusEvent) {
            return new handlers.DismissibleNimbusEventHandler({
                robot: this.robot,
                event: event
            });
        } else if (event instanceof events.ConsumableDepletedNimbusEvent) {
            return new handlers.ConsumableDepletedNimbusEventHandler({
                robot: this.robot,
                event: event
            });
        } else if (event instanceof events.PendingMapChangeNimbusEvent) {
            return new handlers.PendingMapChangeNimbusEventHandler({
                robot: this.robot,
                event: event
            });
        }
    }
}

module.exports = NimbusEventHandlerFactory;
