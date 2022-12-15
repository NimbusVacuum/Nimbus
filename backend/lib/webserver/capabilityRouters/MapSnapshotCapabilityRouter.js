const CapabilityRouter = require("./CapabilityRouter");
const NimbusMapSnapshot = require("../../entities/core/NimbusMapSnapshot");

class MapSnapshotCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.get("/", async (req, res) => {
            res.json(await this.capability.getSnapshots());
        });

        this.router.put("/", this.validator, async (req, res) => {
            if (req.body.action === "restore" && req.body.id !== undefined) {
                try {
                    await this.capability.restoreSnapshot(new NimbusMapSnapshot({id: req.body.id}));
                    res.sendStatus(200);
                } catch (e) {
                    this.sendErrorResponse(req, res, e);
                }
            } else {
                res.sendStatus(400);
            }
        });
    }
}

module.exports = MapSnapshotCapabilityRouter;
