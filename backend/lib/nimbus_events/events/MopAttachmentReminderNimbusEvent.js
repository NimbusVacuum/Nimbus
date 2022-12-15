const DismissibleNimbusEvent = require("./DismissibleNimbusEvent");

class MopAttachmentReminderNimbusEvent extends DismissibleNimbusEvent {
    /**
     *
     * @param {object}   options
     * @param {object}  [options.metaData]
     * @class
     */
    constructor(options) {
        super(Object.assign({}, options, {id: "mop_attachment_reminder"}));
    }
}

module.exports = MopAttachmentReminderNimbusEvent;
