module.exports = class mid {
    middleware1() {
        return function (req, res, next) {
            // 錯誤發生(一)
            // throw new Error('fake error by throw'); 

            // 錯誤發生(二)
            // next(new Error('fake error by next()'));
            // return;

            console.log('middleware1');
            // res.send('搶先送出回應'); // 這會引起錯誤，但不中斷： Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client 
            next(); // 引發下一個 middleware
        };
    }

    middleware2() {
        return function (req, res, next) {
            console.log('middleware2');
            next(); // 引發下一個 middleware
        }
    }
}