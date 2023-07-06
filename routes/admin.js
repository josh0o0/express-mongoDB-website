const config = require('../config/development_config');
const MemberModifyMethod = require('../controllers/modify_controller');
memberModifyMethod = new MemberModifyMethod();

var express = require('express');
var router = express.Router();

// 阻擋非管理員
router.all('*', (req, res, next) => {
    console.log(res.locals.isLogin);
    if (res.locals.isLogin) {
        if (res.locals.member_info.role === 'admin')
            next();
        else {
            req.flash('warning_msg', '權限不足。');
            res.redirect('/user/home');
        }
    } else {
        req.flash('warning_msg', '尚未登入。');
        res.redirect('/member/login');
    }
});
// 管理主頁
router.get('/home', (req, res) => {
    res.render('AdminPage', { title: config.title.AdminPage });
});



// 留言板刪除訊息
router.post('/MessageSquare/delete', memberModifyMethod.deleteMessageSquare, (req, res, next) => {
    // console.log(res.locals.result.status);
    // if (res.locals.result.status === 'success')
    //   pusher.trigger("MessageSquare", "new-msg", res.locals.result.msg);
    res.json(res.locals.result);
  });

module.exports = router;
