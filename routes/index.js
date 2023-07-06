var express = require('express');
var router = express.Router();

const config = require('../config/development_config');
const MemberModifyMethod = require('../controllers/modify_controller');
memberModifyMethod = new MemberModifyMethod();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('index', { 'title': config.title.index, description: config.description.index });
});

router.get('/journal',
  function (req, res, next) {
    res.render('journal', {
      'title': config.title.journal,
      description: config.description.journal
    });
  });
router.get('/journals/:journal_id',
  function (req, res, next) {
    memberModifyMethod.readJournal(req, res, next);
  },
  function (req, res, next) {
    res.render('journal-watch', {
      title: config.title.journal_watch.replace('${標題}', res.locals.journal.thisJournal.title),
      description: config.description.journal_watch.replace('${標題}', res.locals.journal.thisJournal.title).replace('${時間}', res.locals.journal.thisJournal.timestamp).replace('${內容}', res.locals.journal.thisJournal.content)
    });
  });
router.get('/getJournal', memberModifyMethod.getJournal);
router.get('/searchJournal', memberModifyMethod.searchJournal);

router.get('/contact', function (req, res, next) {
  res.render('contact', { 'title': config.title.contact, description: config.description.contact });
});
router.post('/contact', memberModifyMethod.postContact);

router.get('/MessageSquare/data', memberModifyMethod.getMessageSquareData);
router.get('/MessageSquare', (req, res, next) => {
  res.render('MessageSquare', { 'title': config.title.MessageSquare, description: config.description.MessageSquare });
});

router.get('/elements', function (req, res, next) {
  res.render('elements', { 'title': config.title.elements, });
});

router.get('/generic', function (req, res, next) {
  res.render('generic', { 'title': config.title.generic, });
});

// /* 未定義網址 */
// router.get('*', function (req, res, next) {
//   res.redirect('/');
// });


module.exports = router;
