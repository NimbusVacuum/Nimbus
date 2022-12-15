const NimbusUpdaterError = require("../NimbusUpdaterError");
const NimbusUpdaterState = require("../../../entities/core/updater/NimbusUpdaterState");

class NimbusUpdaterStep {
    /**
     * @abstract
     * 
     * @returns {Promise<NimbusUpdaterState>}
     * @throws {NimbusUpdaterError}
     */
    async execute() {
        throw new NimbusUpdaterError(
            NimbusUpdaterError.ERROR_TYPE.UNKNOWN,
            "Empty NimbusUpdaterStep implementation"
        );
    }
}

module.exports = NimbusUpdaterStep;
