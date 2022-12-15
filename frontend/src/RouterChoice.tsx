import React from "react";
import {PaletteMode} from "@mui/material";
import {Capability, useNimbusInformationQuery, useWifiStatusQuery} from "./api";
import {useCapabilitiesSupported} from "./CapabilitiesProvider";
import AppRouter from "./AppRouter";
import ProvisioningPage from "./ProvisioningPage";
import NimbusSplash from "./components/NimbusSplash";

//This is either just an artifact of how React works or I'm doing something wrong
const RouterChoiceStageTwo: React.FunctionComponent<{
    paletteMode: PaletteMode,
    setPaletteMode: (newMode: PaletteMode) => void,
    setBypassProvisioning: (bypassProvisioning: boolean) => void
}> = ({
    paletteMode,
    setPaletteMode,
    setBypassProvisioning
}): JSX.Element => {
    const {
        data: wifiConfiguration,
        isLoading: wifiConfigurationLoading,
    } = useWifiStatusQuery();

    if (wifiConfigurationLoading) {
        return <NimbusSplash/>;
    }

    if (wifiConfiguration) {
        if (wifiConfiguration.state === "not_connected") {
            return <ProvisioningPage/>;
        } else if (wifiConfiguration.state === "connected") {
            //This skips rendering any of this next time the wifiConfiguration is refreshed
            setBypassProvisioning(true);
        }
    }

    return (
        <AppRouter paletteMode={paletteMode} setPaletteMode={setPaletteMode}/>
    );
};

const RouterChoice: React.FunctionComponent<{
    paletteMode: PaletteMode,
    setPaletteMode: (newMode: PaletteMode) => void
}> = ({
    paletteMode,
    setPaletteMode
}): JSX.Element => {
    const [bypassProvisioning, setBypassProvisioning] = React.useState(false);
    const [wifiConfigSupported] = useCapabilitiesSupported(Capability.WifiConfiguration);
    const {
        data: nimbusInformation,
        isLoading: nimbusInformationLoading
    } = useNimbusInformationQuery();

    if (!bypassProvisioning && wifiConfigSupported) {
        if (nimbusInformationLoading) {
            return <NimbusSplash/>;
        }

        if (nimbusInformation && nimbusInformation.embedded) {
            return <RouterChoiceStageTwo paletteMode={paletteMode} setPaletteMode={setPaletteMode} setBypassProvisioning={setBypassProvisioning}/>;
        }
    }

    return (
        <AppRouter paletteMode={paletteMode} setPaletteMode={setPaletteMode}/>
    );
};

export default RouterChoice;
