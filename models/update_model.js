const member = require('./connection_db');

module.exports = function customerEdit(_id, memberUpdateData) {
    let result = {};
    return new Promise((resolve, reject) => {
        member.findOneAndUpdate({ _id: _id }, memberUpdateData,{returnOriginal:false})
            .then((rows) => {
                // console.log(rows)
                result.status = "會員資料更新成功。";
                result.memberUpdateData = memberUpdateData;
                resolve(result);
            })
            .catch((err) => {
                console.log(err);
                result.status = "會員資料更新失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
                return;
            })
        })
}