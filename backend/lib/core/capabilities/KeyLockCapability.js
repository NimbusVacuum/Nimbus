const SimpleToggleCapability = require("./SimpleToggleCapability");

/**
 * @template {import("../NimbusRobot")} T
 * @extends SimpleToggleCapability<T>
 */
class KeyLockCapability extends SimpleToggleCapability {
    getType() {
        return KeyLockCapability.TYPE;
    }
}

KeyLockCapability.TYPE = "KeyLockCapability";

module.exports = KeyLockCapability;
