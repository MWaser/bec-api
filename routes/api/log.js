'use strict';
const app = require('express');
const logRouter = app.Router();

const tedious = require('tedious');
const tediousExpress = require('../../library/express4tediousX');
const config = require('../../library/config');
const te = tediousExpress(config.apiDbConn);

const logAdd = function (vars, done) {
    var obj;
    try {
        te("exec uspLogAdd @pApp, @pSeverity, @pMessage")
            .param('pApp', vars.app, tedious.TYPES.VarChar)
            .param('pSeverity', vars.severity, tedious.TYPES.Int)
            .param('pMessage', vars.message, tedious.TYPES.VarChar).toObj(done);
    } catch (e) {
        console.log("error");
        console.log(e);
    }
    console.log("DONE");
};

logRouter.post('/add', function (req, res, next) { logAdd(req.body, (obj) => { res.send(JSON.stringify(obj)); }); });

module.exports = logRouter;

