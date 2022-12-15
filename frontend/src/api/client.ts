import axios from "axios";
import { JSEncrypt } from "jsencrypt";
import { RawMapData } from "./RawMapData";
import { PresetSelectionState, RobotAttribute } from "./RawRobotState";
import {
    Capability,
    CombinedVirtualRestrictionsProperties,
    CombinedVirtualRestrictionsUpdateRequestParameters,
    ConsumableId,
    ConsumableState,
    DoNotDisturbConfiguration,
    HTTPBasicAuthConfiguration,
    LogLevelResponse,
    ManualControlInteraction,
    ManualControlProperties,
    MapSegmentationActionRequestParameters,
    MapSegmentationProperties,
    MapSegmentEditJoinRequestParameters,
    MapSegmentEditSplitRequestParameters,
    MapSegmentRenameRequestParameters,
    MQTTConfiguration,
    MQTTProperties,
    MQTTStatus,
    NetworkAdvertisementConfiguration,
    NetworkAdvertisementProperties,
    NTPClientConfiguration,
    NTPClientState,
    Point,
    Quirk,
    RobotInformation,
    RobotProperties,
    Segment,
    SetLogLevelRequest,
    SetQuirkValueCommand,
    SimpleToggleState,
    SpeakerVolumeState,
    StatisticsProperties,
    SystemHostInfo,
    SystemRuntimeInfo,
    Timer,
    TimerInformation,
    TimerProperties,
    UpdaterState,
    NimbusDataPoint,
    NimbusEvent,
    NimbusEventInteractionContext,
    NimbusInformation,
    NimbusVersion,
    NimbusWifiNetwork,
    VoicePackManagementCommand,
    VoicePackManagementStatus,
    WifiConfiguration, WifiConfigurationProperties,
    WifiProvisioningEncryptionKey,
    WifiStatus,
    Zone,
    ZoneProperties,
} from "./types";
import { floorObject } from "./utils";
import {preprocessMap} from "./mapUtils";
import ReconnectingEventSource from "reconnecting-eventsource";

export const nimbusAPI = axios.create({
    baseURL: "./api/v2",
});

let currentCommitId = "unknown";

nimbusAPI.interceptors.response.use(response => {
    /*
       As using an outdated frontend with an updated backend might lead to undesirable
       or even catastrophic results, we try to automatically detect this state and
       act accordingly.
       By just looking at the response headers of any api request, we avoid additional
       periodic API requests for polling the current version.

       If something such as a reverse proxy strips these headers, the check will not work.
       Users of advanced setups like these should remember to press ctrl + f5 to force refresh
       after each Nimbus update
    */
    if (response.headers["x-nimbus-commit-id"]) {
        if (currentCommitId !== response.headers["x-nimbus-commit-id"]) {
            if (currentCommitId === "unknown") {
                currentCommitId = response.headers["x-nimbus-commit-id"];
            } else {
                /*
                    While we could display a textbox informing the user that the backend changed,
                    there wouldn't be any benefit to that as the refresh is mandatory anyways

                    By just calling location.reload() here, we avoid having to somehow inject the currentCommitId
                    value from this mostly stateless api layer into the React application state
                 */
                location.reload();
            }
        }
    }

    return response;
});

const SSETracker = new Map<string, () => () => void>();

const subscribeToSSE = <T>(
    endpoint: string,
    event: string,
    listener: (data: T) => void,
    raw = false,
): (() => void) => {
    const key = `${endpoint}@${event}@${raw}`;
    const tracker = SSETracker.get(key);
    if (tracker !== undefined) {
        return tracker();
    }

    const source = new ReconnectingEventSource(nimbusAPI.defaults.baseURL + endpoint, {
        withCredentials: true,
        max_retry_time: 30000
    });

    source.addEventListener(event, (event: any) => {
        listener(raw ? event.data : JSON.parse(event.data));
    });
    // eslint-disable-next-line no-console
    console.log(`[SSE] Subscribed to ${endpoint} ${event}`);

    let subscribers = 0;
    const subscriber = () => {
        subscribers += 1;

        return () => {
            subscribers -= 1;

            if (subscribers <= 0) {
                source.close();
                SSETracker.delete(key);
            }
        };
    };

    SSETracker.set(key, subscriber);

    return subscriber();
};

export const fetchCapabilities = (): Promise<Capability[]> => {
    return nimbusAPI
        .get<Capability[]>("/robot/capabilities")
        .then(({data}) => {
            return data;
        });
};

