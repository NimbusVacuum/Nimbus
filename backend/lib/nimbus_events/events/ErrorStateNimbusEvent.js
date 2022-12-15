const DismissibleNimbusEvent = require("./DismissibleNimbusEvent");

class ErrorStateNimbusEvent extends DismissibleNimbusEvent {
    /**
     *
     *
     * @param {object}   options
     * @param {object}  options.message
     * @class
     */
    constructor(options) {
        super({});

        this.message = options.message;
    }
}

module.exports = ErrorStateNimbusEvent;
