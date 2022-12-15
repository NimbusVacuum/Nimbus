const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

const NimbusRestrictedZone = require("../../entities/core/NimbusRestrictedZone");
const NimbusVirtualRestrictions = require("../../entities/core/NimbusVirtualRestrictions");
const NimbusVirtualWall = require("../../entities/core/NimbusVirtualWall");

const entities = require("../../entities");

/**
 * To avoid a race condition on robots where both walls and zones are the same data type
 * this capability is both.
 *
 * Honestly, every robot should be like this. Only supporting one of the two is questionable
 *
 * @template {import("../NimbusRobot")} T
 * @extends Capability<T>
 */
class CombinedVirtualRestrictionsCapability extends Capability {
    /**
     *
     * @param {object} options
     * @param {T} options.robot
     * @param {Array<import("../../entities/core/NimbusRestrictedZone").NimbusRestrictedZoneType>} [options.supportedRestrictedZoneTypes]
     * @class
     */
    constructor(options) {
        super(options);

        this.supportedRestrictedZoneTypes = options.supportedRestrictedZoneTypes ?? [NimbusRestrictedZone.TYPE.REGULAR];
    }

    /**
     * @returns {Promise<import("../../entities/core/NimbusVirtualRestrictions")>}
     */
    async getVirtualRestrictions() {
        const virtualWalls = [];
        const restrictedZones = [];

        this.robot.state.map.entities.filter(e => {
            return (e instanceof entities.map.LineMapEntity && e.type === entities.map.LineMapEntity.TYPE.VIRTUAL_WALL) ||
                (e instanceof entities.map.PolygonMapEntity && e.type === entities.map.PolygonMapEntity.TYPE.NO_GO_AREA) ||
                (e instanceof entities.map.PolygonMapEntity && e.type === entities.map.PolygonMapEntity.TYPE.NO_MOP_AREA);
        }).forEach(restriction => {
            if (restriction instanceof entities.map.LineMapEntity) {
                virtualWalls.push(new NimbusVirtualWall({
                    points: {
                        pA: {
                            x: restriction.points[0],
                            y: restriction.points[1]
                        },
                        pB: {
                            x: restriction.points[2],
                            y: restriction.points[3]
                        }
                    }
                }));
            } else if (restriction instanceof entities.map.PolygonMapEntity) {
                let type;

                switch (restriction.type) {
                    case entities.map.PolygonMapEntity.TYPE.NO_GO_AREA:
                        type = NimbusRestrictedZone.TYPE.REGULAR;
                        break;
                    case entities.map.PolygonMapEntity.TYPE.NO_MOP_AREA:
                        type = NimbusRestrictedZone.TYPE.MOP;
                        break;
                }

                restrictedZones.push(new NimbusRestrictedZone({
                    points: {
                        pA: {
                            x: restriction.points[0],
                            y: restriction.points[1]
                        },
                        pB: {
                            x: restriction.points[2],
                            y: restriction.points[3]
                        },
                        pC: {
                            x: restriction.points[4],
                            y: restriction.points[5]
                        },
                        pD: {
                            x: restriction.points[6],
                            y: restriction.points[7]
                        }
                    },
                    type: type
                }));
            }
        });

        return new NimbusVirtualRestrictions({
            virtualWalls: virtualWalls,
            restrictedZones: restrictedZones
        });
    }

    /**
     *
     * @param {import("../../entities/core/NimbusVirtualRestrictions")} virtualRestrictions
     * @returns {Promise<void>}
     */
    async setVirtualRestrictions(virtualRestrictions) {
        throw new NotImplementedError();
    }

    /**
     * @returns {CombinedVirtualRestrictionsCapabilityProperties}
     */
    getProperties() {
        return {
            supportedRestrictedZoneTypes: this.supportedRestrictedZoneTypes
        };
    }

    getType() {
        return CombinedVirtualRestrictionsCapability.TYPE;
    }
}

CombinedVirtualRestrictionsCapability.TYPE = "CombinedVirtualRestrictionsCapability";

module.exports = CombinedVirtualRestrictionsCapability;

/**
 * @typedef {object} CombinedVirtualRestrictionsCapabilityProperties
 *
 * @property {Array<import("../../entities/core/NimbusRestrictedZone").NimbusRestrictedZoneType>} supportedRestrictedZoneTypes
 */
