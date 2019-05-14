var tedious = require('tedious');
var tediousExpress = require('../../library/express4tediousX');
var config = require('../../library/config');
var sendgrid = require('./sendgrid');

var userdb = {};                                // NOTE: Transaction-related user functions are in txdb, not userdb
var te = tediousExpress(config.apiDbConn);
var tp = tediousExpress(config.prodDbConn);

userdb.getAll = function (done) { te("select * from Users FOR JSON PATH").toObj(done); };
userdb.getProd = function (done) { tp("SELECT email, status, IIF(ISJSON(kyc) = 1, JSON_VALUE(kyc, '$.name'), '') AS name, IIF(ISJSON(kyc) = 1, JSON_VALUE(kyc, '$.country'), '') AS country, IIF(ISJSON(kyc) = 1, JSON_VALUE(kyc, '$.phoneNumber'), '') AS phoneNumber FROM users FOR JSON PATH").toObj(done); };
userdb.getOne = function (userId, done) { te('select * from Users WHERE Id = ' + userId.toString() + ' FOR JSON PATH').toObj(done); };
userdb.getTxTotals = function (done) { te("exec uspTxTotals").toObj(done); };

userdb.delete = function (email, done) {
    te("delete from Users WHERE EMail = @pEmail").param('pEmail', email, tedious.TYPES.VarChar).toObj(done);
};

userdb.chgBank = function (email, banking, done) {
    te("exec uspUserChgBank @pEmail, @pBanking")
        .param('pEmail', email, tedious.TYPES.VarChar)
        .param('pBanking', JSON.stringify(banking), tedious.TYPES.NVarChar).toObj(done);
};

userdb.chgInfo = function (email, info, envId, done) {                      // called by Docusign CreateEnv
    te("exec uspUserChgInfo @pEmail, @pInfo, @pEnvId")
        .param('pEmail', email, tedious.TYPES.VarChar)
        .param('pInfo', JSON.stringify(info), tedious.TYPES.NVarChar)
        .param('pEnvId', envId, tedious.TYPES.VarChar).toObj(done);
};

userdb.chgStatus = function (email, status, done) {
    te("exec uspUserChgStatus @pEmail, @pStatus")
        .param('pEmail', email, tedious.TYPES.VarChar)
        .param('pStatus', status, tedious.TYPES.VarChar).toObj((user) => {
            if (user[0].Status === 'signed') {
                sendgrid.sendBEC2(email, user[0]);
                te("exec uspTxs4User @pUserId").param('pUserId', user[0].Id, tedious.TYPES.Int).toObj((txs) => {
                    user[0].xactions = txs;
                    done(user);
                });
            } else done(user);
        });
};

userdb.login = function (email, kyc, done) {
    te("exec uspUserCivic @pEmail, @pKYC")
        .param('pEmail', email, tedious.TYPES.VarChar)
        .param('pKYC', JSON.stringify(kyc), tedious.TYPES.NVarChar).toObj((user) => {
            if (user[0].New === 1) sendgrid.sendBEC1(email);
            done(user[0]);
        });
};

module.exports = userdb;
