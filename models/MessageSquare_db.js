const mongoose = require("mongoose");
const counterDB = require("./counter_db");

const MessageSquareSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member'
    },
    msg: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now  // 取得當下時間戳記  
    },
});

MessageSquareSchema.pre("save", function (next) {
    const doc = this;
    counterDB.getSequenceNextValue("MessageSquare_id").
        then(counter => {
            doc.id = counter;
            console.log("MessageSquare id: ", counter);
            next();
        })
        .catch(error => next(error))
});

const MessageSquare = mongoose.model('MessageSquare', MessageSquareSchema);


// 插入訊息
const insertMessage = (MessageSquareData) => {
    let result = {};
    return new Promise((resolve, reject) => {
        new MessageSquare(MessageSquareData).save()
            .then(() => {
                // 若寫入資料庫成功，則回傳給clinet端下：
                result.status = "寫入成功。"
                resolve(result);
            }).catch((error) => {
                console.log(error);
                result.status = "寫入失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
            });
    })
}

// 列出訊息
const listMessage = () => {
    return new Promise((resolve, reject) => {
        MessageSquare.find().populate("member","name -_id").sort({ _id: 1 })
            .then((rows) => {
                // 若寫入資料庫成功，則回傳給clinet端下：
                resolve(rows);
            }).catch((error) => {
                reject(error);
            });
    })
}

// 讀取最新訊息
const getNewMessage = () => {
    return new Promise((resolve, reject) => {
        MessageSquare.find().sort({ _id: -1 }).limit(1)
            .then((rows) => {
                // 若寫入資料庫成功，則回傳給clinet端下：
                resolve(rows);
            }).catch((error) => {
                reject(error);
            });
    })
}

// 刪除訊息
const deleteMessage = (id) => {
    return new Promise((resolve, reject) => {
        MessageSquare.deleteOne({ id: id })
            .then(() => {
                // 若寫入資料庫成功，則回傳給clinet端下：
                resolve();
            }).catch((error) => {
                reject(error);
            });
    })
}

const searchJournal = (query) => {
    let result = {};
    // const { keyword } = req.params;
    return new Promise((resolve, reject) => {
        Journal.aggregate([
            {
                $search: {
                    index: 'default',
                    text: {
                        query: `(.*)${query}(.*)`,
                        path: {
                            wildcard: '*',
                        },
                    },
                },
            },
        ])
            .then(rows => {
                result.status = "讀取成功。"
                // console.log(rows);
                resolve(rows);
            })
            .catch(err => {
                console.log(error);
                result.status = "讀取失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
            })
    })
}

const readJournal = (id) => {
    let result = {};
    // const { keyword } = req.params;
    return new Promise((resolve, reject) => {
        // 找尋
        // Journal.findOne({ _id: id })
        //     .then(rows => {
        //         // console.log(rows);
        //         result.thisJournal = rows;
        //         return Journal.findOne({ '_id' : { "$gt": id}},{_id:1})
        //     })
        //     .then(rows => {
        //         result.nextID = rows;
        //         return Journal.findOne({ '_id' : { "$lt": id}}).sort({ _id: -1 })
        //     })
        //     .then(rows => {
        //         // console.log(rows);
        //         result.previousID = rows;
        //         resolve(result);
        //     })
        //     .catch(() => {
        //         result.status = "登入失敗。"
        //         result.err = "伺服器錯誤，請稍後在試！"
        //         reject(result);
        //     });
        Promise.all([Journal.findOne({ _id: id }), Journal.findOne({ '_id': { "$gt": id } }, { _id: 1 }), Journal.findOne({ '_id': { "$lt": id } }, { _id: 1 }).sort({ _id: -1 })])
            .then((data) => {
                result.thisJournal = data[0];
                result.nextID = data[1];
                result.previousID = data[2];
                resolve(result);
            })
            .catch(() => {
                result.status = "登入失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
            });
    });
}

module.exports = {
    MessageSquare,
    insertMessage,
    listMessage,
    getNewMessage,
    deleteMessage
}