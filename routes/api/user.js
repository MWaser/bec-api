//'use strict';
var express = require('express');
var userRouter = express.Router();
var tedious = require('tedious');

userRouter.get('/', function (req, res, next) {
    req.sql("select * from Users FOR JSON PATH").into(res);
});

userRouter.post('/register', function (req, res, next) {
    req.sql("exec uspRegister @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .into(res);
});

userRouter.post('/delete', function (req, res, next) {
    req.sql("delete from Users WHERE EMail = @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .into(res);
});

module.exports = userRouter;

