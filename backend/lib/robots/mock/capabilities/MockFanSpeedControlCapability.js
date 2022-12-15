const entities = require("../../../entities");
const FanSpeedControlCapability = require("../../../core/capabilities/FanSpeedControlCapability");
const NimbusSelectionPreset = require("../../../entities/core/NimbusSelectionPreset");
const stateAttrs = entities.state.attributes;

/**
 * @extends FanSpeedControlCapability<import("../MockRobot")>
 */
class MockFanSpeedControlCapability extends FanSpeedControlCapability {
    /**
     * @param {object} options
     * @param {import("../MockRobot")} options.robot
     */
    constructor(options) {
        let presets = [
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.OFF, value: 0}),
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MIN, value: 1}),
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.LOW, value: 2}),
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MEDIUM, value: 3}),
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.HIGH, value: 4}),
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.TURBO, value: 5}),
            new NimbusSelectionPreset({name: entities.state.attributes.PresetSelectionStateAttribute.INTENSITY.MAX, value: 6})
        ];
        super({
            robot: options.robot,
            presets: presets
        });

        this.StateAttr = new stateAttrs.PresetSelectionStateAttribute({
            type: stateAttrs.PresetSelectionStateAttribute.TYPE.FAN_SPEED,
            value: stateAttrs.PresetSelectionStateAttribute.INTENSITY.MEDIUM
        });

        this.robot.state.upsertFirstMatchingAttribute(this.StateAttr);
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
            this.StateAttr.value = matchedPreset.name;
        } else {
            throw new Error("Invalid Preset");
        }
    }
}

module.exports = MockFanSpeedControlCapability;
