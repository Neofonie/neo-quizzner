export default class Log {
    constructor() {
        window.consoleLog = console.log;
        console.log = this.log;
    }

    log() {
        if (!window.quizznerOptions)
            return;

        if (!window.quizznerOptions.debug)
            return;

        window.consoleLog.apply(this, arguments);
    }
}
new Log();
