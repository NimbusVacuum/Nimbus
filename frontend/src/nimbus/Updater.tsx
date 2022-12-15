import {
    UpdaterState,
    useUpdaterCommandMutation,
    useUpdaterStateQuery
} from "../api";
import {
    SystemUpdateAlt as UpdaterIcon,
    Warning as ErrorIcon,
    Download as DownloadIcon,
    PendingActions as ApprovalPendingIcon,
    Info as IdleIcon,
    RestartAlt as ApplyPendingIcon,
    ExpandMore as ExpandMoreIcon,
    UpdateDisabled as UpdaterDisabledIcon,
    CheckCircle as NoUpdateRequiredIcon,
    HourglassTop as BusyIcon,
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Grid,
    Typography
} from "@mui/material";
import React from "react";
import LoadingFade from "../components/LoadingFade";
import {LoadingButton} from "@mui/lab";
import ConfirmationDialog from "../components/ConfirmationDialog";

import style from "./Updater.module.css";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import PaperContainer from "../components/PaperContainer";
import {UpdaterHelp} from "./res/UpdaterHelp";
import DetailPageHeaderRow from "../components/DetailPageHeaderRow";

const Updater = (): JSX.Element => {
    const {
        data: updaterState,
        isLoading: updaterStateLoading,
        isFetching: updaterStateFetching,
        isError: updaterStateError,
        refetch: refetchUpdaterState,
    } = useUpdaterStateQuery();

    return (
        <PaperContainer>
            <Grid container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title="Updater"
                        icon={<UpdaterIcon/>}
                        helpText={UpdaterHelp}
                        onRefreshClick={() => {
                            refetchUpdaterState().catch(() => {
                                /* intentional */
                            });
                        }}
                        isRefreshing={updaterStateFetching}
                    />

                    <UpdaterStateComponent
                        state={updaterState}
                        stateLoading={updaterStateLoading}
                        stateError={updaterStateError}
                    />
                </Box>
            </Grid>
        </PaperContainer>
    );
};

