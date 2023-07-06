const config = require('../config/development_config');
const pusher = require('../PusherAPI');
const MemberModifyMethod = require('../controllers/modify_controller');
memberModifyMethod = new MemberModifyMethod();

var express = require('express');
var router = express.Router();

// 阻擋非會員
router.all('*', (req, res, next) => {
  console.log(res.locals.isLogin);
  if (res.locals.isLogin)
    next();
  else {
    req.flash('warning_msg', '尚未登入。');
    res.redirect('/member/login');
  }
});
// 會員主頁
router.get('/home', (req, res) => {
  res.render('UserPage', { title: config.title.UserPage });
});

// 會員資料
router.get('/info', (req, res) => {
  res.render('infoPage', { title: config.title.infoPage });
});

// 更新會員資料
router.post('/update', memberModifyMethod.postUpdate);
// 更新會員資料（檔案上傳示範，可直接取代/member的PUT method）
router.post('/updateimage', memberModifyMethod.putUpdateImage);

// 日誌管理
router.get('/journalManage', (req, res) => {
  res.render('journalManage', { title: config.title.journalManage });
});
// 日誌發布
router.post('/journal', memberModifyMethod.postJournal,(req, res)=>{
  return res.redirect('/user/journalManage');
});

// 留言板發送訊息
router.post('/MessageSquare', memberModifyMethod.postMessageSquare, (req, res, next) => {
  // console.log(res.locals.result.status);
  if (res.locals.result.status === 'success')
    pusher.trigger("MessageSquare", "new-msg", res.locals.result.msg);
  res.json(res.locals.result);
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success_msg', '你已經成功登出。');
  res.redirect('/member/login');
})


module.exports = router;
