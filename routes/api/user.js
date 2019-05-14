'use strict';
const userRouter = require('express').Router();
const userdb = require('./userdb');
const config = require('../../library/config');
const civicClient = require('civic-sip-api').newClient(config.civicApi);
const jwt = require("jsonwebtoken");
const fastcsv = require('fast-csv');
const fs = require('fs');

userRouter.get('/', function (req, res, next) { userdb.getAll((obj) => { res.send(JSON.stringify(obj)); }); });
userRouter.get('/prod', function (req, res, next) { userdb.getProd((obj) => { res.send(JSON.stringify(obj)); }); });

userRouter.get('/csv/users', function (req, res) {
    userdb.getProd((obj) => {
        const fname = "users.csv";
        const ws = fs.createWriteStream("routes/api/" + fname);
        console.log(__dirname);
        ws.on('finish', () => { res.sendFile(fname, { root: __dirname }); });
        fastcsv.write(obj, { headers: true }).pipe(ws);
    });
});

userRouter.get('/:userId(\\d+)', function (req, res, next) {
    userdb.getOne(req.params.userId, (obj) => {
        res.send((obj && obj.length) ? obj[0] : {});
    });
});

userRouter.get('/txTotals', function (req, res, next) { userdb.getTxTotals((obj) => { res.send(JSON.stringify(obj)); }); });

userRouter.post('/chgbank', function (req, res, next) {
    userdb.chgBank(req.body.email, req.body.bank, (obj) => { res.send(JSON.stringify(obj)); });
});

userRouter.post('/chgstatus', function (req, res, next) {
    userdb.chgStatus(req.body.email, req.body.status, (obj) => { res.send(JSON.stringify(obj)); });
});

userRouter.post('/delete', function (req, res, next) {
    userdb.delete(req.body.email, (obj) => { res.send(JSON.stringify(obj)); });
});

function login(email, kyc, res) {
    userdb.login(email, kyc, (user) => {
        const userInfo = {};
        userInfo.id = user.Id;
        userInfo.email = user.EMail;
        userInfo.envelopeId = user.EnvelopeId;
        userInfo.info = user.Info === '' ? '' : JSON.parse(user.Info);
        if (user.KYC === '') {
            userInfo.kyc = '';
            userInfo.country = '';
            userInfo.name = '';
        } else {
            userInfo.kyc = JSON.parse(user.KYC);
            userInfo.country = userInfo.kyc.country;
            userInfo.name = userInfo.kyc.name;
        }
        userInfo.bankInfo = user.Banking === '' ? {status: 'awaiting input'} : JSON.parse(user.Banking);
        userInfo.txs = user.Txs === '' ? {} : JSON.parse(user.Txs);
        userInfo.admin = user.Admin === 1;
        userInfo.status = user.Status;
        userInfo.token = jwt.sign({ id: user.Email }, config.tokenSig);
        res.status(200).cookie('userInfo', userInfo, { path: '/', maxAge: 1800000 }).send(userInfo);
    });
}

function getValue(label, x) {
    var item = x.data.find(d => d.label === label);
    if (typeof item !== 'undefined') return item.value; else return "";
}

userRouter.post('/login', function (req, res) {
    console.log('mock = ' + req.body.mock);
    if (req.body.mock) login('', {}, res);
    else civicClient.exchangeCode(req.body.JWT).then((x) => {
        var name = getValue('documents.genericId.name', x);
        var country = getValue('documents.genericId.country', x);
        var dateOfBirth = getValue('documents.genericId.dateOfBirth', x);
        var dateOfIssue = getValue('documents.genericId.dateOfIssue', x);
        var dateOfExpiry = getValue('documents.genericId.dateOfExpiry', x);
        var docType = getValue('documents.genericId.type', x);
        var docNumber = getValue('documents.genericId.number', x);
        var email = getValue('contact.personal.email', x);
        var phoneNumber = getValue('contact.personal.phoneNumber', x);
        var userId = x.userId;
        var kyc = { name: name, country: country, dob: dateOfBirth, doi: dateOfIssue, doe: dateOfExpiry, docType: docType, docNumber: docNumber, email: email, phoneNumber: phoneNumber, userId: userId };
        login(email, kyc, res);
    }).catch((error) => { console.log(error); res.send('LOGIN ERR: ' + error); });
});

userRouter.post('/logout', function (req, res, next) {
    // TODO: Delete cookie token
});

module.exports = userRouter;
