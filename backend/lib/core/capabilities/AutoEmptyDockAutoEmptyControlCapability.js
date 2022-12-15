const SimpleToggleCapability = require("./SimpleToggleCapability");

/**
 * @template {import("../NimbusRobot")} T
 * @extends SimpleToggleCapability<T>
 */
class AutoEmptyDockAutoEmptyControlCapability extends SimpleToggleCapability {
    getType() {
        return AutoEmptyDockAutoEmptyControlCapability.TYPE;
    }
}

AutoEmptyDockAutoEmptyControlCapability.TYPE = "AutoEmptyDockAutoEmptyControlCapability";

module.exports = AutoEmptyDockAutoEmptyControlCapability;
