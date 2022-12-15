const NimbusRelease = require("./NimbusRelease");
const NimbusReleaseBinary = require("./NimbusReleaseBinary");
const NimbusUpdateProvider = require("./NimbusUpdateProvider");
const {get} = require("../UpdaterUtils");

class GithubNimbusNightlyUpdateProvider extends NimbusUpdateProvider {

    /**
     * @return {Promise<Array<import("./NimbusRelease")>>}
     */
    async fetchReleases() {
        let rawBranchResponse = await get(GithubNimbusNightlyUpdateProvider.REPO_URL);

        if (
            !(
                rawBranchResponse?.data?.commit?.sha &&
                rawBranchResponse.data.commit.commit?.committer?.date &&
                rawBranchResponse.data.commit.commit.message
            )
        ) {
            throw new Error("GithubNimbusNightlyUpdateProvider: Received invalid branch response");
        }

        let changelog = rawBranchResponse.data.commit.commit.message;
        let manifest;

        try {
            manifest = await this.fetchManifest();

            if (typeof manifest?.changelog === "string") {
                changelog = manifest.changelog;
            }
        } catch (e) {
            // intentional
        }

        return [
            new NimbusRelease({
                version: rawBranchResponse.data.commit.sha,
                releaseTimestamp: new Date(rawBranchResponse.data.commit.commit.committer.date),
                changelog: changelog,
            })
        ];
    }

    /**
     * @param {import("./NimbusRelease")} release
     * @return {Promise<Array<import("./NimbusReleaseBinary")>>}
     */
    async fetchBinariesForRelease(release) {
        const manifest = await this.fetchManifest();

        // @ts-ignore
        return Object.keys(manifest.sha256sums).map(name => {
            return new NimbusReleaseBinary({
                name: name,
                // @ts-ignore
                sha256sum: manifest.sha256sums[name] ?? "", //This will cause any install to fail but at least it's somewhat valid
                downloadUrl: `${GithubNimbusNightlyUpdateProvider.ASSET_BASE_URL}${GithubNimbusNightlyUpdateProvider.BINARY_NAMES[name]}`
            });
        });
    }

    /**
     * @private
     * @return {Promise<any>}
     */
    async fetchManifest() {
        let rawManifestResponse = await get(`${GithubNimbusNightlyUpdateProvider.ASSET_BASE_URL}${GithubNimbusNightlyUpdateProvider.MANIFEST_NAME}`);

        // @ts-ignore
        if (!rawManifestResponse.data) {
            throw new Error(`GithubNimbusNightlyUpdateProvider: Invalid ${GithubNimbusNightlyUpdateProvider.MANIFEST_NAME}`);
        }

        return rawManifestResponse.data;
    }
}

GithubNimbusNightlyUpdateProvider.TYPE = "github_nightly";

GithubNimbusNightlyUpdateProvider.REPO_URL = "https://api.github.com/repos/NimbusVacuum/nimbus-nightly-builds/branches/main";
GithubNimbusNightlyUpdateProvider.ASSET_BASE_URL = "https://raw.githubusercontent.com/NimbusVacuum/nimbus-nightly-builds/main/";
GithubNimbusNightlyUpdateProvider.MANIFEST_NAME = "nimbus_release_manifest.json";

GithubNimbusNightlyUpdateProvider.BINARY_NAMES = {
    "nimbus-armv7": "armv7/nimbus",
    "nimbus-armv7-lowmem": "armv7/nimbus-lowmem",
    "nimbus-aarch64": "aarch64/nimbus",

    "nimbus-armv7.upx": "armv7/nimbus.upx",
    "nimbus-armv7-lowmem.upx": "armv7/nimbus-lowmem.upx",
    "nimbus-aarch64.upx": "aarch64/nimbus.upx",
};

module.exports = GithubNimbusNightlyUpdateProvider;
