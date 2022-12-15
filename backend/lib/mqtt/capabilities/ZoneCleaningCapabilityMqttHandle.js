const CapabilityMqttHandle = require("./CapabilityMqttHandle");
const DataType = require("../homie/DataType");
const PropertyMqttHandle = require("../handles/PropertyMqttHandle");
const NimbusZone = require("../../entities/core/NimbusZone");

class ZoneCleaningCapabilityMqttHandle extends CapabilityMqttHandle {
    /**
     * @param {object} options
     * @param {import("../handles/RobotMqttHandle")} options.parent
     * @param {import("../MqttController")} options.controller MqttController instance
     * @param {import("../../core/NimbusRobot")} options.robot
     * @param {import("../../core/capabilities/ZoneCleaningCapability")} options.capability
     */
    constructor(options) {
        super(Object.assign(options, {
            friendlyName: "Zone cleaning"
        }));
        this.capability = options.capability;

        this.registerChild(new PropertyMqttHandle({
            parent: this,
            controller: this.controller,
            topicName: "start",
            friendlyName: "Start zoned cleaning",
            datatype: DataType.STRING,
            format: "same json as the REST interface",
            setter: async (value) => {
                const req = JSON.parse(value);

                if (Array.isArray(req?.zones)) {
                    await this.capability.start(req.zones.map(z => {
                        if (!(z.points)) {
                            throw new Error("Invalid Zone");
                        }

                        return new NimbusZone({
                            points: {
                                pA: {
                                    x: z.points.pA?.x,
                                    y: z.points.pA?.y,
                                },
                                pB: {
                                    x: z.points.pB?.x,
                                    y: z.points.pB?.y,
                                },
                                pC: {
                                    x: z.points.pC?.x,
                                    y: z.points.pC?.y,
                                },
                                pD: {
                                    x: z.points.pD?.x,
                                    y: z.points.pD?.y,
                                },
                            },
                            iterations: z.iterations
                        });
                    }));
                } else {
                    throw new Error("Invalid zone cleaning payload");
                }
            },
            helpText: "This handle accepts a JSON object identical to the one used by the REST API.\n\n" +
                "Please refer to the \"General Help\" section in Nimbus for more information.\n\n" +
                "Sample payload:\n\n" +
                "```json\n" +
                JSON.stringify({
                    zones: [
                        {
                            iterations: 1,
                            points: {
                                pA: {
                                    x: 50,
                                    y: 50
                                },
                                pB: {
                                    x: 100,
                                    y: 50
                                },
                                pC: {
                                    x: 100,
                                    y: 100
                                },
                                pD: {
                                    x: 50,
                                    y: 100
                                }
                            }
                        }
                    ]
                }, null, 2) +
                "\n```"
        }));
    }

}

ZoneCleaningCapabilityMqttHandle.OPTIONAL = false;

module.exports = ZoneCleaningCapabilityMqttHandle;
