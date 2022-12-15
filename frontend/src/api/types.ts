import {AttachmentStateAttributeType} from "./RawRobotState";

export enum Capability {
    AutoEmptyDockAutoEmptyControl = "AutoEmptyDockAutoEmptyControlCapability",
    AutoEmptyDockManualTrigger = "AutoEmptyDockManualTriggerCapability",
    BasicControl = "BasicControlCapability",
    CarpetModeControl = "CarpetModeControlCapability",
    CombinedVirtualRestrictions = "CombinedVirtualRestrictionsCapability",
    ConsumableMonitoring = "ConsumableMonitoringCapability",
    CurrentStatistics = "CurrentStatisticsCapability",
    DoNotDisturb = "DoNotDisturbCapability",
    FanSpeedControl = "FanSpeedControlCapability",
    GoToLocation = "GoToLocationCapability",
    KeyLock = "KeyLockCapability",
    Locate = "LocateCapability",
    ManualControl = "ManualControlCapability",
    MapReset = "MapResetCapability",
    MapSegmentEdit = "MapSegmentEditCapability",
    MapSegmentRename = "MapSegmentRenameCapability",
    MapSegmentation = "MapSegmentationCapability",
    MapSnapshot = "MapSnapshotCapability",
    MappingPass = "MappingPassCapability",
    MopDockCleanManualTrigger = "MopDockCleanManualTriggerCapability",
    MopDockDryManualTrigger = "MopDockDryManualTriggerCapability",
    OperationModeControl = "OperationModeControlCapability",
    PersistentMapControl = "PersistentMapControlCapability",
    SpeakerTest = "SpeakerTestCapability",
    SpeakerVolumeControl = "SpeakerVolumeControlCapability",
    TotalStatistics = "TotalStatisticsCapability",
    VoicePackManagement = "VoicePackManagementCapability",
    WaterUsageControl = "WaterUsageControlCapability",
    WifiConfiguration = "WifiConfigurationCapability",
    WifiScan = "WifiScanCapability",
    ZoneCleaning = "ZoneCleaningCapability",
    Quirks = "QuirksCapability",
}

export type Point = {
    x: number;
    y: number;
};

export interface Zone {
    points: {
        pA: Point;
        pB: Point;
        pC: Point;
        pD: Point;
    };
    iterations: number;
}

export interface ZoneProperties {
    zoneCount: {
        min: number;
        max: number;
    };
    iterationCount: {
        min: number;
        max: number;
    };
}

export interface MapSegmentationProperties {
    iterationCount: {
        min: number;
        max: number;
    };
    customOrderSupport: boolean;
}

export interface Segment {
    id: string;
    name?: string;
}

export interface RobotInformation {
    manufacturer: string;
    modelName: string;
    modelDetails: {
        supportedAttachments: Array<AttachmentStateAttributeType>;
    }
    implementation: string;
}

export interface NimbusInformation {
    embedded: boolean;
    systemId: string;
}

export interface NimbusVersion {
    release: string;
    commit: string;
}

export interface SystemHostInfo {
    hostname: string;
    arch: string;
    mem: {
        total: number;
        free: number;
        nimbus_current: number;
        nimbus_max: number;
    };
    uptime: number;
    load: {
        1: number;
        5: number;
        15: number;
    };
}

export interface SystemRuntimeInfo {
    uptime: number;
    argv: Array<string>;
    execArgv: Array<string>;
    execPath: string;
    uid: number;
    gid: number;
    pid: number;
    versions: Record<string, string>;
    env: Record<string, string>
}

export interface MapSegmentationActionRequestParameters {
    segment_ids: string[];
    iterations?: number;
    customOrder?: boolean;
}

export interface MapSegmentEditJoinRequestParameters {
    segment_a_id: string;
    segment_b_id: string;
}

export interface MapSegmentEditSplitRequestParameters {
    segment_id: string;
    pA: Point;
    pB: Point;
}

export interface MapSegmentRenameRequestParameters {
    segment_id: string;
    name: string;
}

export interface ConsumableState {
    type: string;
    subType?: string;
    remaining: {
        value: number;
        unit: "percent" | "minutes";
    }
}

export interface ConsumableId {
    type: string;
    subType?: string;
}

export interface Timer {
    id: string;
    enabled: boolean;
    dow: Array<number>;
    hour: number;
    minute: number;
    action: {
        type: string;
        params: Record<string, unknown>;
    };
}

export interface TimerInformation {
    [id: string]: Timer;
}

export interface TimerProperties {
    supportedActions: Array<string>;
}

export interface MQTTConfiguration {
    enabled: boolean;
    connection: {
        host: string;
        port: number;
        tls: {
            enabled: boolean;
            ca: string;
        };
        authentication: {
            credentials: {
                enabled: boolean;
                username: string;
                password: string;
            };
            clientCertificate: {
                enabled: boolean;
                certificate: string;
                key: string;
            };
        };
    };
    identity: {
        friendlyName: string;
        identifier: string;
    };
    customizations: {
        topicPrefix: string;
        provideMapData: boolean;
    };
    interfaces: {
        homie: {
            enabled: boolean;
            addICBINVMapProperty: boolean;
            cleanAttributesOnShutdown: boolean;
        };
        homeassistant: {
            enabled: boolean;
            cleanAutoconfOnShutdown: boolean;
        };
    };
    optionalExposedCapabilities: Array<string>;
}

export interface MQTTStatus {
    state: "init" | "ready" | "disconnected" | "lost" | "alert",
    stats: {
        messages: {
            count: {
                received: number;
                sent: number;
            },
            bytes: {
                received: number;
                sent: number;
            }
        },
        connection: {
            connects: number;
            disconnects: number;
            reconnects: number;
            errors: number;
        }
    }
}

