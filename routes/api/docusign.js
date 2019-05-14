'use strict';
var app = require('express');
var docusignRouter = app.Router();

const config = require('../../library/config');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const rp = require('request-promise-native');
var userdb = require('./userdb');

function getJWT(user, cb) {
    let jwtDocusign;
    const dsVars = config.docusignApi;
    let payload = {
        "iss": dsVars.integratorKey,
        "sub": dsVars.userId,
        "iat": new Date().getTime() / 1000,
        "exp": new Date().getTime() / 1000 + 3600,
        "aud": dsVars.oAuthBasePath,
        "scope": "signature impersonation"
    };
    let privateKey = fs.readFileSync(dsVars.privateKey);
    let jwt_token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    rp.post(`https://${dsVars.oAuthBasePath}/oauth/token`, {
        json: true,
        form: {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': jwt_token
        },
        followAllRedirects: true
    })
        .then((result) => {
            jwtDocusign = { token: result.access_token, expires: new Date().getTime() + (result.expires_in * 1000) };
            // Call userinfo to get the user's account_id and api_base_url
            // See https://docs.docusign.com/esign/guide/authentication/userinfo.html
            var options = {
                method: 'GET',
                url: 'https://' + dsVars.oAuthBasePath + '/oauth/userinfo',
                headers: { Authorization: 'Bearer ' + jwtDocusign.token },
                json: true
            };
            return rp(options);
        })
        .then((result) => {
            jwtDocusign.baseUri = result.accounts[0].base_uri + "/restapi/v2/accounts/" + result.accounts[0].account_id;
            cb(user, jwtDocusign);
        });
}

