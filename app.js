const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const engine = require('ejs-locals');
const flash = require('connect-flash');
const { compileCss } = require('./compileCss');
const config = require('./config/development_config');

const indexRouter = require('./routes/index');
const memberRouter = require('./routes/member');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const testRouter = require('./routes/test');

const MemberModifyMethod = require('./controllers/modify_controller');
memberModifyMethod = new MemberModifyMethod();

const app = express();

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.npm_lifecycle_event === 'test') {
  // 执行 node test 命令的逻辑
  console.log("Running 'npm test'");
  // const sassMiddleware = require('node-sass-middleware');
  // app.use(sassMiddleware({
  //   src: path.join(__dirname, 'public'),
  //   dest: path.join(__dirname, 'public'),
  //   indentedSyntax: false, // true = .sass and false = .scss
  //   debug: true
  // }));
  // 請求CSS檔時，轉換SCSS檔
  app.use('/assets/sass', (req, res, next) => {
    const sassOptions = {
      src: path.join(__dirname, 'public/sass'),
      dest: path.join(__dirname, 'public/sass'),
      ext: '.scss'
    };
    compileCss(sassOptions);
    next();
  });
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  cookie: { maxAge: 60000 },
  secret: config.secret1,
  resave: false,
  saveUninitialized: false
}));

app.use(function (req, res, next) {
  console.log('Time: ', new Date());

  // 設定 success_msg 訊息  
  res.locals.success_msg = req.flash('success_msg');
  // 設定 warning_msg 訊息 
  res.locals.warning_msg = req.flash('warning_msg');
  res.locals.errors = [];
  next();
}, memberModifyMethod.LoginCheck, (req, res, next) => {
  if (res.locals.isLogin)
    console.log(res.locals.member_info.name);
  next();
});
app.use('/member', memberRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);
app.use('/test', testRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(res.locals.message);
  console.log(res.locals.error);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
