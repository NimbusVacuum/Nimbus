const MapSnapshotCapability = require("../../../core/capabilities/MapSnapshotCapability");
const NimbusMapSnapshot = require("../../../entities/core/NimbusMapSnapshot");

/**
 * @extends MapSnapshotCapability<import("../RoborockNimbusRobot")>
 */
class RoborockMapSnapshotCapability extends MapSnapshotCapability {
    /**
     * @returns {Promise<Array<import("../../../entities/core/NimbusMapSnapshot")>>}
     */
    async getSnapshots() {
        const res = await this.robot.sendCommand("get_recover_maps", [], {});

        if (Array.isArray(res)) {
            return res.map(e => {
                return new NimbusMapSnapshot({id: e[0].toString(), timestamp: new Date(parseInt(e[1])*1000)});
            });
        } else {
            throw new Error("Received invalid response:" + res);
        }
    }

    /**
     * @param {import("../../../entities/core/NimbusMapSnapshot")} snapshot
     * @returns {Promise<void>}
     */
    async restoreSnapshot(snapshot) {
        await this.robot.sendCommand("recover_map", [parseInt(snapshot.id)], {});
    }
}

module.exports = RoborockMapSnapshotCapability;