export const fetchMap = (): Promise<RawMapData> => {
    return nimbusAPI.get<RawMapData>("/robot/state/map").then(({data}) => {
        return preprocessMap(data);
    });
};

export const subscribeToMap = (
    listener: (data: RawMapData) => void
): (() => void) => {
    return subscribeToSSE(
        "/robot/state/map/sse",
        "MapUpdated",
        (data: RawMapData) => {
            listener(preprocessMap(data));
        });
};

export const fetchStateAttributes = async (): Promise<RobotAttribute[]> => {
    return nimbusAPI
        .get<RobotAttribute[]>("/robot/state/attributes")
        .then(({data}) => {
            return data;
        });
};

export const subscribeToStateAttributes = (
    listener: (data: RobotAttribute[]) => void
): (() => void) => {
    return subscribeToSSE<RobotAttribute[]>(
        "/robot/state/attributes/sse",
        "StateAttributesUpdated",
        (data) => {
            return listener(data);
        }
    );
};

export const fetchPresetSelections = async (
    capability: Capability.FanSpeedControl | Capability.WaterUsageControl | Capability.OperationModeControl
): Promise<PresetSelectionState["value"][]> => {
    return nimbusAPI
        .get<PresetSelectionState["value"][]>(
            `/robot/capabilities/${capability}/presets`
        )
        .then(({data}) => {
            return data;
        });
};

export const updatePresetSelection = async (
    capability: Capability.FanSpeedControl | Capability.WaterUsageControl | Capability.OperationModeControl,
    level: PresetSelectionState["value"]
): Promise<void> => {
    await nimbusAPI.put(`/robot/capabilities/${capability}/preset`, {
        name: level,
    });
};

export type BasicControlCommand = "start" | "stop" | "pause" | "home";
export const sendBasicControlCommand = async (
    command: BasicControlCommand
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.BasicControl}`,
        {
            action: command,
        }
    );
};

export const sendGoToCommand = async (point: Point): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.GoToLocation}`,
        {
            action: "goto",
            coordinates: floorObject(point),
        }
    );
};

export const fetchZoneProperties = async (): Promise<ZoneProperties> => {
    return nimbusAPI
        .get<ZoneProperties>(
            `/robot/capabilities/${Capability.ZoneCleaning}/properties`
        )
        .then(({data}) => {
            return data;
        });
};

export const sendCleanTemporaryZonesCommand = async (
    zones: Zone[]
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.ZoneCleaning}`,
        {
            action: "clean",
            zones: zones.map(floorObject),
        }
    );
};

export const fetchSegments = async (): Promise<Segment[]> => {
    return nimbusAPI
        .get<Segment[]>(`/robot/capabilities/${Capability.MapSegmentation}`)
        .then(({data}) => {
            return data;
        });
};

export const fetchMapSegmentationProperties = async (): Promise<MapSegmentationProperties> => {
    return nimbusAPI
        .get<MapSegmentationProperties>(
            `/robot/capabilities/${Capability.MapSegmentation}/properties`
        )
        .then(({data}) => {
            return data;
        });
};

export const sendCleanSegmentsCommand = async (
    parameters: MapSegmentationActionRequestParameters
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.MapSegmentation}`,
        {
            action: "start_segment_action",
            segment_ids: parameters.segment_ids,
            iterations: parameters.iterations ?? 1,
            customOrder: parameters.customOrder ?? false
        }
    );
};

export const sendJoinSegmentsCommand = async (
    parameters: MapSegmentEditJoinRequestParameters
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.MapSegmentEdit}`,
        {
            action: "join_segments",
            segment_a_id: parameters.segment_a_id,
            segment_b_id: parameters.segment_b_id
        }
    );
};

export const sendSplitSegmentCommand = async (
    parameters: MapSegmentEditSplitRequestParameters
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.MapSegmentEdit}`,
        {
            action: "split_segment",
            segment_id: parameters.segment_id,
            pA: parameters.pA,
            pB: parameters.pB
        }
    );
};

