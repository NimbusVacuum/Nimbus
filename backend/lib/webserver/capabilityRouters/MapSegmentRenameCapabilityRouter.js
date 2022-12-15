const CapabilityRouter = require("./CapabilityRouter");
const NimbusMapSegment = require("../../entities/core/NimbusMapSegment");

class MapSegmentRenameCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.put("/", this.validator, async (req, res) => {
            if (req.body.action === "rename_segment") {
                if ( req.body.segment_id && req.body.name !== undefined) {
                    try {
                        await this.capability.renameSegment(
                            new NimbusMapSegment({id: req.body.segment_id}),
                            req.body.name
                        );

                        res.sendStatus(200);
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                } else {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(400);
            }
        });
    }
}

module.exports = MapSegmentRenameCapabilityRouter;
