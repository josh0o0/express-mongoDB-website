// DataBase
const mongoose = require('mongoose');
const counterDB = require("./counter_db");

const schema = mongoose.Schema;
const MemberSchema = new schema({
  id: {
    type: Number,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  img: {
    type: Buffer,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now  // 取得當下時間戳記  
  },
});

MemberSchema.pre("save", function (next) {
  const doc = this;
  counterDB.getSequenceNextValue("member_id").
    then(counter => {
      doc.id = counter;
      console.log("regist id: ", counter);
      next();
    })
    .catch(error => next(error))
});


module.exports = mongoose.model('member', MemberSchema);