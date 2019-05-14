'use strict';
const adminRouter = require('express').Router();
const fastcsv = require('fast-csv');
const fs = require('fs');

var twisedb = require('./twisedb');

adminRouter.get('/txs2recv', function (req, res) { twisedb.txs2Recv((obj) => { res.send(JSON.stringify(obj)); }); });
adminRouter.get('/bcCount', function (req, res) { twisedb.bcCount((obj) => { res.send(JSON.stringify(obj)); }); });
adminRouter.get('/bcs2link', function (req, res) { twisedb.bcs2Link((obj) => { res.send(JSON.stringify(obj)); }); });

adminRouter.get('/bankchk/:currency', function (req, res) {
    twisedb.createSS(req.params.currency, (recs) => {
        if (recs.length === 0) { console.log("No records"); res.send("No records"); done(); return; }
        const fname = req.params.currency + ".csv";
        const ws = fs.createWriteStream("routes/api/" + fname);
        ws.on('finish', () => { res.sendFile(fname, { root: __dirname }); });
        fastcsv.write(recs, { headers: true }).pipe(ws);
    });
});

adminRouter.post('/txtwlink', function (req, res) {
    let txIds, twIds;
    if (typeof req.body.txId === 'undefined' || req.body.txId === null) txIds = [0];
    else if (typeof req.body.txId.length === 'undefined') txIds = [req.body.txId]; else txIds = req.body.txId;
    if (typeof req.body.twId === 'undefined' || req.body.twId === null) twIds = [0];
    else if (typeof req.body.twId.length === 'undefined') twIds = [req.body.twId]; else twIds = req.body.twId;
    let updates = 0;
    for (let txId of txIds) {
        for (let twId of twIds) {
            updates += 1;
            twisedb.txTwLink(req.body.admin, txId, twId, () => { if (--updates === 0) res.send("OK"); });
        }
    }
});

adminRouter.post('/bctwlink', function (req, res) {
    let twIds;
    if (typeof req.body.twId === 'undefined' || req.body.twId === null) twIds = [0];
    else if (typeof req.body.twId.length === 'undefined') twIds = [req.body.twId]; else twIds = req.body.twId;
    let updates = 0;
    for (let twId of twIds) {
        updates += 1;
        twisedb.bcTwLink(req.body.admin, req.body.BCId, twId, () => { if (--updates === 0) res.send("OK"); });
    }
});

module.exports = adminRouter;

