const ZoneCleaningCapability = require("../../../core/capabilities/ZoneCleaningCapability");

/**
 * @extends ZoneCleaningCapability<import("../MockRobot")>
 */
class MockZoneCleaningCapability extends ZoneCleaningCapability {
    async start(nimbusZones) {
        // TODO: implement
    }

    getProperties() {
        // TODO: implement
        return super.getProperties();
    }
}

module.exports = MockZoneCleaningCapability;