export interface MQTTProperties {
    defaults: {
        identity: {
            friendlyName: string;
            identifier: string;
        };
        customizations: {
            topicPrefix: string;
        };
    };
    optionalExposableCapabilities: Array<string>;
}

export interface HTTPBasicAuthConfiguration {
    enabled: boolean;
    username: string;
    password: string;
}

export interface NetworkAdvertisementConfiguration {
    enabled: boolean;
}

export interface NetworkAdvertisementProperties {
    port: number;
    zeroconfHostname: string;
}

export interface NTPClientState {
    __class: "NimbusNTPClientDisabledState" | "NimbusNTPClientEnabledState" | "NimbusNTPClientErrorState" | "NimbusNTPClientSyncedState";
    timestamp: string;
    type?: "unknown" | "transient" | "name_resolution" | "connection" | "persisting";
    message?: string;
    offset?: number;
}

export interface NTPClientConfiguration {
    enabled: boolean;
    server: string;
    port: number;
    interval: number;
    timeout: number;
}

export interface NimbusEvent {
    __class: string;
    id: string;
    timestamp: string;
    processed: boolean;
    type?: string;
    subType?: string;
    message?: string;
}

export interface NimbusEventInteraction {
    interaction: "ok" | "yes" | "no" | "reset";
}

// Helper for Hook
export interface NimbusEventInteractionContext {
    id: string;
    interaction: NimbusEventInteraction;
}

export enum LogLevel {
    trace = "trace",
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error"
}

export interface LogLevelResponse {
    current: string;
    presets: Array<LogLevel>;
}

export interface SetLogLevelRequest {
    level: LogLevel;
}

export interface LogLine {
    timestamp: Date,
    level: LogLevel,
    content: string
}

export interface SimpleToggleState {
    enabled: boolean;
}

export interface SpeakerVolumeState {
    volume: number;
}

export interface VoicePackManagementStatus {
    currentLanguage: string;
    operationStatus: {
        type: "idle" | "downloading" | "installing" | "error";
        progress?: number;
    }
}

export interface VoicePackManagementCommand {
    action: "download";
    url: string;
    language: string;
    hash: string;
}

export interface DoNotDisturbTime {
    hour: number;
    minute: number;
}

export interface DoNotDisturbConfiguration {
    enabled: boolean;
    start: DoNotDisturbTime;
    end: DoNotDisturbTime;
}

export interface WifiConfiguration {
    ssid: string;
    credentials: {
        type: "wpa2_psk";
        typeSpecificSettings: {
            password: string;
        };
    }

}

export interface WifiStatus {
    state: "connected" | "not_connected" | "unknown";
    details: {
        ssid?: string;
        downspeed?: number;
        upspeed?: number;
        signal?: number;
        ips?: string[];
        frequency?: "2.4ghz" | "5ghz";
    };
}

export interface WifiConfigurationProperties {
    provisionedReconfigurationSupported: boolean;
}

export interface WifiProvisioningEncryptionKey {
    type: "rsa";
    publicKey: string;
}

export interface NimbusWifiNetwork {
    bssid: string,
    details: {
        ssid?: string,
        signal?: number
    }
}

export type ManualControlAction = "enable" | "disable" | "move";

export type ManualControlCommand = "forward" | "backward" | "rotate_clockwise" | "rotate_counterclockwise";

export interface ManualControlProperties {
    supportedMovementCommands: Array<ManualControlCommand>;
}

export interface ManualControlInteraction {
    action: ManualControlAction;
    movementCommand?: ManualControlCommand;
}

export enum NimbusRestrictedZoneType {
    Regular = "regular",
    Mop = "mop"
}

export interface NimbusRestrictedZone {
    type: NimbusRestrictedZoneType,
    points: {
        pA: Point,
        pB: Point,
        pC: Point,
        pD: Point
    }
}

export interface CombinedVirtualRestrictionsUpdateRequestParameters {
    virtualWalls: Array<{
        points: {
            pA: Point,
            pB: Point
        }
    }>,
    restrictedZones: Array<NimbusRestrictedZone>
}

export interface CombinedVirtualRestrictionsProperties {
    supportedRestrictedZoneTypes: Array<NimbusRestrictedZoneType>
}

export interface UpdaterState {
    __class: "NimbusUpdaterIdleState" | "NimbusUpdaterErrorState" | "NimbusUpdaterApprovalPendingState" | "NimbusUpdaterDownloadingState" | "NimbusUpdaterApplyPendingState" | "NimbusUpdaterDisabledState" | "NimbusUpdaterNoUpdateRequiredState";
    timestamp: string;
    busy: boolean;
    type?: "unknown" | "not_embedded" | "not_docked" | "not_writable" | "not_enough_space" | "download_failed" | "no_matching_binary" | "missing_manifest" | "invalid_manifest" | "invalid_checksum";
    message?: string;
    currentVersion?: string;
    version?: string;
    releaseTimestamp?: string;
    changelog?: string;
    downloadUrl?: string;
    expectedHash?: string;
    downloadPath?: string;
}

export type NimbusDataPointType = "count" | "time" | "area"

export interface NimbusDataPoint {
    timestamp: string,
    type: NimbusDataPointType,
    value: number
}

export interface StatisticsProperties {
    availableStatistics: Array<NimbusDataPointType>
}

export interface Quirk {
    id: string,
    options: Array<string>,
    title: string,
    description: string,
    value: string
}

export interface SetQuirkValueCommand {
    id: string,
    value: string
}

export interface RobotProperties {
    firmwareVersion: string
}
