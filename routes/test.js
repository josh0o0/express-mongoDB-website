var express = require('express');
var router = express.Router();
let { PythonShell } = require('python-shell');
const pusher = require('../PusherAPI');
const config = require('../config/development_config');

router.get('/call/python', pythonProcess);


router.get('/pusher/trigger', (req, res, next) => {
    pusher.trigger("my-channel", "my-event", {
        message: "hello world"
    });
    res.end();
});
router.get('/pusher', (req, res, next) => {
    res.render('pusherTest', { 'title': config.title.index, description: config.description.index });
});


function pythonProcess(req, res, next) {
    let options = {
        args:
            [
                req.query.name,
                req.query.from
            ]
    }

    PythonShell.run('./python/process.py', options)
        .then((data) => {
            const parsedString = JSON.parse(data);
            console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`);
            res.json(parsedString);
        })
        .catch(err => {
            res.send(err);
        })
}

module.exports = router;