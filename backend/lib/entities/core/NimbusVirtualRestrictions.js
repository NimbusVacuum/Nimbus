/**
 * @typedef {import("./NimbusVirtualWall")} NimbusVirtualWall
 * @typedef {import("./NimbusRestrictedZone")} NimbusRestrictedZone
 */

const SerializableEntity = require("../SerializableEntity");

// noinspection JSUnusedGlobalSymbols
/**
 * @class NimbusVirtualRestrictions
 * @property {Array<NimbusVirtualWall>} virtualWalls
 * @property {Array<NimbusRestrictedZone>} restrictedZones
 */
class NimbusVirtualRestrictions extends SerializableEntity {
    /**
     * This is a named container which contains RestrictedZones and virtualWalls
     *
     * @param {object} options
     * @param {Array<NimbusVirtualWall>} options.virtualWalls
     * @param {Array<NimbusRestrictedZone>} options.restrictedZones
     * @param {object} [options.metaData]
     * @class
     */
    constructor(options) {
        super(options);

        this.virtualWalls = options.virtualWalls;
        this.restrictedZones = options.restrictedZones;
    }
}

module.exports = NimbusVirtualRestrictions;
