const Pusher = require("pusher");

let instance;

module.exports = (function () {
    if (!instance) {
        instance = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_APP_KEY,
            secret: process.env.PUSHER_APP_SECRET,
            cluster: process.env.PUSHER_APP_CLUSTER,
            useTLS: true
        });
    }
    return instance;
})();