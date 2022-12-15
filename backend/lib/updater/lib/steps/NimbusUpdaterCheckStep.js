const Logger = require("../../../Logger");
const path = require("path/posix");
const stateAttrs = require("../../../entities/state/attributes");
const States = require("../../../entities/core/updater");
const Tools = require("../../../utils/Tools");
const UpdaterUtils = require("../UpdaterUtils");
const uuid = require("uuid");
const NimbusUpdaterError = require("../NimbusUpdaterError");
const NimbusUpdaterStep = require("./NimbusUpdaterStep");

class NimbusUpdaterCheckStep extends NimbusUpdaterStep {
    /**
     * @param {object} options
     * @param {boolean} options.embedded
     * @param {object} options.architectures
     * @param {number} options.spaceRequired
     * @param {import("../../../core/NimbusRobot")} options.robot
     * @param {import("../update_provider/NimbusUpdateProvider")} options.updateProvider
     */
    constructor(options) {
        super();

        this.embedded = options.embedded;
        this.architectures = options.architectures;
        this.spaceRequired = options.spaceRequired;

        this.robot = options.robot;
        this.updateProvider = options.updateProvider;
    }

    async execute() {
        const requiresLowmem = Tools.IS_LOWMEM_HOST();
        const arch = this.architectures[process.arch];
        const currentVersion = Tools.GET_NIMBUS_VERSION();

        if (this.embedded !== true) {
            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.NOT_EMBEDDED,
                "Updating is only possible in embedded mode"
            );
        }

        try {
            await this.robot.pollState();
        } catch (e) {
            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.UNKNOWN,
                "Error while polling the robots state"
            );
        }

        const statusAttribute = this.robot.state.getFirstMatchingAttributeByConstructor(
            stateAttrs.StatusStateAttribute
        );

        if (!(statusAttribute && statusAttribute.value === stateAttrs.StatusStateAttribute.VALUE.DOCKED)) {
            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.NOT_DOCKED,
                "Updating is only possible while the robot is docked"
            );
        }

        const {
            requiresUPX,
            downloadPath
        } = UpdaterUtils.storageSurvey(); //Also throws a NimbusUpdaterError

        const requiredBinary = `nimbus-${arch}${requiresLowmem ? "-lowmem" : ""}${requiresUPX ? ".upx" : ""}`;

        let releases;
        try {
            releases = await this.updateProvider.fetchReleases();
        } catch (e) {
            Logger.error("Error while fetching releases", e);

            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.DOWNLOAD_FAILED,
                "Error while fetching releases"
            );
        }

        const releaseToDownload = UpdaterUtils.determineReleaseToDownload(releases, currentVersion);
        if (releaseToDownload.updateRequired === false) {
            let changelog;

            if (releaseToDownload.release.version === currentVersion && releaseToDownload.release.changelog) {
                changelog = releaseToDownload.release.changelog;
            }

            return new States.NimbusUpdaterNoUpdateRequiredState({
                currentVersion: currentVersion,
                changelog: changelog
            });
        }

        let releaseBinaries;
        try {
            releaseBinaries = await this.updateProvider.fetchBinariesForRelease(releaseToDownload.release);
        } catch (e) {
            Logger.error(`Error while fetching release binaries for ${releaseToDownload.release.version}`, e);

            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.DOWNLOAD_FAILED,
                `Error while fetching release binaries for ${releaseToDownload.release.version}`
            );
        }

        const binaryToUse = releaseBinaries.find(b => {
            return b.name === requiredBinary;
        });

        if (!binaryToUse) {
            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.NO_MATCHING_BINARY,
                `Release ${releaseToDownload.release.version} doesn't feature a ${requiredBinary} binary.`
            );
        }

        return new States.NimbusUpdaterApprovalPendingState({
            version: releaseToDownload.release.version,
            releaseTimestamp: releaseToDownload.release.releaseTimestamp,
            changelog: releaseToDownload.release.changelog,
            downloadUrl: binaryToUse.downloadUrl,
            expectedHash: binaryToUse.sha256sum,
            downloadPath: path.join(downloadPath, uuid.v4())
        });
    }
}

module.exports = NimbusUpdaterCheckStep;