export const sendRenameSegmentCommand = async (
    parameters: MapSegmentRenameRequestParameters
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.MapSegmentRename}`,
        {
            action: "rename_segment",
            segment_id: parameters.segment_id,
            name: parameters.name
        }
    );
};

export const sendLocateCommand = async (): Promise<void> => {
    await nimbusAPI.put(`/robot/capabilities/${Capability.Locate}`, {
        action: "locate",
    });
};

export const sendAutoEmptyDockManualTriggerCommand = async (): Promise<void> => {
    await nimbusAPI.put(`/robot/capabilities/${Capability.AutoEmptyDockManualTrigger}`, {
        action: "trigger",
    });
};

export const fetchConsumableStateInformation = async (): Promise<Array<ConsumableState>> => {
    return nimbusAPI
        .get<Array<ConsumableState>>(`/robot/capabilities/${Capability.ConsumableMonitoring}`)
        .then(({data}) => {
            return data;
        });
};

export const sendConsumableReset = async (parameters: ConsumableId): Promise<void> => {
    let urlFragment = `${parameters.type}`;
    if (parameters.subType) {
        urlFragment += `/${parameters.subType}`;
    }
    return nimbusAPI
        .put(`/robot/capabilities/${Capability.ConsumableMonitoring}/${urlFragment}`, {
            action: "reset",
        })
        .then(({status}) => {
            if (status !== 200) {
                throw new Error("Could not reset consumable");
            }
        });
};

export const fetchRobotInformation = async (): Promise<RobotInformation> => {
    return nimbusAPI.get<RobotInformation>("/robot").then(({data}) => {
        return data;
    });
};

export const fetchNimbusInformation = async (): Promise<NimbusInformation> => {
    return nimbusAPI.get<NimbusInformation>("/nimbus").then(({data}) => {
        return data;
    });
};

export const fetchNimbusVersionInformation = async (): Promise<NimbusVersion> => {
    return nimbusAPI
        .get<NimbusVersion>("/nimbus/version")
        .then(({data}) => {
            return data;
        });
};

export const fetchNimbusLog = async (): Promise<string> => {
    return nimbusAPI
        .get<string>("/nimbus/log/content")
        .then(({ data }) => {
            return data;
        });
};

export const subscribeToLogMessages = (
    listener: (data: string) => void
): (() => void) => {
    return subscribeToSSE<string>(
        "/nimbus/log/content/sse",
        "LogMessage",
        (data) => {
            return listener(data);
        },
        true
    );
};

export const fetchNimbusLogLevel = async (): Promise<LogLevelResponse> => {
    return nimbusAPI
        .get<LogLevelResponse>("/nimbus/log/level")
        .then(({ data }) => {
            return data;
        });
};

export const sendNimbusLogLevel = async (logLevel: SetLogLevelRequest): Promise<void> => {
    await nimbusAPI
        .put("/nimbus/log/level", logLevel)
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not set new log level");
            }
        });
};

export const fetchSystemHostInfo = async (): Promise<SystemHostInfo> => {
    return nimbusAPI
        .get<SystemHostInfo>("/system/host/info")
        .then(({data}) => {
            return data;
        });
};

export const fetchSystemRuntimeInfo = async (): Promise<SystemRuntimeInfo> => {
    return nimbusAPI
        .get<SystemRuntimeInfo>("/system/runtime/info")
        .then(({data}) => {
            return data;
        });
};

export const fetchMQTTConfiguration = async (): Promise<MQTTConfiguration> => {
    return nimbusAPI
        .get<MQTTConfiguration>("/nimbus/config/interfaces/mqtt")
        .then(({data}) => {
            return data;
        });
};

export const sendMQTTConfiguration = async (mqttConfiguration: MQTTConfiguration): Promise<void> => {
    return nimbusAPI
        .put("/nimbus/config/interfaces/mqtt", mqttConfiguration)
        .then(({status}) => {
            if (status !== 200) {
                throw new Error("Could not update MQTT configuration");
            }
        });
};

export const fetchMQTTStatus = async (): Promise<MQTTStatus> => {
    return nimbusAPI
        .get<MQTTStatus>("/mqtt/status")
        .then(({data}) => {
            return data;
        });
};

export const fetchMQTTProperties = async (): Promise<MQTTProperties> => {
    return nimbusAPI
        .get<MQTTProperties>("/mqtt/properties")
        .then(({data}) => {
            return data;
        });
};

export const fetchHTTPBasicAuthConfiguration = async (): Promise<HTTPBasicAuthConfiguration> => {
    return nimbusAPI
        .get<HTTPBasicAuthConfiguration>("/nimbus/config/interfaces/http/auth/basic")
        .then(({data}) => {
            return data;
        });
};

export const sendHTTPBasicAuthConfiguration = async (configuration: HTTPBasicAuthConfiguration): Promise<void> => {
    return nimbusAPI
        .put("/nimbus/config/interfaces/http/auth/basic", configuration)
        .then(({status}) => {
            if (status !== 200) {
                throw new Error("Could not update HTTP basic auth configuration");
            }
        });
};

export const fetchNetworkAdvertisementConfiguration = async (): Promise<NetworkAdvertisementConfiguration> => {
    return nimbusAPI
        .get<NetworkAdvertisementConfiguration>("/networkadvertisement/config")
        .then(({data}) => {
            return data;
        });
};

export const sendNetworkAdvertisementConfiguration = async (configuration: NetworkAdvertisementConfiguration): Promise<void> => {
    return nimbusAPI
        .put("/networkadvertisement/config", configuration)
        .then(({status}) => {
            if (status !== 200) {
                throw new Error("Could not update NetworkAdvertisement configuration");
            }
        });
};

export const fetchNetworkAdvertisementProperties = async (): Promise<NetworkAdvertisementProperties> => {
    return nimbusAPI
        .get<NetworkAdvertisementProperties>("/networkadvertisement/properties")
        .then(({data}) => {
            return data;
        });
};

export const fetchNTPClientState = async (): Promise<NTPClientState> => {
    return nimbusAPI
        .get<NTPClientState>("/ntpclient/state")
        .then(({data}) => {
            return data;
        });
};

export const fetchNTPClientConfiguration = async (): Promise<NTPClientConfiguration> => {
    return nimbusAPI
        .get<NTPClientConfiguration>("/ntpclient/config")
        .then(({data}) => {
            return data;
        });
};

export const sendNTPClientConfiguration = async (configuration: NTPClientConfiguration): Promise<void> => {
    return nimbusAPI
        .put("/ntpclient/config", configuration)
        .then(({status}) => {
            if (status !== 200) {
                throw new Error("Could not update NTP client configuration");
            }
        });
};

export const fetchTimerInformation = async (): Promise<TimerInformation> => {
    return nimbusAPI.get<TimerInformation>("/timers").then(({ data }) => {
        return data;
    });
};

export const deleteTimer = async (id: string): Promise<void> => {
    await nimbusAPI.delete(`/timers/${id}`);
};

export const sendTimerCreation = async (timerData: Timer): Promise<void> => {
    await nimbusAPI.post("/timers", timerData).then(({ status }) => {
        if (status !== 200) {
            throw new Error("Could not create timer");
        }
    });
};

export const sendTimerUpdate = async (timerData: Timer): Promise<void> => {
    await nimbusAPI
        .put(`/timers/${timerData.id}`, timerData)
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not update timer");
            }
        });
};

export const fetchTimerProperties = async (): Promise<TimerProperties> => {
    return nimbusAPI
        .get<TimerProperties>("/timers/properties")
        .then(({ data }) => {
            return data;
        });
};

export const fetchNimbusEvents = async (): Promise<Array<NimbusEvent>> => {
    return nimbusAPI
        .get<Array<NimbusEvent>>("/events")
        .then(({ data }) => {
            return data;
        });
};

export const sendNimbusEventInteraction = async (interaction: NimbusEventInteractionContext): Promise<void> => {
    await nimbusAPI
        .put(`/events/${interaction.id}/interact`, interaction.interaction)
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not interact with event");
            }
        });
};

export const fetchPersistentDataState = async (): Promise<SimpleToggleState> => {
    return nimbusAPI
        .get<SimpleToggleState>(`/robot/capabilities/${Capability.PersistentMapControl}`)
        .then(({ data }) => {
            return data;
        });
};

const sendToggleMutation = async (capability: Capability, enable: boolean): Promise<void> => {
    await nimbusAPI
        .put(`/robot/capabilities/${capability}`, {
            action: enable ? "enable" : "disable"
        })
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error(`Could not change ${capability} state`);
            }
        });
};

export const sendPersistentDataEnable = async (enable: boolean): Promise<void> => {
    await sendToggleMutation(Capability.PersistentMapControl, enable);
};

export const sendMapReset = async (): Promise<void> => {
    await nimbusAPI
        .put(`/robot/capabilities/${Capability.MapReset}`, {
            action: "reset"
        })
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not reset the map");
            }
        });
};

export const sendStartMappingPass = async (): Promise<void> => {
    await nimbusAPI
        .put(`/robot/capabilities/${Capability.MappingPass}`, {
            action: "start_mapping"
        })
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not start the mapping pass");
            }
        });
};

export const fetchSpeakerVolumeState = async (): Promise<SpeakerVolumeState> => {
    return nimbusAPI
        .get<SpeakerVolumeState>(`/robot/capabilities/${Capability.SpeakerVolumeControl}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendSpeakerVolume = async (volume: number): Promise<void> => {
    await nimbusAPI
        .put(`/robot/capabilities/${Capability.SpeakerVolumeControl}`, {
            action: "set_volume",
            value: volume,
        })
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not change speaker volume");
            }
        });
};

