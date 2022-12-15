const should = require("should");

const UpdaterUtils = require("../../../../lib/updater/lib/UpdaterUtils");
const NimbusRelease = require("../../../../lib/updater/lib/update_provider/NimbusRelease");

should.config.checkProtoEql = false;

describe("UpdaterUtils", function () {

    it("Should not offer an update when up to date", function() {
        const releases = [
            new NimbusRelease({
                version: "3",
                releaseTimestamp: new Date(),
                changelog: ""
            }),
            new NimbusRelease({
                version: "2",
                releaseTimestamp: new Date(),
                changelog: ""
            }),
            new NimbusRelease({
                version: "1",
                releaseTimestamp: new Date(),
                changelog: ""
            })
        ];
        const result = UpdaterUtils.determineReleaseToDownload(
            releases,
            "3"
        );

        result.should.deepEqual({
            release: releases[0],
            updateRequired: false
        });
    });

    it("Should offer update to latest when running an unknown version", function() {
        const releases = [
            new NimbusRelease({
                version: "3",
                releaseTimestamp: new Date(),
                changelog: ""
            }),
            new NimbusRelease({
                version: "2",
                releaseTimestamp: new Date(),
                changelog: ""
            }),
            new NimbusRelease({
                version: "1",
                releaseTimestamp: new Date(),
                changelog: ""
            })
        ];
        const result = UpdaterUtils.determineReleaseToDownload(
            releases,
            "0"
        );

        result.should.deepEqual({
            release: releases[0],
            updateRequired: true
        });
    });

    it("Should offer update to next chronological release", function() {
        const releases = [
            new NimbusRelease({
                version: "3",
                releaseTimestamp: new Date(),
                changelog: ""
            }),
            new NimbusRelease({
                version: "2",
                releaseTimestamp: new Date(),
                changelog: ""
            }),
            new NimbusRelease({
                version: "1",
                releaseTimestamp: new Date(),
                changelog: ""
            })
        ];
        const result = UpdaterUtils.determineReleaseToDownload(
            releases,
            "1"
        );

        result.should.deepEqual({
            release: releases[1],
            updateRequired: true
        });
    });
});
