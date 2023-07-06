const mongoose = require("mongoose");
const counterDB = require("./counter_db");

const JournalSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    title: {
        type: String,
        required: true
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'member'
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now  // 取得當下時間戳記  
    },
});

JournalSchema.pre("save", function (next) {
    const doc = this;
    counterDB.getSequenceNextValue("journal_id").
        then(counter => {
            doc.id = counter;
            console.log("journal id: ", counter);
            next();
        })
        .catch(error => next(error))
});

const Journal = mongoose.model('Journal', JournalSchema);



const insertJournal = (JournalData) => {
    let result = {};
    return new Promise((resolve, reject) => {
        new Journal(JournalData).save()
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

const listJournal = () => {
    return new Promise((resolve, reject) => {
        Journal.find({}, "-_id").populate("member", "name -_id").sort({ id: -1 })
            .then((rows) => {
                // 若寫入資料庫成功，則回傳給clinet端下：
                // result.status = "讀取成功。"
                // console.log(rows);
                // let journal_info=``;
                // rows.forEach((row)=>{
                //     journal_info+=`<h3>${row.title}</h3><p>${row.content}</p><hr />`;
                // })
                // console.log(journal_info);
                resolve(rows);
            }).catch((error) => {
                console.log(error);
                // result.status = "讀取失敗。"
                // result.err = "伺服器錯誤，請稍後在試！"
                reject("伺服器錯誤，請稍後在試！");
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
            {
                $project: {
                    "_id": 0,
                }
            },
            {
                $lookup: {
                    from: 'members',
                    localField: "member",
                    foreignField: "_id",
                    as: "member",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                name: 1
                            }
                        }
                    ]
                },
            },
            {
                $unwind: '$member'
            },
        ])
            .then(rows => {
                result.status = "讀取成功。"
                // console.log(rows);
                resolve(rows);
            })
            .catch(err => {
                console.log(err);
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
        Promise.all([Journal.findOne({ id: id }, "-_id").populate("member", "name -_id"), Journal.findOne({ 'id': { "$gt": id } }, "id -_id"), Journal.findOne({ 'id': { "$lt": id } }, "id -_id").sort({ id: -1 })])
            .then((data) => {
                // console.log(data);
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
    Journal,
    insertJournal,
    listJournal,
    searchJournal,
    readJournal,
}