export const fetchVoicePackManagementState = async (): Promise<VoicePackManagementStatus> => {
    return nimbusAPI
        .get<VoicePackManagementStatus>(`/robot/capabilities/${Capability.VoicePackManagement}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendVoicePackManagementCommand = async (command: VoicePackManagementCommand): Promise<void> => {
    return nimbusAPI
        .put(`/robot/capabilities/${Capability.VoicePackManagement}`, command)
        .then(({status}) => {
            if (status !== 200) {
                throw new Error("Could not send voice pack management command");
            }
        });
};

export const sendSpeakerTestCommand = async (): Promise<void> => {
    await nimbusAPI.put(`/robot/capabilities/${Capability.SpeakerTest}`, {
        action: "play_test_sound",
    });
};

export const fetchKeyLockState = async (): Promise<SimpleToggleState> => {
    return nimbusAPI
        .get<SimpleToggleState>(`/robot/capabilities/${Capability.KeyLock}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendKeyLockEnable = async (enable: boolean): Promise<void> => {
    await sendToggleMutation(Capability.KeyLock, enable);
};

export const fetchCarpetModeState = async (): Promise<SimpleToggleState> => {
    return nimbusAPI
        .get<SimpleToggleState>(`/robot/capabilities/${Capability.CarpetModeControl}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendCarpetModeEnable = async (enable: boolean): Promise<void> => {
    await sendToggleMutation(Capability.CarpetModeControl, enable);
};

export const fetchAutoEmptyDockAutoEmptyControlState = async (): Promise<SimpleToggleState> => {
    return nimbusAPI
        .get<SimpleToggleState>(`/robot/capabilities/${Capability.AutoEmptyDockAutoEmptyControl}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendAutoEmptyDockAutoEmptyControlEnable = async (enable: boolean): Promise<void> => {
    await sendToggleMutation(Capability.AutoEmptyDockAutoEmptyControl, enable);
};

export const fetchDoNotDisturbConfiguration = async (): Promise<DoNotDisturbConfiguration> => {
    return nimbusAPI
        .get<DoNotDisturbConfiguration>(`/robot/capabilities/${Capability.DoNotDisturb}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendDoNotDisturbConfiguration = async (configuration: DoNotDisturbConfiguration): Promise<void> => {
    await nimbusAPI
        .put(`/robot/capabilities/${Capability.DoNotDisturb}`, configuration)
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not update DND configuration");
            }
        });
};

export const fetchWifiStatus = async (): Promise<WifiStatus> => {
    return nimbusAPI
        .get<WifiStatus>(`/robot/capabilities/${Capability.WifiConfiguration}`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchWifiConfigurationProperties = async (): Promise<WifiConfigurationProperties> => {
    return nimbusAPI
        .get<WifiConfigurationProperties>(`/robot/capabilities/${Capability.WifiConfiguration}/properties`)
        .then(({ data }) => {
            return data;
        });
};

export const sendWifiConfiguration = async (configuration: WifiConfiguration): Promise<void> => {
    const encryptionKey = await fetchWifiProvisioningEncryptionKey();

    const cipher = new JSEncrypt();
    cipher.setPublicKey(encryptionKey.publicKey);

    const encryptedPayload = cipher.encrypt(JSON.stringify(configuration));

    if (!encryptedPayload) {
        throw new Error("Failed to encrypt Wi-Fi credentials");
    }

    await nimbusAPI
        .put(`/robot/capabilities/${Capability.WifiConfiguration}`, {
            encryption: "rsa",
            payload: encryptedPayload
        })
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not set Wifi configuration");
            }
        });
};

export const fetchWifiProvisioningEncryptionKey = async (): Promise<WifiProvisioningEncryptionKey> => {
    return nimbusAPI
        .get<WifiProvisioningEncryptionKey>(`/robot/capabilities/${Capability.WifiConfiguration}/getPublicKeyForProvisioning`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchWifiScan = async (): Promise<Array<NimbusWifiNetwork>> => {
    return nimbusAPI
        .get<Array<NimbusWifiNetwork>>(`/robot/capabilities/${Capability.WifiScan}`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchManualControlState = async (): Promise<SimpleToggleState> => {
    return nimbusAPI
        .get<SimpleToggleState>(`/robot/capabilities/${Capability.ManualControl}`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchManualControlProperties = async (): Promise<ManualControlProperties> => {
    return nimbusAPI
        .get<ManualControlProperties>(`/robot/capabilities/${Capability.ManualControl}/properties`)
        .then(({ data }) => {
            return data;
        });
};

export const sendManualControlInteraction = async (interaction: ManualControlInteraction): Promise<void> => {
    await nimbusAPI
        .put(`/robot/capabilities/${Capability.ManualControl}`, interaction)
        .then(({ status }) => {
            if (status !== 200) {
                throw new Error("Could not send manual control interaction");
            }
        });
};

export const fetchCombinedVirtualRestrictionsPropertiesProperties = async (): Promise<CombinedVirtualRestrictionsProperties> => {
    return nimbusAPI
        .get<CombinedVirtualRestrictionsProperties>(
            `/robot/capabilities/${Capability.CombinedVirtualRestrictions}/properties`
        )
        .then(({data}) => {
            return data;
        });
};

export const sendCombinedVirtualRestrictionsUpdate = async (
    parameters: CombinedVirtualRestrictionsUpdateRequestParameters
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.CombinedVirtualRestrictions}`,
        parameters
    );
};

export const fetchUpdaterState = async (): Promise<UpdaterState> => {
    return nimbusAPI
        .get<UpdaterState>("/updater/state")
        .then(({data}) => {
            return data;
        });
};

export const sendUpdaterCommand = async (
    command: "check" | "download" | "apply"
): Promise<void> => {
    await nimbusAPI.put(
        "/updater",
        {
            "action": command
        }
    );
};

export const fetchCurrentStatistics = async (): Promise<Array<NimbusDataPoint>> => {
    return nimbusAPI
        .get<Array<NimbusDataPoint>>(`/robot/capabilities/${Capability.CurrentStatistics}`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchCurrentStatisticsProperties = async (): Promise<StatisticsProperties> => {
    return nimbusAPI
        .get<StatisticsProperties>(`/robot/capabilities/${Capability.CurrentStatistics}/properties`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchTotalStatistics = async (): Promise<Array<NimbusDataPoint>> => {
    return nimbusAPI
        .get<Array<NimbusDataPoint>>(`/robot/capabilities/${Capability.TotalStatistics}`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchTotalStatisticsProperties = async (): Promise<StatisticsProperties> => {
    return nimbusAPI
        .get<StatisticsProperties>(`/robot/capabilities/${Capability.TotalStatistics}/properties`)
        .then(({ data }) => {
            return data;
        });
};

export const fetchQuirks = async (): Promise<Array<Quirk>> => {
    return nimbusAPI
        .get<Array<Quirk>>(`/robot/capabilities/${Capability.Quirks}`)
        .then(({ data }) => {
            return data;
        });
};

export const sendSetQuirkValueCommand = async (command: SetQuirkValueCommand): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.Quirks}`,
        {
            "id": command.id,
            "value": command.value
        }
    );
};

export const fetchRobotProperties = async (): Promise<RobotProperties> => {
    return nimbusAPI
        .get<RobotProperties>("/robot/properties")
        .then(({ data }) => {
            return data;
        });
};

export type MopDockCleanManualTriggerCommand = "start" | "stop";
export const sendMopDockCleanManualTriggerCommand = async (
    command: MopDockCleanManualTriggerCommand
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.MopDockCleanManualTrigger}`,
        {
            action: command,
        }
    );
};

export type MopDockDryManualTriggerCommand = "start" | "stop";
export const sendMopDockDryManualTriggerCommand = async (
    command: MopDockDryManualTriggerCommand
): Promise<void> => {
    await nimbusAPI.put(
        `/robot/capabilities/${Capability.MopDockDryManualTrigger}`,
        {
            action: command,
        }
    );
};
