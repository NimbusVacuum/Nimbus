const EventEmitter = require("events").EventEmitter;

const AttributeSubscriber = require("../entities/AttributeSubscriber");
const CallbackAttributeSubscriber = require("../entities/CallbackAttributeSubscriber");
const ConsumableDepletedNimbusEvent = require("../nimbus_events/events/ConsumableDepletedNimbusEvent");
const entities = require("../entities");
const ErrorStateNimbusEvent = require("../nimbus_events/events/ErrorStateNimbusEvent");
const NotImplementedError = require("./NotImplementedError");
const {ConsumableStateAttribute, StatusStateAttribute} = require("../entities/state/attributes");

class NimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../Configuration")} options.config
     * @param {import("../NimbusEventStore")} options.nimbusEventStore
     */
    constructor(options) {
        /** @private */
        this.eventEmitter = new EventEmitter();
        this.nimbusEventStore = options.nimbusEventStore;
        this.config = options.config;
        this.capabilities = {};

        this.state = new entities.state.RobotState({
            map: NimbusRobot.DEFAULT_MAP
        });

        this.initInternalSubscriptions();
    }

    /**
     * @public
     */
    clearNimbusMap() {
        this.state.map = NimbusRobot.DEFAULT_MAP;

        this.emitMapUpdated();
    }

    /**
     *
     * @param {import("./capabilities/Capability")} capability
     */
    registerCapability(capability) {
        if (!this.capabilities[capability.type]) {
            this.capabilities[capability.type] = capability;
        } else {
            throw new Error("Attempted to register more than one capability of type " + capability.type);
        }
    }

    /**
     * @public
     * @param {string} capabilityType
     * @returns {boolean}
     */
    hasCapability(capabilityType) {
        return this.capabilities[capabilityType] !== undefined;
    }

    /**
     * Always polls the latest state from the robot
     *
     * @returns {Promise<import("../entities/state/RobotState")>}
     */
    async pollState() {
        return this.state;
    }

    /**
     * Parses a state update and updates the internal state.
     * Updates might be partial
     *
     * @param {*} data
     */
    parseAndUpdateState(data) {
        throw new NotImplementedError();
    }

    /**
     * @protected
     */
    initInternalSubscriptions() {
        this.state.subscribe(
            new CallbackAttributeSubscriber((eventType, consumable) => {
                if (eventType !== AttributeSubscriber.EVENT_TYPE.DELETE) {
                    //@ts-ignore
                    if (consumable?.remaining?.value === 0) {
                        this.nimbusEventStore.raise(new ConsumableDepletedNimbusEvent({
                            type: consumable.type,
                            subType: consumable.subType
                        }));
                    }
                }
            }),
            {attributeClass: ConsumableStateAttribute.name}
        );

        this.state.subscribe(
            new CallbackAttributeSubscriber((eventType, status, prevStatus) => {
                if (
                    //@ts-ignore
                    (eventType === AttributeSubscriber.EVENT_TYPE.ADD && status.value === StatusStateAttribute.VALUE.ERROR) ||
                    (
                        eventType === AttributeSubscriber.EVENT_TYPE.CHANGE &&
                        //@ts-ignore
                        status.value === StatusStateAttribute.VALUE.ERROR &&
                        prevStatus &&
                        //@ts-ignore
                        prevStatus.value !== StatusStateAttribute.VALUE.ERROR
                    )
                ) {
                    this.nimbusEventStore.raise(new ErrorStateNimbusEvent({
                        //@ts-ignore
                        message: status.error?.message ?? "Unknown Error"
                    }));
                }
            }),
            {attributeClass: StatusStateAttribute.name}
        );
    }

    /**
     * This function allows us to inject custom routes into the main webserver
     * Usually, this should never be used unless there are _very_ important reasons to do so
     *
     * @param {any} app The expressjs app instance
     */
    initModelSpecificWebserverRoutes(app) {
        //intentional
    }

    async shutdown() {
        //intentional
    }

    getManufacturer() {
        return "Nimbus";
    }

    getModelName() {
        return "NimbusRobot";
    }

    /**
     * @typedef {object} ModelDetails
     * @property {Array<import("../entities/state/attributes/AttachmentStateAttribute").AttachmentStateAttributeType>} supportedAttachments
     */

    /**
     * This method may be overridden to return model-specific details
     * such as which types of attachments to expect in the state
     *
     * @returns {ModelDetails}
     */
    getModelDetails() {
        return {
            supportedAttachments: []
        };
    }

    /**
     * This method may be overridden to return robot-specific well-known properties
     * such as the firmware version
     *
     * @returns {object}
     */
    getProperties() {
        return {};
    }

    /**
     * Basically used to log some more robot-specific information
     */
    startup() {
        //intentional
    }

    /**
     * @protected
     */
    emitStateUpdated() {
        this.eventEmitter.emit(NimbusRobot.EVENTS.StateUpdated);
    }

    /**
     * @public
     * @param {() => void} listener
     */
    onStateUpdated(listener) {
        this.eventEmitter.on(NimbusRobot.EVENTS.StateUpdated, listener);
    }

    /**
     * @protected
     */
    emitStateAttributesUpdated() {
        this.emitStateUpdated();

        this.eventEmitter.emit(NimbusRobot.EVENTS.StateAttributesUpdated);
    }

    /**
     * @public
     * @param {() => void} listener
     */
    onStateAttributesUpdated(listener) {
        this.eventEmitter.on(NimbusRobot.EVENTS.StateAttributesUpdated, listener);
    }

    /**
     * @protected
     */
    emitMapUpdated() {
        this.emitStateUpdated();

        this.eventEmitter.emit(NimbusRobot.EVENTS.MapUpdated);
    }

    /**
     * @public
     * @param {() => void} listener
     */
    onMapUpdated(listener) {
        this.eventEmitter.on(NimbusRobot.EVENTS.MapUpdated, listener);
    }

    /**
     *
     * This very badly named function is used for the implementation autodetection feature
     *
     * Returns true if the implementation thinks that it's the right one for this particular robot
     */
    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        return false;
    }
}

NimbusRobot.EVENTS = {
    StateUpdated: "StateUpdated",
    StateAttributesUpdated: "StateAttributesUpdated",
    MapUpdated: "MapUpdated"
};

NimbusRobot.DEFAULT_MAP = require("../res/default_map");

NimbusRobot.WELL_KNOWN_PROPERTIES = {
    FIRMWARE_VERSION: "firmwareVersion"
};

module.exports = NimbusRobot;
