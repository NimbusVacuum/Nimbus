const fs = require("fs");
const Logger = require("../../Logger");

const LinuxWifiScanCapability = require("../common/linuxCapabilities/LinuxWifiScanCapability");
const miioCapabilities = require("../common/miioCapabilities");

const DreameMapParser = require("./DreameMapParser");

const AttachmentStateAttribute = require("../../entities/state/attributes/AttachmentStateAttribute");
const AttributeSubscriber = require("../../entities/AttributeSubscriber");
const CallbackAttributeSubscriber = require("../../entities/CallbackAttributeSubscriber");
const entities = require("../../entities");
const MiioDummycloudNotConnectedError = require("../../miio/MiioDummycloudNotConnectedError");
const MiioErrorResponseRobotFirmwareError = require("../../miio/MiioErrorResponseRobotFirmwareError");
const MiioNimbusRobot = require("../MiioNimbusRobot");
const PendingMapChangeNimbusEvent = require("../../nimbus_events/events/PendingMapChangeNimbusEvent");
const NimbusMap = require("../../entities/map/NimbusMap");
const NimbusRobot = require("../../core/NimbusRobot");
const NimbusRobotError = require("../../entities/core/NimbusRobotError");

const stateAttrs = entities.state.attributes;

class DreameNimbusRobot extends MiioNimbusRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../NimbusEventStore")} options.nimbusEventStore
     * @param {object} [options.operationModes]
     * @param {object} options.miotServices
     * @param {object} options.miotServices.MAP
     * @param {number} options.miotServices.MAP.SIID
     * @param {object} options.miotServices.MAP.ACTIONS
     * @param {object} options.miotServices.MAP.ACTIONS.POLL
     * @param {number} options.miotServices.MAP.ACTIONS.POLL.AIID
     * @param {object} options.miotServices.MAP.PROPERTIES
     * @param {object} options.miotServices.MAP.PROPERTIES.MAP_DATA
     * @param {number} options.miotServices.MAP.PROPERTIES.MAP_DATA.PIID
     */
    constructor(options) {
        super(options);

        this.operationModes = options.operationModes ?? {};
        this.miotServices = options.miotServices;

        this.registerCapability(new miioCapabilities.MiioWifiConfigurationCapability({
            robot: this,
            networkInterface: "wlan0"
        }));

        if (this.config.get("embedded") === true) {
            this.registerCapability(new LinuxWifiScanCapability({
                robot: this,
                networkInterface: "wlan0"
            }));
        }
    }

    setEmbeddedParameters() {
        this.deviceConfPath = DreameNimbusRobot.DEVICE_CONF_PATH;
        this.tokenFilePath = DreameNimbusRobot.TOKEN_FILE_PATH;
    }

    async executeMapPoll() {
        let mapPollResult;
        try {
            mapPollResult = await this.sendCommand("action",
                {
                    did: this.deviceId,
                    siid: this.miotServices.MAP.SIID,
                    aiid: this.miotServices.MAP.ACTIONS.POLL.AIID,
                    in: [{
                        piid: 2,
                        value: "{\"frame_type\":\"I\", \"force_type\": 1, \"req_type\": 1}"
                    }]
                },
                {
                    timeout: 7000, // user ack timeout seems to appear after ~6s on the p2028 1156
                    interface: "cloud"
                }
            );
        } catch (e) {
            if (e instanceof MiioErrorResponseRobotFirmwareError && e.response?.message === "user ack timeout") {
                /*
                    Since we're polling IFrames much faster than the regular dreame map, occasionally, the dreame
                    firmware isn't quick enough to respond to our requests.

                    As this is expected, we just ignore that error
                 */
            } else if (e instanceof MiioDummycloudNotConnectedError) {
                /* intentional */
            } else {
                Logger.warn("Error while polling map", e);
            }

            return;
        }

        if (mapPollResult.code === 0 && Array.isArray(mapPollResult.out)) {
            for (let prop of mapPollResult.out) {
                if (prop.piid === this.miotServices.MAP.PROPERTIES.MAP_DATA.PIID && prop.value?.length > 15) {
                    try {
                        await this.preprocessAndParseMap(prop.value);
                    } catch (e) {
                        Logger.warn("Error while trying to parse map from miio", e);
                    }
                }
            }
        }
    }

    /**
     * Uploaded dreame Maps are actually base64 strings of zlib compressed data with two characters replaced
     *
     * @param {any} data
     * @returns {Promise<Buffer>}
     */
    async preprocessMap(data) {
        const preprocessedData = await DreameMapParser.PREPROCESS(data);

        if (preprocessedData) {
            return preprocessedData;
        } else {
            throw new Error("Invalid map data");
        }
    }

    async parseMap(data) {
        const parsedMap = await DreameMapParser.PARSE(data);

        if (parsedMap instanceof NimbusMap) {
            if (
                parsedMap.metaData?.dreamePendingMapChange === true &&
                this.state.map?.metaData?.dreamePendingMapChange !== true
            ) {
                this.nimbusEventStore.raise(new PendingMapChangeNimbusEvent({}));
            }

            this.state.map = parsedMap;

            this.emitMapUpdated();
        }

        return this.state.map;
    }

    /**
     * @public
     * @param {Buffer} data
     * @param {object} query implementation specific query parameters
     * @param {object} params implementation specific url parameters
     * @returns {Promise<void>}
     */
    async handleUploadedFDSData(data, query, params) {
        if (
            Buffer.isBuffer(data) &&
            (
                data[0] === 0x7b || data[0] === 0x5b // 0x7b = "{" 0x5b = "["
            )
        ) {
            Logger.trace("Received unhandled multi-map json", {
                query: query,
                params: params,
                data: data.toString()
            });
        } else if (
            Buffer.isBuffer(data) &&
            (
                data[0] === 0x42 && data[1] === 0x5a && data[2] === 0x68 // bzip2 magic bytes
            )
        ) {
            Logger.trace("Received unhandled map backup", {
                query: query,
                params: params
            });
        } else {
            await this.preprocessAndParseMap(data);
        }
    }

    /**
     * @protected
     * @param {Buffer| string} data
     * @returns {Promise<void>}
     */
    async preprocessAndParseMap(data) {
        const preprocessedMap = await this.preprocessMap(data);
        const parsedMap = await this.parseMap(preprocessedMap);

        if (!parsedMap) {
            Logger.warn("Failed to parse uploaded map");
        }
    }

    getManufacturer() {
        return "Dreame";
    }

    startup() {
        super.startup();

        if (this.config.get("embedded") === true) {
            const firmwareVersion = this.getFirmwareVersion();

            if (firmwareVersion.valid) {
                Logger.info("Firmware Version: " + firmwareVersion.arm);
            }
        }
    }

    initInternalSubscriptions() {
        super.initInternalSubscriptions();

        this.state.subscribe(
            new CallbackAttributeSubscriber((eventType,attachment, prevStatus) => {
                if (
                    eventType === AttributeSubscriber.EVENT_TYPE.CHANGE &&
                    attachment.type === AttachmentStateAttribute.TYPE.MOP &&
                    //@ts-ignore
                    attachment.attached === false
                ) {
                    try {
                        this.nimbusEventStore.setProcessed("mop_attachment_reminder");
                    } catch (e) {
                        //intentional
                    }
                }
            }),
            {attributeClass: AttachmentStateAttribute.name}
        );
    }

    /**
     * @private
     * @returns {{arm: string, valid: boolean}}
     */
    getFirmwareVersion() {
        const firmwareVersion = {
            arm: "???",
            valid: false
        };

        try {
            const os_release = fs.readFileSync("/etc/os-release").toString();
            const parsedFile = JSON.parse(os_release);

            if (parsedFile && parsedFile.fw_arm_ver) {
                firmwareVersion.valid = true;

                firmwareVersion.arm = parsedFile.fw_arm_ver.split("_")?.[1];
            }
        } catch (e) {
            Logger.warn("Unable to determine the Firmware Version", e);
        }

        return firmwareVersion;
    }

    getModelDetails() {
        return Object.assign(
            {},
            super.getModelDetails(),
            {
                supportedAttachments: [
                    stateAttrs.AttachmentStateAttribute.TYPE.WATERTANK,
                    stateAttrs.AttachmentStateAttribute.TYPE.MOP,
                ]
            }
        );
    }

    /**
     * @return {object}
     */
    getProperties() {
        const superProps = super.getProperties();
        const ourProps = {};

        if (this.config.get("embedded") === true) {
            const firmwareVersion = this.getFirmwareVersion();

            if (firmwareVersion.valid) {
                ourProps[NimbusRobot.WELL_KNOWN_PROPERTIES.FIRMWARE_VERSION] = firmwareVersion.arm;
            }
        }

        return Object.assign(
            {},
            superProps,
            ourProps
        );
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioNimbusRobot.READ_DEVICE_CONF(DreameNimbusRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && deviceConf.model === "dreame.vacuum.p2009");
    }
}

