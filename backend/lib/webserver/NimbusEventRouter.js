const express = require("express");

class NimbusEventRouter {
    /**
     *
     * @param {object} options
     * @param {import("../NimbusEventStore")} options.nimbusEventStore
     * @param {*} options.validator
     */
    constructor(options) {
        this.router = express.Router({mergeParams: true});

        this.nimbusEventStore = options.nimbusEventStore;
        this.validator = options.validator;

        this.initRoutes();
    }

    initRoutes() {
        this.router.get("/", (req, res) => {
            res.json(this.nimbusEventStore.getAll());
        });

        this.router.get("/:id", (req, res) => {
            const event = this.nimbusEventStore.getById(req.params.id);

            if (event) {
                res.json(event);
            } else {
                res.sendStatus(404);
            }
        });

        this.router.put("/:id/interact", this.validator, async (req, res) => {
            const event = this.nimbusEventStore.getById(req.params.id);

            if (event) {
                if (req.body.interaction) {
                    try {
                        await this.nimbusEventStore.interact(event, req.body.interaction);
                    } catch (e) {
                        return res.status(500).send("Failed to interact with event: " + e?.message);
                    }

                    res.json(event);
                } else {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(404);
            }
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = NimbusEventRouter;
