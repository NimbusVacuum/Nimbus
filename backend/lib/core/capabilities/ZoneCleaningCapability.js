const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

/**
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class ZoneCleaningCapability extends Capability {
    /**
     * @abstract
     * @param {Array<import("../../entities/core/NimbusZone")>} nimbusZones
     * @returns {Promise<void>}
     */
    async start(nimbusZones) {
        throw new NotImplementedError();
    }

    /**
     * @returns {ZoneCleaningCapabilityProperties}
     */
    getProperties() {
        return {
            zoneCount: {
                min: 1,
                max: 1
            },
            iterationCount: {
                min: 1,
                max: 1
            }
        };
    }

    getType() {
        return ZoneCleaningCapability.TYPE;
    }
}

ZoneCleaningCapability.TYPE = "ZoneCleaningCapability";

module.exports = ZoneCleaningCapability;

/**
 * @typedef {object} ZoneCleaningCapabilityProperties
 *
 * @property {object} zoneCount
 * @property {number} zoneCount.min
 * @property {number} zoneCount.max
 *
 * @property {object} iterationCount
 * @property {number} iterationCount.min
 * @property {number} iterationCount.max
 */