DreameNimbusRobot.DEVICE_CONF_PATH = "/data/config/miio/device.conf";
DreameNimbusRobot.TOKEN_FILE_PATH = "/data/config/miio/device.token";

DreameNimbusRobot.STATUS_MAP = Object.freeze({
    0: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    1: {
        value: stateAttrs.StatusStateAttribute.VALUE.PAUSED
    },
    2: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING
    },
    3: {
        value: stateAttrs.StatusStateAttribute.VALUE.RETURNING
    },
    4: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.SEGMENT
    },
    5: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING
    },
    6: {
        value: stateAttrs.StatusStateAttribute.VALUE.DOCKED
    },
    7: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    8: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    9: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    10: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    11: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    12: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    13: {
        value: stateAttrs.StatusStateAttribute.VALUE.MANUAL_CONTROL
    },
    14: { //Powersave
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    15: { //SelfTest/AutoRepair of the W10 dock?
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    16: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    17: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    18: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.SEGMENT
    },
    19: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.ZONE
    },
    20: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.SPOT
    },
    21: {
        value: stateAttrs.StatusStateAttribute.VALUE.MOVING,
        flag: stateAttrs.StatusStateAttribute.FLAG.MAPPING
    },
    // 22?
    23: {
        value: stateAttrs.StatusStateAttribute.VALUE.MOVING,
        flag: stateAttrs.StatusStateAttribute.FLAG.TARGET
    }
});

