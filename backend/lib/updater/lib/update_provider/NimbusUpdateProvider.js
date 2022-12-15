const NotImplementedError = require("../../../core/NotImplementedError");

class NimbusUpdateProvider {
    constructor() {
        //intentional
    }

    /**
     * @abstract
     * @return {Promise<Array<import("./NimbusRelease")>>} These have to be sorted by release date. Element 0 should be the most recent one
     */
    async fetchReleases() {
        throw new NotImplementedError();
    }

    /**
     * @abstract
     * @param {import("./NimbusRelease")} release
     * @return {Promise<Array<import("./NimbusReleaseBinary")>>}
     */
    async fetchBinariesForRelease(release) {
        throw new NotImplementedError();
    }
}

module.exports = NimbusUpdateProvider;
