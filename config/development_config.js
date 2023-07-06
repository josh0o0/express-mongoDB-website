require('dotenv').config()

module.exports = {
  mysql: {
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  },
  secret: process.env.MY_SECRET,
  secret1: process.env.MY_SECRET1,
  title: {
    index: "YuSei記事本",
    journal: "YuSei記事本 | 日誌",
    journal_watch:"${標題} - YuSei記事本",
    contact: "YuSei記事本 | 聯繫我們",
    MessageSquare:"YuSei記事本 | 留言板",
    elements: "YuSei記事本",
    generic: "YuSei記事本",

    login: "YuSei記事本|登入",
    register: "YuSei記事本|註冊",

    UserPage:"YuSei記事本|使用者",
    infoPage:"YuSei記事本|使用者資料",

    AdminPage:"YuSei記事本|管理",
    journalManage:"YuSei記事本|日誌管理",
  },
  description:{
    index:"歡迎來到YuSei，這是一個訓練用以及開發模板的網站。",
    journal: "歡迎來到YuSei日誌，這裡記錄了生活瑣事以及筆記。",
    journal_watch:"標題：${標題}||時間：${時間}||內容：${內容}",
    contact: "對於YuSei記事本有任何意見，可以在這裡填寫留言。",
    MessageSquare:"歡迎來到YuSei留言板，這是一個讓大家公開交流的場所。",
  }
}