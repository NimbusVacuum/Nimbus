const NimbusVoicePackOperationStatus = require("../../../entities/core/NimbusVoicePackOperationStatus");
const VoicePackManagementCapability = require("../../../core/capabilities/VoicePackManagementCapability");

/**
 * @extends VoicePackManagementCapability<import("../MockRobot")>
 */
class MockVoicePackManagementCapability extends VoicePackManagementCapability {
    /**
     * @param {object} options
     * @param {import("../MockRobot")} options.robot
     */
    constructor(options) {
        super(options);

        this.current_language = "EN";
        this.status = NimbusVoicePackOperationStatus.TYPE.IDLE;
        this.progress = undefined;
    }

    async getCurrentVoiceLanguage() {
        return this.current_language;
    }

    async downloadVoicePack(options) {
        this.status = NimbusVoicePackOperationStatus.TYPE.DOWNLOADING;
        this.progress = 0;

        // Simulate download
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.progress += 20;
            }, i * 1000);
        }

        setTimeout(() => {
            this.status = NimbusVoicePackOperationStatus.TYPE.INSTALLING;
            this.progress = 0;
        }, 6000);

        // Simulate installing
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.progress += 20;
            }, 7000 + i * 1000);
        }

        setTimeout(() => {
            this.status = NimbusVoicePackOperationStatus.TYPE.IDLE;
            this.current_language = options.language;
        }, 13000);
    }

    async getVoicePackOperationStatus() {
        let statusOptions = {
            type: this.status,
            progress: this.progress,
        };

        return new NimbusVoicePackOperationStatus(statusOptions);
    }
}

module.exports = MockVoicePackManagementCapability;