function createEnv(user, JWT) {
    const dsVars = config.docusignApi;
    var checkboxTabs = [], textTabs = [];
    textTabs.push({ tabLabel: 'Total Euro', value: user.info.euro_amount });
    textTabs.push({ tabLabel: 'Units', value: user.info.unit_amount });
    textTabs.push({ tabLabel: 'Unit price', value: user.info.rate });
    if (user.info.personType === 'UP') {
        checkboxTabs.push({ tabLabel: 'Investor = person', selected: true });
        checkboxTabs.push({ tabLabel: 'Investor = US', selected: true });
        checkboxTabs.push({ tabLabel: 'Tax exempt = No', selected: true });
        textTabs.push({ tabLabel: 'SSN or EIN', value: user.info.SSN });
        textTabs.push({ tabLabel: 'Investor Name', value: user.name });
    } else if (user.info.personType === 'UE') {
        checkboxTabs.push({ tabLabel: 'Investor = entity', selected: true });
        checkboxTabs.push({ tabLabel: 'Investor = US', selected: true });
        if (user.info.ue_investor_type === 'self') {
            if (user.info.ue_custodian) checkboxTabs.push({ tabLabel: 'InvType = Cust', selected: true });
            else checkboxTabs.push({ tabLabel: 'InvType = Self', selected: true });
        } else {    // user.info.ue_investor_type === 'others'
            checkboxTabs.push({ tabLabel: 'InvType = Others', selected: true });
            textTabs.push({ tabLabel: 'Others amount', value: user.info.others_amount });
        }
        textTabs.push({ tabLabel: 'Jurisdiction', value: 'United States' });
        if (user.info.ue_foreign_banks) checkboxTabs.push({ tabLabel: 'Foreign bank = Yes', selected: true });
        else checkboxTabs.push({ tabLabel: 'Foreign bank = No', selected: true });
        if (user.info.taxExempt === 'yes') checkboxTabs.push({ tabLabel: 'Tax exempt = Yes', selected: true });
        else checkboxTabs.push({ tabLabel: 'Tax exempt = No', selected: true });
        textTabs.push({ tabLabel: 'SSN or EIN', value: user.info.fein });
        textTabs.push({ tabLabel: 'Investor Name', value: user.info.ue_organization_name });
        textTabs.push({ tabLabel: 'Investor Title', value: user.info.ue_title });
    } else if (user.info.personType === 'NP') {
        checkboxTabs.push({ tabLabel: 'Investor = person', selected: true });
        checkboxTabs.push({ tabLabel: 'Investor = non-US', selected: true });
        checkboxTabs.push({ tabLabel: 'FE Has Id', selected: true });
        var id = user.country;
        if (typeof user.kyc.docType !== 'undefined') id = id + " " + user.kyc.docType;
        if (typeof user.kyc.docNumber !== 'undefined') id = id + " " + user.kyc.docNumber;
        textTabs.push({ tabLabel: 'Identification No', value: id });
        textTabs.push({ tabLabel: 'Investor Name', value: user.name });
    } else {    // (user.info.personType === 'NE')
        checkboxTabs.push({ tabLabel: 'Investor = entity', selected: true });
        checkboxTabs.push({ tabLabel: 'Investor = non-US', selected: true });
        if (user.info.ne_investor_type === 'self') {
            if (user.info.ne_custodian) checkboxTabs.push({ tabLabel: 'InvType = Cust', selected: true });
            else checkboxTabs.push({ tabLabel: 'InvType = Self', selected: true });
        } else {    // user.info.ne_investor_type === 'others'
            checkboxTabs.push({ tabLabel: 'InvType = Others', selected: true });
            textTabs.push({ tabLabel: 'Others amount', value: user.info.ne_others_amount });
        }
        textTabs.push({ tabLabel: 'Jurisdiction', value: user.info.ne_jurisdiction });
        if (user.info.ne_foreign_banks) checkboxTabs.push({ tabLabel: 'Foreign bank = Yes', selected: true });
        else checkboxTabs.push({ tabLabel: 'Foreign bank = No', selected: true });
        checkboxTabs.push({ tabLabel: 'FE Has Id', selected: true });
        textTabs.push({ tabLabel: 'Identification No', value: user.info.ne_identifier });
        textTabs.push({ tabLabel: 'Investor Name', value: user.info.ne_organization_name });
        textTabs.push({ tabLabel: 'Investor Title', value: user.info.ne_title });
    }
    textTabs.push({ tabLabel: 'Investor Address', value: user.info.address });

    var purchaser = { recipientId: '1', roleName: 'Purchaser', tabs: { textTabs: textTabs, checkboxTabs: checkboxTabs } };
    purchaser.email = user.email;
    purchaser.name = user.name;
    purchaser.clientUserId = user.email;
    var seller = { email: dsVars.sellerEmail, name: dsVars.sellerName, recipientId: '2', roleName: 'Seller' };
    var inlineTemplate = { recipients: { signers: [purchaser, seller] }, sequence: '2' };
    var serverTemplate = { sequence: '1', templateId: dsVars.templateId };
    var compTemplate = { compositeTemplateId: '1', inlineTemplates: [inlineTemplate], serverTemplates: [serverTemplate] };
    var subject = 'BSD Unit Sale Agreement';
    var body = { compositeTemplates: [compTemplate], emailSubject: subject, emailBlurb: '', status: 'sent' };
    // console.log(JSON.stringify(body));
    var options = {
        method: 'POST',
        url: JWT.baseUri + '/envelopes',
        headers: { Authorization: 'Bearer ' + JWT.token },
        body: body,
        json: true
    };
    rp(options)
        .then((result) => {
            userdb.chgInfo(user.email, user.info, result.envelopeId, (obj) => { user.res.send(result); });
        })
        .catch((err) => {
            console.log('Error! ' + JSON.stringify(err));
        });
}

docusignRouter.post('/createEnv', function (req, res) {
    let user = req.body.user;
    user.reqUrl = req.url;
    user.res = res;
    getJWT(user, createEnv);
});

function getSignURL(user, JWT) {
    var body = {
        authenticationMethod: 'PaperDocuments',
        clientUserId: user.email,
        email: user.email,
        returnUrl: user.reqUrl,
        userName: user.name
    };
    var options = {
        method: 'POST',
        url: JWT.baseUri + '/envelopes/' + user.envelopeId + '/views/recipient',
        headers: { Authorization: 'Bearer ' + JWT.token },
        body: body,
        json: true
    };
    rp(options)
        .then((result) => {
            user.res.send(result);
        })
        .catch((err) => {
            console.log('Error! ' + JSON.stringify(err));
            user.res.send("ERROR in getSignURL - " + JSON.stringify(err));
        });
}

docusignRouter.post('/getSignURL', function (req, res) {
    let user = req.body.user;
    userdb.getOne(user.id, (user2) => {
        user.envelopeId = user2[0].EnvelopeId;
        user.reqUrl = "http://" + req.headers.host + '/' + user.site + '/purchase?nospoof=' + user.envelopeId;
        user.res = res;
        getJWT(user, getSignURL);
    });
});

module.exports = docusignRouter;