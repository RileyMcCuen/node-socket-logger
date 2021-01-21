const ws = require('ws');

const sockets = new Map();
const socketCount = new Map();

const startMessage = 'clears';
const finishMessage = 'clearf';

const debug = 0;
const info = 1;
const warn = 2;
const error = 3;

export class SocketLogger {

    socket;
    wsAddress;
    loggerName;
    fileName;

    constructor(wsAddress, loggerName, fileName) {
        this.wsAddress = wsAddress;
        this.loggerName = loggerName;
        this.fileName = fileName;
        this.socket = sockets.get(wsAddress);
        if (this.socket === undefined) {
            const socket = new ws(wsAddress);
            sockets[wsAddress] = socket;
            socketCount[wsAddress] = 1;
            this.socket = socket;
            socket.send(startMessage);
        } else {
            socketCount[wsAddress] += 1;
        }
    }

    static Start(wsAddress, loggerName, fileName) {
        return new SocketLogger(wsAddress, loggerName, fileName);
    }

    sendMessage(level, message, lineNumber, columnNumber) {
        this.socket.send(JSON.stringify({
            time: Date.now(),
            content: message,
            logger_name: this.loggerName,
            file_name: this.fileName,
            line_num: lineNumber,
            column_num: columnNumber,
            level: level,
        }));
    }

    stop() {
        this.socket.send(finishMessage);
        const count = socketCount[this.wsAddress];
        if (count === 1) {
            sockets.delete(this.wsAddress);
            socketCount.delete(this.wsAddress);
            this.socket.close();
        }
    }

    debug(message, lineNumber, columnNumber) {
        this.sendMessage(debug, message, lineNumber, columnNumber);
    }

    info(message, lineNumber, columnNumber) {
        this.sendMessage(info, message, lineNumber, columnNumber);
    }

    warn(message, lineNumber, columnNumber) {
        this.sendMessage(warn, message, lineNumber, columnNumber);
    }

    error(message, lineNumber, columnNumber) {
        this.sendMessage(error, message, lineNumber, columnNumber);
    }

}
