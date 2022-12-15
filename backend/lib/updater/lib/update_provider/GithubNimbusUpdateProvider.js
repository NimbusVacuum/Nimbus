const NimbusRelease = require("./NimbusRelease");
const NimbusReleaseBinary = require("./NimbusReleaseBinary");
const NimbusUpdateProvider = require("./NimbusUpdateProvider");
const {get} = require("../UpdaterUtils");

class GithubNimbusUpdateProvider extends NimbusUpdateProvider {

    /**
     * @return {Promise<Array<import("./NimbusRelease")>>}
     */
    async fetchReleases() {
        const rawReleasesResponse = await get(GithubNimbusUpdateProvider.RELEASES_URL);

        if (!Array.isArray(rawReleasesResponse?.data)) {
            throw new Error("GithubNimbusUpdateProvider: Received invalid releases response");
        }

        return this.parseReleaseOverviewApiResponse(rawReleasesResponse.data);
    }

    /**
     * @param {import("./NimbusRelease")} release
     * @return {Promise<Array<import("./NimbusReleaseBinary")>>}
     */
    async fetchBinariesForRelease(release) {
        if (!release.metaData.githubReleaseUrl) {
            throw new Error("Missing Github Release URL in Release Metadata");
        }

        const rawReleaseResponse = await get(release.metaData.githubReleaseUrl);
        let releaseBinaries = [];

        // @ts-ignore
        if (!Array.isArray(rawReleaseResponse?.data?.assets)) {
            throw new Error("GithubNimbusUpdateProvider: Received invalid release response");
        }

        // @ts-ignore
        let manifestAsset = rawReleaseResponse.data.assets.find(a => {
            return a.name === GithubNimbusUpdateProvider.MANIFEST_NAME;
        });

        if (!manifestAsset) {
            throw new Error(`GithubNimbusUpdateProvider: Missing ${GithubNimbusUpdateProvider.MANIFEST_NAME}`);
        }

        const rawManifestResponse = await get(manifestAsset.browser_download_url);

        // @ts-ignore
        if (!rawManifestResponse.data || rawManifestResponse.data.version !== release.version) {
            throw new Error(`GithubNimbusUpdateProvider: Invalid ${GithubNimbusUpdateProvider.MANIFEST_NAME}`);
        }

        const manifest = rawManifestResponse.data;

        // @ts-ignore
        releaseBinaries = rawReleaseResponse.data.assets.filter(a => {
            return a.name !== GithubNimbusUpdateProvider.MANIFEST_NAME;
        }).map(a => {
            return new NimbusReleaseBinary({
                name: a.name,
                // @ts-ignore
                sha256sum: manifest.sha256sums[a.name] ?? "", //This will cause any install to fail but at least it's somewhat valid
                downloadUrl: a.browser_download_url
            });
        });

        return releaseBinaries;
    }

    /**
     * @param {object} data
     * @return {Array<import("./NimbusRelease")>}
     */
    parseReleaseOverviewApiResponse(data) {
        const releases = data.filter(rR => {
            return rR.prerelease === false && rR.draft === false;
        }).map(rR => {
            return new NimbusRelease({
                version: rR.tag_name,
                releaseTimestamp: new Date(rR.published_at),
                changelog: rR.body,
                metaData: {
                    githubReleaseUrl: rR.url
                }
            });
        });

        releases.sort((a, b) => {
            return b.releaseTimestamp.getTime() - a.releaseTimestamp.getTime();
        });

        return releases;
    }
}

GithubNimbusUpdateProvider.TYPE = "github";

GithubNimbusUpdateProvider.RELEASES_URL = "https://api.github.com/repos/NimbusVacuum/Nimbus/releases";
GithubNimbusUpdateProvider.MANIFEST_NAME = "nimbus_release_manifest.json";

module.exports = GithubNimbusUpdateProvider;