DreameNimbusRobot.FAN_SPEEDS = {
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.LOW]: 0,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 1,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.HIGH]: 2,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.MAX]: 3
};

DreameNimbusRobot.WATER_GRADES = Object.freeze({
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.LOW]: 1,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 2,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.HIGH]: 3,
});

DreameNimbusRobot.MOP_DOCK_STATUS_MAP = Object.freeze({
    0: stateAttrs.DockStatusStateAttribute.VALUE.IDLE,
    1: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING,
    2: stateAttrs.DockStatusStateAttribute.VALUE.DRYING,
    3: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING, //TODO: idle instead?
    4: stateAttrs.DockStatusStateAttribute.VALUE.PAUSE,
    5: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING,
    6: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING,
});

/**
 *
 * @param {string} vendorErrorCode
 *
 * @returns {NimbusRobotError}
 */
DreameNimbusRobot.MAP_ERROR_CODE = (vendorErrorCode) => {
    const parameters = {
        severity: {
            kind: NimbusRobotError.SEVERITY_KIND.UNKNOWN,
            level: NimbusRobotError.SEVERITY_LEVEL.UNKNOWN,
        },
        subsystem: NimbusRobotError.SUBSYSTEM.UNKNOWN,
        message: `Unknown error ${vendorErrorCode}`,
        vendorErrorCode: vendorErrorCode
    };

    switch (vendorErrorCode) {
        case "0":
            parameters.message = "No error";
            break;
        case "1":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = "Wheel lost floor contact";
            break;
        case "2":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Cliff sensor dirty or robot on the verge of falling";
            break;
        case "3":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Stuck front bumper";
            break;
        case "4":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Tilted robot";
            break;
        case "5":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Stuck front bumper";
            break;
        case "6":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = "Wheel lost floor contact";
            break;
        case "7":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "8":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Dustbin missing";
            break;
        case "9":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Water tank missing";
            break;
        case "10":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Water tank empty";
            break;
        case "11":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Dustbin full";
            break;
        case "12":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Main brush jammed";
            break;
        case "13":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Side brush jammed";
            break;
        case "14":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Filter jammed";
            break;
        case "15":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot stuck or trapped";
            break;
        case "16":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot stuck or trapped";
            break;
        case "17":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot stuck or trapped";
            break;
        case "18":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot stuck or trapped";
            break;
        case "19":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.POWER;
            parameters.message = "Charging station without power";
            break;
        case "20":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.INFO;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.POWER;
            parameters.message = "Low battery";
            break;
        case "21":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.POWER;
            parameters.message = "Charging error";
            break;
        //22
        case "23":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_HEART" //TODO What does the dreame error string mean?
            break;
        case "24":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Camera dirty";
            break;
        case "25":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_MOVE" //TODO What does the dreame error string mean?
            break;
        case "26":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Camera dirty";
            break;
        case "27":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Sensor dirty";
            break;
        case "28":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.POWER;
            parameters.message = "Charging station without power";
            break;
        case "29":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.POWER;
            parameters.message = "Battery temperature out of operating range";
            break;
        case "30":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Fan speed abnormal";
            break;
        case "31":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot stuck or trapped";
            break;
        case "32":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot stuck or trapped";
            break;
        case "33":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Accelerometer sensor error";
            break;
        case "34":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Gyroscope sensor error";
            break;
        case "35":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Gyroscope sensor error";
            break;
        case "36":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Left magnetic field sensor error";
            break;
        case "37":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Right magnetic field sensor error";
            break;
        case "38":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_I_FLOW_ERROR" //TODO What does the dreame error string mean?
            break;
        case "39":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_INFRARED_FAULT" //TODO What does the dreame error string mean?
            break;
        case "40":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Camera fault";
            break;
        case "41":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.INFO;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Magnetic interference";
            break;
        case "42":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Water pump fault";
            break;
        case "43":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = "RTC fault";
            break;
        case "44":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_I_AUTO_KEY_TRIG" //TODO What does the dreame error string mean?
            break;
        case "45":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = "3.3V rail abnormal";
            break;
        case "46":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "47":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "48":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "LDS jammed";
            break;
        case "49":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "LDS bumper jammed";
            break;
        case "50":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "51":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Filter jammed";
            break;
        case "52":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "53":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "ToF Sensor offline";
            break;
        case "54":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Wall sensor dirty";
            break;
        case "55":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_CARPET_WATEBOX_START" //TODO What does the dreame error string mean?
            break;
        case "56":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "57":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "58":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "59":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Robot trapped by virtual restrictions";
            break;
        case "60":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.CORE;
            parameters.message = `Internal error ${vendorErrorCode}`;
            break;
        case "61":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "62":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "63":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "64":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "65":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "66":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
        case "67":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Cannot reach target";
            break;
            // 68: Not an Error. "Docked but mop is still attached. Please remove the mop"

            /*
                TODO figure out what these p2027 codes mean
                69 "AVA_HEALTH_STATUS_TYPE_MOP_CHECK"
                70 "AVA_HEALTH_STATUS_TYPE_FASTMAPMODE_MOPCHECK"
             */

        case "71":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Mop motor fault";
            break;
        case "72":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Mop motor current abnormal";
            break;

        case "-2":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "Stuck inside restricted area";
            break;

        case "101":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Auto-Empty Dock dust bag full or dust duct clogged";
            break;
        case "102":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Auto-Empty Dock cover open or missing dust bag";
            break;
        case "103":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Auto-Empty Dock cover open or missing dust bag";
            break;
        case "104":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Auto-Empty Dock dust bag full or dust duct clogged";
            break;

        case "105":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Clean Water Tank not installed";
            break;
        case "106":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Wastewater Tank not installed or full";
            break;
        case "107":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Clean Water Tank empty";
            break;
        case "108":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Wastewater Tank not installed or full";
            break;
        case "109":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Wastewater pipe clogged";
            break;
        case "110":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Wastewater pump damaged";
            break;
        case "111":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Tray not installed";
            break;
        case "112":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Tray full of water";
            break;
        // 114: Not an Error. "Please remember to clean the mop tray"
        case "116":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Clean Water Tank empty";
            break;
        case "118":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Wastewater Tank not installed or full";
            break;
        case "119":
            parameters.severity.kind = NimbusRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = NimbusRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = NimbusRobotError.SUBSYSTEM.DOCK;
            parameters.message = "Mop Dock Tray full of water";
            break;
    }

    return new NimbusRobotError(parameters);
};

module.exports = DreameNimbusRobot;
