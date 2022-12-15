import {HashRouter, Redirect, Route, Switch} from "react-router-dom";
import Div100vh from "react-div-100vh";
import HomePage from "./HomePage";
import SettingsRouter from "./settings";
import {PaletteMode, styled} from "@mui/material";
import RobotRouter from "./robot";
import NimbusAppBar from "./components/NimbusAppBar";
import React from "react";
import NimbusRouter from "./nimbus";

const Root = styled(Div100vh)({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
});

const Content = styled("main")({
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    overflow: "auto",
});

const AppRouter: React.FunctionComponent<{ paletteMode: PaletteMode, setPaletteMode: (newMode: PaletteMode) => void }> = ({
    paletteMode,
    setPaletteMode
}): JSX.Element => {
    return (
        <HashRouter>
            <Root>
                <Content>
                    <NimbusAppBar paletteMode={paletteMode} setPaletteMode={setPaletteMode}/>
                    <Switch>
                        <Route exact path="/">
                            <HomePage/>
                        </Route>
                        <Route path="/robot">
                            <RobotRouter/>
                        </Route>
                        <Route path="/settings">
                            <SettingsRouter/>
                        </Route>
                        <Route path="/nimbus">
                            <NimbusRouter/>
                        </Route>
                        <Route path="*">
                            <Redirect to="/"/>
                        </Route>
                    </Switch>
                </Content>
            </Root>
        </HashRouter>
    );
};

export default AppRouter;
