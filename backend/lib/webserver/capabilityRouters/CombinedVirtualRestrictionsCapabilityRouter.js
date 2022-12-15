const CapabilityRouter = require("./CapabilityRouter");
const NimbusRestrictedZone = require("../../entities/core/NimbusRestrictedZone");
const NimbusVirtualRestrictions = require("../../entities/core/NimbusVirtualRestrictions");
const NimbusVirtualWall = require("../../entities/core/NimbusVirtualWall");

class CombinedVirtualRestrictionsCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.get("/", async (req, res) => {
            try {
                res.json(await this.capability.getVirtualRestrictions());
            } catch (e) {
                this.sendErrorResponse(req, res, e);
            }
        });

        this.router.put("/", this.validator, async (req, res) => {
            if (Array.isArray(req.body.virtualWalls) && Array.isArray(req.body.restrictedZones)) {
                const virtualRestrictions = new NimbusVirtualRestrictions({
                    virtualWalls: req.body.virtualWalls.map(requestWall => {
                        return new NimbusVirtualWall({
                            points: {
                                pA: {
                                    x: requestWall.points.pA.x,
                                    y: requestWall.points.pA.y
                                },
                                pB: {
                                    x: requestWall.points.pB.x,
                                    y: requestWall.points.pB.y
                                }
                            }
                        });
                    }),
                    restrictedZones: req.body.restrictedZones.map(requestZone => {
                        return new NimbusRestrictedZone({
                            points: {
                                pA: {
                                    x: requestZone.points.pA.x,
                                    y: requestZone.points.pA.y
                                },
                                pB: {
                                    x: requestZone.points.pB.x,
                                    y: requestZone.points.pB.y
                                },
                                pC: {
                                    x: requestZone.points.pC.x,
                                    y: requestZone.points.pC.y
                                },
                                pD: {
                                    x: requestZone.points.pD.x,
                                    y: requestZone.points.pD.y
                                }
                            },
                            type: requestZone.type
                        });
                    })
                });

                try {
                    await this.capability.setVirtualRestrictions(virtualRestrictions);
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

module.exports = CombinedVirtualRestrictionsCapabilityRouter;
