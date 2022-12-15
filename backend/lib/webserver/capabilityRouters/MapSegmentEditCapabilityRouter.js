const CapabilityRouter = require("./CapabilityRouter");
const NimbusMapSegment = require("../../entities/core/NimbusMapSegment");

class MapSegmentEditCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.put("/", this.validator, async (req, res) => {
            switch (req.body.action) {
                case "join_segments":
                    if (req.body.segment_a_id && req.body.segment_b_id) {
                        try {
                            await this.capability.joinSegments(
                                new NimbusMapSegment({id: req.body.segment_a_id}),
                                new NimbusMapSegment({id: req.body.segment_b_id}),
                            );

                            res.sendStatus(200);
                        } catch (e) {
                            this.sendErrorResponse(req, res, e);
                        }
                    } else {
                        res.sendStatus(400);
                    }
                    break;
                case "split_segment":
                    if (req.body.pA && req.body.pB && req.body.segment_id) {
                        try {
                            await this.capability.splitSegment(
                                new NimbusMapSegment({id: req.body.segment_id}),
                                {
                                    x: req.body.pA.x,
                                    y: req.body.pA.y,
                                },
                                {
                                    x: req.body.pB.x,
                                    y: req.body.pB.y,
                                }
                            );

                            res.sendStatus(200);
                        } catch (e) {
                            this.sendErrorResponse(req, res, e);
                        }
                    } else {
                        res.sendStatus(400);
                    }
                    break;
                default:
                    res.sendStatus(400);
            }
        });
    }
}

module.exports = MapSegmentEditCapabilityRouter;
