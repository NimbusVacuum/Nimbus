const crypto = require("crypto");
const fs = require("fs");
const Logger = require("../../../Logger");
const States = require("../../../entities/core/updater");
const NimbusUpdaterError = require("../NimbusUpdaterError");
const NimbusUpdaterStep = require("./NimbusUpdaterStep");
const {get} = require("../UpdaterUtils");
const {pipeline} = require("stream/promises");

class NimbusUpdaterDownloadStep extends NimbusUpdaterStep {
    /**
     * @param {object} options
     * @param {string} options.downloadUrl
     * @param {string} options.downloadPath
     * @param {string} options.expectedHash
     * @param {string} options.version
     * @param {Date}   options.releaseTimestamp
     *
     */
    constructor(options) {
        super();

        this.downloadUrl = options.downloadUrl;
        this.downloadPath = options.downloadPath;
        this.expectedHash = options.expectedHash;
        this.version = options.version;
        this.releaseTimestamp = options.releaseTimestamp;
    }

    async execute() {
        try {
            const downloadResponse = await get(this.downloadUrl, {responseType: "stream"});
            await pipeline(
                downloadResponse.data,
                fs.createWriteStream(this.downloadPath)
            );
        } catch (e) {
            Logger.error("Error while downloading release binary", e);

            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.DOWNLOAD_FAILED,
                "Error while downloading release binary"
            );
        }

        let checksum;

        try {
            checksum = await new Promise((resolve, reject) => {
                const hash = crypto.createHash("sha256");
                const readStream = fs.createReadStream(this.downloadPath);

                readStream.on("error", err => {
                    reject(err);
                });

                readStream.on("data", data => {
                    hash.update(data);
                });

                readStream.on("end", () => {
                    resolve(hash.digest("hex"));
                });
            });
        } catch (e) {
            Logger.error("Error while calculating downloaded binary checksum", e);

            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.UNKNOWN,
                "Error while calculating downloaded binary checksum"
            );
        }

        if (checksum !== this.expectedHash) {
            throw new NimbusUpdaterError(
                NimbusUpdaterError.ERROR_TYPE.INVALID_CHECKSUM,
                `Expected Checksum: ${this.expectedHash}. Actual: ${checksum}`
            );
        } else {
            return new States.NimbusUpdaterApplyPendingState({
                version: this.version,
                releaseTimestamp: this.releaseTimestamp,
                downloadPath: this.downloadPath
            });
        }
    }
}

module.exports = NimbusUpdaterDownloadStep;
