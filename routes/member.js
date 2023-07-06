const flash = require('connect-flash')
var express = require('express');
var router = express.Router();

const config = require('../config/development_config');
const MemberModifyMethod = require('../controllers/modify_controller');
memberModifyMethod = new MemberModifyMethod();

router.all('*', (req, res, next) => {
  if (res.locals.isLogin)
    res.redirect('/user/home');
  else
    next();
});
// 路由 : 登入頁面 GET
router.get('/login', (req, res) => {
  res.render('login', {
    title: config.title.login,
    email: ''
  });
})
// 路由 : 註冊頁面 GET
router.get('/register', (req, res) => {
  res.render('register', {
    title: config.title.register,
    name: '',
    email: '',
  });
})
// 註冊新會員
router.post('/register', memberModifyMethod.postRegister, (req, res) => {
  if (res.locals.result.status === 'success')
    return res.redirect('/member/login');
  else
    return res.render('register', {
      title: config.title.register,
      name: req.body.name,
      email: req.body.email,
    });
});
// 會員登入
router.post('/login', memberModifyMethod.postLogin);


module.exports = router;