const MapSegmentationCapability = require("../../../core/capabilities/MapSegmentationCapability");
const NimbusMapSegment = require("../../../entities/core/NimbusMapSegment");

/**
 * @extends MapSegmentationCapability<import("../MockRobot")>
 */
class MockMapSegmentationCapability extends MapSegmentationCapability {
    /**
     * @returns {Promise<Array<import("../../../entities/core/NimbusMapSegment")>>}
     */
    async getSegments() {
        return [
            new NimbusMapSegment({ id: "foo_id", name: "Foo"}),
            new NimbusMapSegment({ id: "bar_id", name: "Bar"}),
            new NimbusMapSegment({ id: "b774401e-4227-43bb-8fde-c166cfa7a028" })
        ];
    }

    /**
     * @returns {import("../../../core/capabilities/MapSegmentationCapability").MapSegmentationCapabilityProperties}
     */
    getProperties() {
        return {
            iterationCount: {
                min: 1,
                max: 2
            },
            customOrderSupport: true
        };
    }

    /**
     * Could be phrased as "cleanSegments" for vacuums or "mowSegments" for lawnmowers
     *
     *
     * @param {Array<import("../../../entities/core/NimbusMapSegment")>} segments
     * @param {object} [options]
     * @param {number} [options.iterations]
     * @param {boolean} [options.customOrder]
     * @returns {Promise<void>}
     */
    async executeSegmentAction(segments, options) {
        await this.robot.capabilities.BasicControlCapability.start();
    }
}

module.exports = MockMapSegmentationCapability;
