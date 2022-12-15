const DreameMiotHelper = require("../DreameMiotHelper");
const FanSpeedControlCapability = require("../../../core/capabilities/FanSpeedControlCapability");

/**
 * @extends FanSpeedControlCapability<import("../DreameNimbusRobot")>
 */
class DreameFanSpeedControlCapability extends FanSpeedControlCapability {

    /**
     * @param {object} options
     * @param {import("../DreameNimbusRobot")} options.robot
     * @param {Array<import("../../../entities/core/NimbusSelectionPreset")>} options.presets
     *
     * @param {number} options.siid MIOT Service ID
     * @param {number} options.piid MIOT Property ID
     */
    constructor(options) {
        super(options);

        this.siid = options.siid;
        this.piid = options.piid;

        this.helper = new DreameMiotHelper({robot: this.robot});
    }
    /**
     * @param {string} preset
     * @returns {Promise<void>}
     */
    async selectPreset(preset) {
        const matchedPreset = this.presets.find(p => {
            return p.name === preset;
        });

        if (matchedPreset) {
            await this.helper.writeProperty(this.siid, this.piid, matchedPreset.value);
        } else {
            throw new Error("Invalid Preset");
        }
    }

}

module.exports = DreameFanSpeedControlCapability;
