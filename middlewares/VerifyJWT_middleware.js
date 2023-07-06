const config = require('../config/development_config');

const _ = require('lodash');
const jsonwebtoken = require('jsonwebtoken');

async function verifyJWT(token) {
    const time = Math.floor(Date.now() / 1000);
    return new Promise((resolve, reject) => {
        if (!token) {
            reject(new Error('No JWT'));
            return;
        }
        jsonwebtoken.verify(token, config.secret, function (err, decoded) {
            if (err) {
                reject(new Error('JWT error'));
                return;
                // token過期判斷
            } else if (decoded.exp <= time) {
                tokenResult = false;
                reject(new Error('token 過期'));
                return;
                //若正確
            } else {
                tokenResult = decoded.data;
                resolve(tokenResult);
            }
        })
    })
}


module.exports = function () {
    const  tokenPath = 'cookies.token' ; // tokenPath 是取出 token 的路徑
    return function (req, res, next) {
        const token = _.get(req, tokenPath);
        verifyJWT(token)
            .then(memberID => {
                console.log('id:' + memberID);
                next(); // next middleware
            })
            .catch(() => {
                res.redirect('/member/login');
            });
    };
}
