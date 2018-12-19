//'use strict';
var express = require('express');
var userRouter = express.Router();
var tedious = require('tedious');

userRouter.get('/', function (req, res, next) {
    req.sql("select * from Users FOR JSON PATH")
        .toStr(function (str) { res.send(str); });
});

userRouter.post('/register', function (req, res, next) {
    req.sql("exec uspUserRegister @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .toStr(function (str) { res.send(str); });
});

userRouter.post('/chgpwd', function (req, res, next) {
    req.sql("exec uspUserChgPwd @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .param('pPassword', req.body.email, tedious.TYPES.VarChar)
        .param('pSession', req.body.email, tedious.TYPES.VarChar)
        .toStr(function (str) { res.send(str); });
});

userRouter.post('/login', function (req, res, next) {
    req.sql("exec uspUserLogin @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .param('pPassword', req.body.email, tedious.TYPES.VarChar)
        .toStr(function (str) { res.send(str); });
});

userRouter.post('/logout', function (req, res, next) {
    req.sql("exec uspUserLogout @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .param('pSession', req.body.email, tedious.TYPES.VarChar)
        .toStr(function (str) { res.send(str); });
});

userRouter.post('/delete', function (req, res, next) {
    req.sql("delete from Users WHERE EMail = @pEmail")
        .param('pEmail', req.body.email, tedious.TYPES.VarChar)
        .toStr(function (str) { res.send(str); });
});

module.exports = userRouter;