const UpdaterStateComponent : React.FunctionComponent<{ state: UpdaterState | undefined, stateLoading: boolean, stateError: boolean }> = ({
    state,
    stateLoading,
    stateError
}) => {
    if (stateLoading || !state) {
        return (
            <LoadingFade/>
        );
    }

    if (stateError) {
        return <Typography color="error">Error loading Updater state</Typography>;
    }

    const getIconForState = () : JSX.Element => {
        if (state.busy) {
            return <BusyIcon sx={{ fontSize: "3rem" }}/>;
        } else {
            switch (state.__class) {
                case "NimbusUpdaterErrorState":
                    return <ErrorIcon sx={{ fontSize: "3rem" }}/>;
                case "NimbusUpdaterDownloadingState":
                    return <DownloadIcon sx={{ fontSize: "3rem" }}/>;
                case "NimbusUpdaterApprovalPendingState":
                    return <ApprovalPendingIcon sx={{ fontSize: "3rem" }}/>;
                case "NimbusUpdaterIdleState":
                    return <IdleIcon sx={{ fontSize: "3rem" }}/>;
                case "NimbusUpdaterApplyPendingState":
                    return <ApplyPendingIcon sx={{ fontSize: "3rem" }}/>;
                case "NimbusUpdaterDisabledState":
                    return <UpdaterDisabledIcon sx={{ fontSize: "3rem" }}/>;
                case "NimbusUpdaterNoUpdateRequiredState":
                    return <NoUpdateRequiredIcon sx={{ fontSize: "3rem" }}/>;
            }
        }
    };

    const getContentForState = () : JSX.Element | undefined => {
        if (state.busy) {
            return (
                <Typography>The Updater is currently busy</Typography>
            );
        } else {
            switch (state.__class) {
                case "NimbusUpdaterErrorState":
                    return (
                        <Typography color="red"> {state.message}</Typography>
                    );
                case "NimbusUpdaterDownloadingState":
                    return (
                        <>
                            <Typography>Nimbus is currently downloading release {state.version}</Typography>
                            <br/>
                            <Typography>Please be patient...</Typography>
                        </>
                    );
                case "NimbusUpdaterApprovalPendingState":
                    return (
                        <Accordion
                            defaultExpanded={true}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography>Changelog for Nimbus {state.version}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box style={{width:"100%", paddingLeft: "1rem", paddingRight:"1rem"}}>
                                    <ReactMarkdown
                                        remarkPlugins={[gfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        className={style.reactMarkDown}
                                    >
                                        {state.changelog ? state.changelog: ""}
                                    </ReactMarkdown>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                case "NimbusUpdaterIdleState":
                    return (
                        <Typography>
                            You are currently running Nimbus {state.currentVersion}.<br/>
                            There may be newer versions of Nimbus available.
                        </Typography>
                    );
                case "NimbusUpdaterApplyPendingState":
                    return (
                        <Typography>Successfully downloaded {state.version}</Typography>
                    );
                case "NimbusUpdaterDisabledState":
                    return (
                        <Typography>The Updater was disabled in the Nimbus config.</Typography>
                    );
                case "NimbusUpdaterNoUpdateRequiredState":
                    return (
                        <>
                            <Typography
                                sx={{textAlign:"center", paddingBottom: "2rem"}}
                            >
                                You are already running the latest version of Nimbus ({state.currentVersion})
                            </Typography>
                            {
                                state.changelog &&
                                <Accordion
                                    defaultExpanded={false}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <Typography>Changelog for Nimbus {state.currentVersion}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box style={{width:"100%", paddingLeft: "1rem", paddingRight:"1rem"}}>
                                            <ReactMarkdown
                                                remarkPlugins={[gfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                className={style.reactMarkDown}
                                            >
                                                {state.changelog}
                                            </ReactMarkdown>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            }
                        </>
                    );
            }
        }
    };


    return (
        <>
            <Grid container alignItems="center" direction="column" style={{paddingBottom:"1rem"}}>
                <Grid item style={{marginTop:"1rem"}}>
                    {getIconForState()}
                </Grid>
                <Grid
                    item
                    sx={{
                        maxWidth: "100% !important", //Why, MUI? Why?
                        wordWrap: "break-word"
                    }}
                >
                    {getContentForState()}
                </Grid>
                {
                    state.__class === "NimbusUpdaterApplyPendingState" && !state.busy &&
                    <Typography color="red" style={{marginTop:"1rem", width: "80%"}}>
                        Please keep in mind that updating can be a dangerous operation.<br/>
                        Make sure that you&apos;ve thoroughly read the changelog to be aware of possible breaking changes.<br/><br/>
                        Also, during updates, you should always be prepared for some troubleshooting so please do not click apply if you currently don&apos;t have time for that.<br/><br/>
                        Also also remember that it might take a few moments until the map reappears after an update.
                    </Typography>
                }
            </Grid>
            <Divider sx={{mt: 1}}/>
            <UpdaterControls
                state={state}
            />
        </>
    );
};

const UpdaterControls : React.FunctionComponent<{ state: UpdaterState}> = ({
    state,
}) => {
    return (
        <Grid container justifyContent="flex-end" direction="row" style={{paddingTop: "1rem", paddingBottom:"1rem"}}>
            <Grid item>
                {
                    (
                        state.__class === "NimbusUpdaterIdleState" ||
                        state.__class === "NimbusUpdaterErrorState" ||
                        state.__class === "NimbusUpdaterNoUpdateRequiredState"
                    ) &&
                        <StartUpdateControls busyState={state.busy}/>
                }
                {
                    (
                        state.__class === "NimbusUpdaterApprovalPendingState"
                    ) &&
                    <DownloadUpdateControls busyState={state.busy}/>
                }
                {
                    (
                        state.__class === "NimbusUpdaterApplyPendingState"
                    ) &&
                    <ApplyUpdateControls busyState={state.busy}/>
                }
            </Grid>
        </Grid>
    );
};

const StartUpdateControls: React.FunctionComponent<{
    busyState: boolean
}> = ({
    busyState
}) => {
    const {mutate: sendCommand, isLoading: commandExecuting} = useUpdaterCommandMutation();

    return (
        <LoadingButton
            loading={commandExecuting}
            variant="outlined"
            disabled={busyState}
            onClick={() => {
                sendCommand("check");
            }}
            sx={{mt: 1, mb: 1}}
        >
            Check for Updates
        </LoadingButton>
    );
};

const DownloadUpdateControls: React.FunctionComponent<{
    busyState: boolean
}> = ({
    busyState
}) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {mutate: sendCommand, isLoading: commandExecuting} = useUpdaterCommandMutation();

    return (
        <>
            <LoadingButton
                loading={commandExecuting}
                variant="outlined"
                disabled={busyState}
                onClick={() => {
                    setDialogOpen(true);
                }}
                sx={{mt: 1, mb: 1}}
            >
                Download Update
            </LoadingButton>
            <ConfirmationDialog
                title="Download Update?"
                text={(
                    <>
                        Do you want to download the displayed Nimbus update?<br/>
                        Please make sure to fully read the provided changelog as it may contain breaking changes as well as other relevant information.
                    </>
                )}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                }}
                onAccept={() => {
                    sendCommand("download");
                }}
            />
        </>
    );
};

const ApplyUpdateControls: React.FunctionComponent<{
    busyState: boolean
}> = ({
    busyState
}) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {mutate: sendCommand, isLoading: commandExecuting} = useUpdaterCommandMutation();


    return (
        <>
            <LoadingButton
                loading={commandExecuting}
                disabled={busyState}
                variant="outlined"
                onClick={() => {
                    setDialogOpen(true);
                }}
                sx={{mt: 1, mb: 1}}
            >
                Apply Update
            </LoadingButton>
            <ConfirmationDialog
                title="Apply Update?"
                text="Do you want to apply the downloaded update? The robot will reboot during this procedure."
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                }}
                onAccept={() => {
                    sendCommand("apply");
                }}
            />
        </>
    );
};




export default Updater;
