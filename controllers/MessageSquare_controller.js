const { EventEmitter } = require("events");
const MessageSquareDB = require('../models/MessageSquare_db');

let instance;
let data = [];
let MAX = 50;

class MessageSquare extends EventEmitter {
    constructor() {
        super();
    }

    push(name, msg, callback) {
        const MsgData = {
            name: name,
            msg: msg
        }

        let result = {};
        MessageSquareDB.insertMessage(MsgData)
            .then(() => {
                result.status = 'success';
                return MessageSquareDB.getNewMessage();
            })
            .then(data => {
                result.msg = data;
            })
            .catch(() => {
                console.log(err);
                result.status = 'failed';
            })
            .finally(() => {
                callback(result);
                // this.emit("send-msg-result", result);
            })

        // data.push(msg);

        // if (data.length > MAX) {
        //     data.splice(0, 1);
        // }
    }

    get(callback) {
        let result = {};
        MessageSquareDB.listMessage()
            .then((MessageSquare_info) => {
                result.status = 'success';
                result.data = MessageSquare_info;
            })
            .catch((err) => {
                result.status = 'error';
                console.log(err);
            })
            .finally(() => {
                callback(result);
            })
    }

    setMax(max) {
        MAX = max;
    }

    getMax() {
        return MAX;
    }
}

module.exports = (function () {
    if (!instance) {
        instance = new MessageSquare();
    }

    return instance;
})();