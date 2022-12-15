const fs = require("fs");
const GithubNimbusNightlyUpdateProvider = require("./lib/update_provider/GithubNimbusNightlyUpdateProvider");
const GithubNimbusUpdateProvider = require("./lib/update_provider/GithubNimbusUpdateProvider");
const Logger = require("../Logger");
const States = require("../entities/core/updater");
const Steps = require("./lib/steps");
const Tools = require("../utils/Tools");

class Updater {
    /**
     * @param {object} options
     * @param {import("../Configuration")} options.config
     * @param {import("../core/NimbusRobot")} options.robot
     */
    constructor(options) {
        this.config = options.config;
        this.robot = options.robot;

        this.updaterConfig = this.config.get("updater");

        /** @type {import("../entities/core/updater/NimbusUpdaterState")} */
        this.state = undefined;
        /** @type {import("./lib/update_provider/NimbusUpdateProvider")} */
        this.updateProvider = undefined;

        if (this.updaterConfig.enabled === true) {
            this.state = new States.NimbusUpdaterIdleState({
                currentVersion: Tools.GET_NIMBUS_VERSION()
            });
        } else {
            this.state = new States.NimbusUpdaterDisabledState({});
        }

        switch (this.updaterConfig.updateProvider.type) {
            case GithubNimbusUpdateProvider.TYPE:
                this.updateProvider = new GithubNimbusUpdateProvider();
                break;
            case GithubNimbusNightlyUpdateProvider.TYPE:
                this.updateProvider = new GithubNimbusNightlyUpdateProvider();
                break;
            default:
                throw new Error(`Invalid UpdateProvider ${this.updaterConfig.updateProvider.type}`);
        }
    }

    /**
     * As everything regarding networking might take a long time, we just accept this request
     * and then asynchronously process it.
     * Updates are reported via the updaters state
     *
     * @return {void}
     */
    triggerCheck() {
        if (
            !(
                this.state instanceof States.NimbusUpdaterIdleState ||
                this.state instanceof States.NimbusUpdaterErrorState ||
                this.state instanceof States.NimbusUpdaterNoUpdateRequiredState
            )
        ) {
            throw new Error("Updates can only be started when the updaters state is idle or error");
        }

        this.state.busy = true;

        const step = new Steps.NimbusUpdaterCheckStep({
            embedded: this.config.get("embedded"),
            architectures: Updater.ARCHITECTURES,
            spaceRequired: Updater.SPACE_REQUIREMENTS,
            robot: this.robot,
            updateProvider: this.updateProvider
        });

        step.execute().then((state) => {
            this.state = state;
        }).catch(err => {
            this.state = new States.NimbusUpdaterErrorState({
                type: err.type,
                message: err.message
            });
        });
    }

    /**
     * @return {void}
     */
    triggerDownload() {
        if (!(this.state instanceof States.NimbusUpdaterApprovalPendingState)) {
            throw new Error("Downloads can only be started when there's pending approval");
        }
        const downloadPath = this.state.downloadPath;
        this.state.busy = true;

        const step = new Steps.NimbusUpdaterDownloadStep({
            downloadUrl: this.state.downloadUrl,
            downloadPath: this.state.downloadPath,
            expectedHash: this.state.expectedHash,
            version: this.state.version,
            releaseTimestamp: this.state.releaseTimestamp
        });

        this.state = new States.NimbusUpdaterDownloadingState({
            downloadUrl: this.state.downloadUrl,
            downloadPath: this.state.downloadPath,
            expectedHash: this.state.expectedHash,
            version: this.state.version,
            releaseTimestamp: this.state.releaseTimestamp
        });
        this.state.busy = true;

        step.execute().then((state) => {
            this.state = state;

            setTimeout(() => {
                Logger.warn("Updater: User confirmation timeout.");
                fs.unlinkSync(downloadPath);

                this.state = new States.NimbusUpdaterIdleState({
                    currentVersion: Tools.GET_NIMBUS_VERSION()
                });
            }, 10 * 60 * 1000); // 10 minutes
        }).catch(err => {
            this.state = new States.NimbusUpdaterErrorState({
                type: err.type,
                message: err.message
            });
        });
    }

    /**
     * @return {void}
     */
    triggerApply() {
        if (!(this.state instanceof States.NimbusUpdaterApplyPendingState)) {
            throw new Error("Can only apply if there's finalization pending");
        }

        this.state.busy = true;

        const step = new Steps.NimbusUpdaterApplyStep({
            downloadPath: this.state.downloadPath
        });

        step.execute().catch(err => { //no .then() required as the system will reboot
            this.state = new States.NimbusUpdaterErrorState({
                type: err.type,
                message: err.message
            });
        });
    }
}

Updater.SPACE_REQUIREMENTS = 40 * 1024 * 1024;
Updater.ARCHITECTURES = {
    "arm": "armv7",
    "arm64": "aarch64"
};

module.exports = Updater;
