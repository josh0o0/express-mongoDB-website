const member = require('./connection_db');

module.exports = function register(memberData) {
    return new Promise((resolve, reject) => {
        // let result = {};
        member.findOne({ email: memberData.email })
            .then((rows) => {
                console.log(rows)
                if (rows)
                    // result.status = "註冊失敗。";
                    // result.err = "這個Email已經註冊過了。";
                    reject("這個Email已經註冊過了。");
                else
                    // 將資料寫入資料庫
                    return new member(memberData).save()
            })
            .then(() => {
                // 若寫入資料庫成功，則回傳給clinet端下：
                // result.status = "註冊成功。"
                // result.registerMember = memberData;
                resolve();
            })
            .catch((error) => {
                console.log(error);
                // result.status = "註冊失敗。"
                // result.err = "伺服器錯誤，請稍後在試！"
                reject("伺服器錯誤，請稍後在試！");
            });
    });
}