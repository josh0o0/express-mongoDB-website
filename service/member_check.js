const config = require('../config/development_config');

const jsonwebtoken = require('jsonwebtoken');

module.exports = class CheckCustomer {
    //判斷email格式
    checkEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const result = re.test(email);
        return result;
    }
    //判斷空值
    checkNull(data) {
        for (var key in data) {
            return false;
        }
        return true;
    }
    //判斷檔案大小
    checkFileSize(fileSize) {
        var maxSize = 1 * 1024 * 1024; //1MB
        if (fileSize > maxSize) {
            return true;
        }
        return false;
    }
    //判斷型態是否符合jpg, jpeg, png
    checkFileType(fileType) {
        if (fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/jpeg') {
            return true;
        }
        return false;
    }

    checkToken(token) {
        const time = Math.floor(Date.now() / 1000);
        return new Promise((resolve, reject) => {
            //判斷token是否正確
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
                    reject(new Error('token 過期'));
                    return;
                    //若正確
                } else {
                    resolve(decoded.data);
                }
            })
        });
    }
}