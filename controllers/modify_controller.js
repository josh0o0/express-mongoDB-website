const config = require('../config/development_config');

const toRegister = require('../models/register_model');
const encryption = require('../models/encryption');
const loginAction = require('../models/login_model');
const verify = require('../models/verification_model');
const updateAction = require('../models/update_model');
const infoSearch = require('../models/memberInfo_model');
const journalDB = require('../models/journal_db');
const MessageSquareDB = require('../models/MessageSquare_db');

const Check = require('../service/member_check');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const fetch = require('node-fetch-commonjs');
const { JSDOM } = require('jsdom');
// const cheerio = require('cheerio');

check = new Check();

const EXPIRES_IN = 60 * 60;   //token 持續時間(s)

module.exports = class Member {
    postRegister(req, res, next) {      //註冊驗證
        res.locals.result = {};
        const { name, email, password, confirmPassword } = req.body

        if (!name || !email || !password || !confirmPassword) {
            res.locals.errors.push({ message: '所有欄位都是必填。' })
        }
        // 不符合email格式
        else if (check.checkEmail(email) === false) {
            res.locals.errors.push({ message: '請輸入正確的Eamil格式。(如1234@email.com)' })
        }
        else if (password !== confirmPassword) {
            res.locals.errors.push({ message: '密碼與確認密碼不相符！' })
        }
        if (res.locals.errors.length) {
            res.locals.result.status = 'failed';
            next();
            return;
        }

        // 獲取client端資料
        const memberData = {
            name: name,
            email: email,
            password: encryption(req.body.password), // 進行加密
            // create_date: onTime()
        }

        toRegister(memberData)
            .then(() => {
                req.flash('success_msg', '你已經成功註冊。');
                res.locals.result.status = 'success';
            })
            .catch((err) => {
                res.locals.errors.push({ message: err })
                res.locals.result.status = 'failed';
            })
            .finally(() => {
                next();
            })
    }

    postLogin(req, res, next) {     //登入驗證
        if (!req.body.email || !req.body.password) {
            req.flash('warning_msg', '所有欄位都是必填。');
            return res.redirect('/member/login');
        }

        // 進行加密
        const password = encryption(req.body.password);

        // 獲取client端資料
        const memberData = {
            email: req.body.email,
            password: password,
        }
        loginAction(memberData).then(rows => {
            if (check.checkNull(rows) === true) {
                req.flash('warning_msg', '請輸入正確的帳號或密碼。');
                return res.redirect('/member/login');
            } else if (check.checkNull(rows) === false) {
                // 產生token
                const token = jwt.sign({
                    algorithm: 'HS256',
                    exp: Math.floor(Date.now() / 1000) + (EXPIRES_IN), // token一個小時後過期。
                    data: rows._id
                }, process.env.MY_SECRET);
                // res.setHeader('token', token)
                // 回應 client ，把 token 存在名為 token 的 cookie 並設定相關屬性
                res.cookie('token', token, { maxAge: EXPIRES_IN * 1000, httpOnly: true });
                res.redirect('/user/home');
            }
        }, (err) => {
            req.flash('warning_msg', err.err);
            return res.redirect('/member/login');
        })
    }

    LoginCheck(req, res, next) {
        const token = _.get(req, 'cookies.token');
        check.checkToken(token)
            .then((member_id) => {
                res.locals.isLogin = true;
                return infoSearch(member_id)
            })
            .then(member_info => {
                // console.log(member_info);
                res.locals.member_info = member_info;
                next();
            })
            .catch((err) => {
                // console.log(err);
                res.locals.isLogin = false;
                next();
            })
    }

    getHomePage(req, res, next) {
        infoSearch(res.locals.member_id).then(member_info => {
            console.log(member_info);
            res.locals.member_info = member_info;
            next();
        }, (err) => {
            res.redirect('/member/login');
        })
    }

    postUpdate(req, res, next) {
        let memberUpdateData = {};
        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            if (fields.name !== res.locals.member_info.name) {
                memberUpdateData.name = fields.name;
            }

            if (files.img.size) {
                // 確認檔案大小是否小於1MB
                if (check.checkFileSize(files.img.size) === true) {
                    req.flash('warning_msg', '請上傳小於1MB的圖片');
                    return res.redirect('/user/info');
                }

                // 確認檔案型態是否為png, jpg, jpeg
                if (check.checkFileType(files.img.mimetype) !== true) {
                    req.flash('warning_msg', '頭貼檔案格式錯誤');
                    return res.redirect('/user/info');
                }
                // 將圖片轉成base64編碼
                let img = await fileToBase64(files.img.filepath);
                // console.log(img);
                memberUpdateData.img = img;
            }

            // console.log(img);
            // console.log(memberUpdateData);
            updateAction(res.locals.member_info._id, memberUpdateData).then(result => {
                req.flash('success_msg', result.status);
                res.redirect('/user/info');
            }, (err) => {
                req.flash('warning_msg', err.err);
                res.redirect('/user/info');
            })
        })
    }

    putPaUpdate(req, res, next) {
        const id = tokenResult;

        // 進行加密
        const password = encryption(req.body.password);

        const memberUpdateData = {
            name: req.body.name,
            password: password,
            // update_date: onTime()
        }
        updateAction(id, memberUpdateData).then(result => {
            req.flash('success_msg', result.status);
            res.redirect('/member/login');
        }, (err) => {
            req.flash('success_msg', err.err);
            res.redirect('/member/login');
        })
    }

    putUpdateImage(req, res, next) {
        const form = new formidable.IncomingForm();

        const token = req.headers['token'];
        //確定token是否有輸入
        if (check.checkNull(token) === true) {
            res.json({
                err: "請輸入token！"
            })
        } else if (check.checkNull(token) === false) {
            verify(token).then(tokenResult => {
                if (tokenResult === false) {
                    res.json({
                        result: {
                            status: "token錯誤。",
                            err: "請重新登入。"
                        }
                    })
                } else {
                    form.parse(req, async function (err, fields, files) {
                        // 確認檔案大小是否小於1MB
                        if (check.checkFileSize(files.img.size) === true) {
                            res.json({
                                result: {
                                    status: "上傳檔案失敗。",
                                    err: "請上傳小於1MB的檔案"
                                }
                            })
                            return;
                        }

                        // 確認檔案型態是否為png, jpg, jpeg
                        if (check.checkFileType(files.img.mimetype) === true) {
                            // 將圖片轉成base64編碼
                            const image = await fileToBase64(files.img.filepath);

                            const id = tokenResult;

                            // 進行加密
                            // const password = encryption(fields.password);
                            const memberUpdateData = {
                                img: image,
                                // name: fields.name,
                                // password: password,
                                // update_date: onTime()
                            }

                            updateAction(id, memberUpdateData).then(result => {
                                res.json({
                                    result: result
                                })
                            }, (err) => {
                                res.json({
                                    result: err
                                })
                            })
                        } else {
                            res.json({
                                result: {
                                    status: "上傳檔案失敗。",
                                    err: "請選擇正確的檔案格式。如：png, jpg, jpeg等。"
                                }
                            })
                            return;
                        }
                    })
                }
            })
        }
    }

    getJournal(req, res, next) {
        let result = {};
        journalDB.listJournal()
            .then((journal_info) => {
                result.status = 'success';
                result.data = journal_info;
                res.json(result);
                // res.json({ journal: journal_info });
                // let journal_html = '';
                // let count = 0;
                // journal_info.forEach(element => {
                //     if (count === 0) {
                //         journal_html += '<div class="row">';
                //         count = 0;
                //     }

                //     const $ = cheerio.load(element.content);  // 載入 HTML 文檔
                //     // 獲取所有段落元素的文本
                //     element.content = $.text();
                //     journal_html += `
                //                         <section class="col col-vertical log-item" data-time="${new Date(element.timestamp).toLocaleString()}">
                //                             <a href="/journal?id=${element._id}"><h2>${element.title}</h2></a>
                //                             <p class="date">${new Date(element.timestamp).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</p>
                //                             <p class="content">${element.content}</p>
                //                         </section>
                //                     `;
                //     if (count++ >= 2) {
                //         journal_html += `</div>`;
                //         count = 0;
                //     }
                // });
                // if (journal_html.lastIndexOf(`</div>`))
                //     journal_html += `</div>`;
                // res.locals.journal_html = journal_html;
                // next();
            })
            .catch((err) => {
                result.status = 'failed';
                result.err = err;
                // console.log(err);
                res.json(result);
            })
    }

    postJournal(req, res, next) {
        const { title, content } = req.body

        if (!title || !content) {
            req.flash('warning_msg', '所有欄位都是必填。');
            return res.redirect('/admin/journal');
        }

        const contentDiv = "<div id='contentDiv'>" + content + "</div>";
        const document = new JSDOM(contentDiv).window.document;

        const Tags = document.querySelectorAll('a,form');
        Tags.forEach(Tag => {
            if (Tag.tagName.toLowerCase() === 'form') {
                Tag.parentElement.removeChild(Tag);
                return;
            }
            while (Tag.firstChild) {
                Tag.parentNode.insertBefore(Tag.firstChild, Tag);
            }
            Tag.parentNode.removeChild(Tag);
        });
        // console.log(document.querySelector('#contentDiv').outerHTML);

        const journalData = {
            title: title,
            member: res.locals.member_info._id,
            content: document.querySelector('#contentDiv').outerHTML,
        }
        journalDB.insertJournal(journalData)
            .then(() => {
                // res.locals.journal = journal;
                req.flash('success_msg', '成功發布。');
            })
            .catch((err) => {
                console.log(err);
                req.flash('warning_msg', err.err);
            })
            .finally(()=>{
                next();
            })
    }

    searchJournal(req, res, next) {
        const query = req.query.query;
        journalDB.searchJournal(query)
            .then((journal_info) => {
                // res.locals.journal = journal_info;
                res.json(
                    {
                        journal: journal_info
                    }
                )
            })
            .catch((err) => {
                console.log(err);
                res.json(
                    {
                        journal: 'error'
                    }
                )
            })
    }

    readJournal(req, res, next) {
        const id = req.params.journal_id;
        journalDB.readJournal(id)
            .then((journal_info) => {
                res.locals.journal = journal_info;
                // console.log(res.locals.journal)
                next();
            })
            .catch((err) => {
                console.log(err);
                res.locals.journal = err;
                next();
            })
    }

    postContact(req, res, next) {
        const { name, message } = req.body

        if (!name || !message) {
            res.locals.errors.push({ message: '所有欄位都是必填。' })
        }
        if (res.locals.errors.length) {
            return res.render('contact', {
                title: config.title.contact,
            })
        }

        // 獲取client端資料
        const contactData = {
            time: new Date().toLocaleString(),
            name: name,
            message: message
        }

        fetch(process.env.GoogleAppScript_URI,
            {
                method: "POST",
                // headers: {
                //     "Content-Type": "text/plain; charset=utf-8",
                //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.58'
                // },
                body: JSON.stringify(contactData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                req.flash('success_msg', '發送訊息成功!!!');
                res.redirect('/contact');
            })
            .catch(() => {
                req.flash('warning_msg', '發送訊息失敗!!!');
                res.redirect('/contact');
            });
    }

    postMessageSquare(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            const { msg } = fields;
            console.log(msg);

            if (!msg) {
                res.locals.errors.push({ message: '所有欄位都是必填。' })
            }
            if (res.locals.errors.length) {
                res.locals.result.status = '留言為空';
                next();
                return
            }

            const MsgData = new MessageSquareDB.MessageSquare({
                member: res.locals.member_info._id,
                msg
            });

            let result = {};
            MsgData.save()
                .then((data) => {
                    result.status = 'success';
                    const { id, msg, timestamp } = data;
                    result.msg = {
                        id,
                        msg,
                        timestamp,
                        name: res.locals.member_info.name
                    }
                })
                .catch((err) => {
                    console.log(err);
                    result.status = 'failed';
                })
                .finally(() => {
                    res.locals.result = result;
                    next();
                })
        })
    }

    deleteMessageSquare(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            const { id } = fields;
            console.log("刪除:" + id);

            if (!id) {
                res.locals.errors.push({ message: '所有欄位都是必填。' })
            }
            if (res.locals.errors.length) {
                res.locals.result.status = '留言為空';
                next();
                return
            }

            let result = {};
            MessageSquareDB.deleteMessage(id)
                .then(() => {
                    result.status = 'success';
                })
                .catch((err) => {
                    console.log(err);
                    result.status = 'failed';
                })
                .finally(() => {
                    res.locals.result = result;
                    next();
                })
        })
    }

    getMessageSquareData(req, res, next) {
        let result = {};
        MessageSquareDB.listMessage()
            .then((MessageSquare_info) => {
                result.status = 'success';
                result.data = MessageSquare_info;
                res.json(result);
            })
            .catch((err) => {
                result.status = 'error';
                console.log(err);
                res.json(result);
            });
    }
}

//取得現在時間，並將格式轉成YYYY-MM-DD HH:MM:SS
const onTime = () => {
    const date = new Date();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const hh = date.getHours();
    const mi = date.getMinutes();
    const ss = date.getSeconds();

    return [date.getFullYear(), "-" +
        (mm > 9 ? '' : '0') + mm, "-" +
        (dd > 9 ? '' : '0') + dd, " " +
        (hh > 9 ? '' : '0') + hh, ":" +
        (mi > 9 ? '' : '0') + mi, ":" +
        (ss > 9 ? '' : '0') + ss
    ].join('');
}

// 將圖片轉成Base64
const fileToBase64 = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'base64', function (err, data) {
            resolve(data);
        })
    })
}

// const stringToHTML = function (str) {
//     var parser = new DOMParser();
//     var doc = parser.parseFromString(str, 'text/html');
//     return doc.body;
// }