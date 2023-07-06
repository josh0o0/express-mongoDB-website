const _ = require('lodash');

const LoginCheck = (req, res, next) => {
    const token = _.get(req, 'cookies.token');
    check.checkToken(token).then((member_id) => {
        res.locals.isLogin = true;
        infoSearch(member_id).then(member_info => {
            // console.log(member_info);
            res.locals.member_info = member_info;
            next();
        }, (err) => {
            console.log(err);
            res.locals.isLogin = false;
            next()
        })
    }).catch((err) => {
        console.log(err);
        res.locals.isLogin = false;
        next();
    })
}