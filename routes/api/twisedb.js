const tedious = require('tedious');
const tediousExpress = require('../../library/express4tediousX');
const config = require('../../library/config');
const axios = require('axios');
axios.defaults.headers.common['Authorization'] = `Bearer ${config.twiseApi.key}`;

const twisedb = {};
const te = tediousExpress(config.apiDbConn);
const twGet = (url) => axios({ baseURL: config.twiseApi.baseURL, method: 'Get', url: url });
const twPost = (url, data) => axios({ baseURL: config.twiseApi.baseURL, method: 'Post', url: url, data: data });

twisedb.createSS = function (currency, done) {
    te("exec uspUserBankChk @pCurrency").param('pCurrency', currency, tedious.TYPES.Char).toObj(done);
};

twisedb.txs2Recv = function (done) { te("exec uspTxs2Recv").toObj(done); };
twisedb.bcCount = function (done) { te("SELECT UPPER(JSON_VALUE(Banking, '$.currency')) AS Currency, COUNT(1) AS [Count] FROM Users WHERE BankStatus = 'exported' GROUP BY JSON_VALUE(Banking, '$.currency') FOR JSON PATH").toObj(done); };
twisedb.bcs2Link = function (done) { te("exec uspBCs2Link").toObj(done); };

twisedb.txTwLink = function (admin, txId, twId, done) {
    te("exec uspTxTwLink @pAdmin, @pTxId, @pTwId")
        .param('pAdmin', admin, tedious.TYPES.VarChar)
        .param('pTxId', txId, tedious.TYPES.Int)
        .param('pTwId', twId, tedious.TYPES.Int).toObj(done);
};

twisedb.bcTwLink = function (admin, bcId, twId, done) {
    te("exec uspBCTwLink @pAdmin, @pBCId, @pTwId")
        .param('pAdmin', admin, tedious.TYPES.VarChar)
        .param('pBCId', bcId, tedious.TYPES.Int)
        .param('pTwId', twId, tedious.TYPES.Int).toObj(done);
};

twisedb.twxactionAdd = function (xaction, done) {
    te("exec uspTWxAdd @pXaction").param('pXaction', xaction, tedious.TYPES.VarChar).toObj(done);
};

twisedb.bcCheck = function (done) { te("SELECT JSON_VALUE(Banking, '$.currency') AS Currency, COUNT(1) AS [Count] FROM Users WHERE BankStatus = 'exported' GROUP BY JSON_VALUE(Banking, '$.currency') FOR JSON PATH").toObj(done); };

twisedb.loadFrmTW = function (start, end, done) {
    start = start + 'T00:00:00.000Z';
    console.log(start);
    end = end + 'T00:00:00.000Z';
    console.log(end);
    let profile, account, xactions;
    twGet('/profiles').then((response) => {
        profile = response.data.find(d => d.type === 'business');
        return twGet(`/borderless-accounts?profileId=${profile.id}`);
    }).then((response) => {
        account = response.data[0];
        console.log(account);
        let total = 0;
        account.balances.forEach((balance) => {
            total += 1;
            console.log(`/borderless-accounts/${account.id}/statement.json?currency=${balance.currency}&intervalStart=${start}&intervalEnd=${end}`);
            twGet(`/borderless-accounts/${account.id}/statement.json?currency=${balance.currency}&intervalStart=${start}&intervalEnd=${end}`)
                .then((response) => {
                    console.log(`CURRENCY = ${balance.amount.value} ${balance.currency} -----------------------------------------------`);
                    xactions = response.data;
                    xactions.transactions.forEach((xaction) => {
                        total += 1;
                        console.log(xaction.referenceNumber);
                        twisedb.twxactionAdd(JSON.stringify(xaction), (result) => {
                            console.log(total);
                            if (--total === 0) done();
                        });
                    });
                    if (--total === 0) done();
                });
        });
    }).catch((error) => {
        console.log("ERROR: " + error);
        done();
    });
};

module.exports = twisedb;

