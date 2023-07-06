const member = require('./connection_db');

module.exports = function memberLogin(memberData) {
    let result = {};
    return new Promise((resolve, reject) => {
        member.findOne(memberData)
            .then(rows => {
                // console.log(rows);
                resolve(rows);
            })
            .catch(()=>{
                result.status = "登入失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
                return;
            });
    });
};