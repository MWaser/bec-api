'use strict';

const assert = require('assert');
const config = require('../../library/config');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const rp = require('request-promise-native');
const sendgrid = require('@sendgrid/mail');
const tedious = require('tedious');
const tediousExpress = require('../../library/express4tediousX');


describe('Test Suite 1', function () {
    this.timeout(10000);
    it('01-Mocha Check', function () {
        assert.ok(true, "This shouldn't fail");
    });

    it('01-SendGrid Check', function () {
        sendgrid.setApiKey(config.sendgridApi.privateKey);
        var email = {
            to: 'mark.waser@rabc.solutions',
            from: 'anna@contoso.com',
            subject: 'test mail',
            text: 'This is a sample email message.'
        };
        sendgrid.send(email, function (err, json) {
            if (err) { return console.error("ERROR: " + err); }
            console.log(json);
        });
    });

    it('02-DB Conn Check', function (done) {
        this.timeout(10000);
        var connection = new tedious.Connection(config.apiDbConn);
        connection.on('connect', function (err) {
            if (err) done(err); else done();
            connection.close();
        });
    });

    it('03-Tedious-Express Check', function (done) {
        this.timeout(10000);
        var zap = tediousExpress(config.apiDbConn);
        zap("select * from Users FOR JSON PATH").toStr(function (str) {
            console.log(str);
            done();
        });
    });

    var txdb = require('../../routes/api/txdb');
    it('04-Transactions Check', function (done) {
        this.timeout(10000);
        txdb.getPending((obj) => { console.log(JSON.stringify(obj)); done(); });
    });

    const dsVars = config.docusignApi;
    //const dsVars = {
    //    "integratorKey": "54344bd9-9625-45c0-a720-d6a2ec6180fb",
    //    "oAuthBasePath": "account.docusign.com",
    //    "privateKey": "./library/docusign-prodkey.txt",
    //    "redirectURI": "https://www.docusign.com/api",
    //    "templateId": "1b58c859-7fce-4202-9907-334b2b11e925",
    //    "userId": "32608263-d16f-4dfc-a6b0-cda8aebd1b1c"
    //};

    let jwtDocusign;
    it('05-Docusign-getJWT', function (done) {
        this.timeout(10000);
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
                console.log(jwtDocusign.baseUri);
                done();
            })
            .catch((err) => {
                console.log('Error! ' + JSON.stringify(err));
                let c0 = 'https://' + dsVars.oAuthBasePath + '/oauth/auth?response_type=code&scope=' + encodeURIComponent(payload.scope);
                let consentUrl = c0 + '&client_id=' + dsVars.integratorKey + '&redirect_uri=' + dsVars.redirectURI;
                console.log('You probably need to get permission from ' + consentUrl);
                done();
            });
    });

    var user = {
        email: 'valid@email.com',
        name: 'name'
    };
    it('06-Docusign-createEnv', function (done) {
        var JWT = jwtDocusign;
        var checkboxTabs = [];
        checkboxTabs.push({ tabLabel: 'Investor = person', selected: true });
        checkboxTabs.push({ tabLabel: 'Investor = US', selected: true });
        checkboxTabs.push({ tabLabel: 'Tax exempt = No', selected: true });
        var textTabs = [];
        textTabs.push({ tabLabel: 'SSN or EIN', value: '123-45-6789' });
        textTabs.push({ tabLabel: 'Total Euro', value: '50,000' });
        textTabs.push({ tabLabel: 'Units', value: '200,000' });
        textTabs.push({ tabLabel: 'Unit price', value: '0.25' });

        var purchaser = { recipientId: '1', roleName: 'Purchaser', tabs: { textTabs: textTabs, checkboxTabs: checkboxTabs } };
        purchaser.email = user.email;
        purchaser.name = user.name;
        purchaser.clientUserId = user.email;
        var seller = { email: 'mark.waser@rabc.solutions', name: 'Seller Mark', recipientId: '2', roleName: 'Seller' };
        var inlineTemplate = { recipients: { signers: [purchaser, seller] }, sequence: '2' };
        var serverTemplate = { sequence: '1', templateId: dsVars.templateId };
        var compTemplate = { compositeTemplateId: '1', inlineTemplates: [inlineTemplate], serverTemplates: [serverTemplate] };
        var subject = 'Customizable e-mail subject';
        var blurb = 'Customizable e-mail blurb';
        var body = { compositeTemplates: [compTemplate], emailSubject: subject, emailBlurb: blurb, status: 'sent' };
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
                console.log("SEND result = " + JSON.stringify(result));
                user.envelopeId = result.envelopeId;
                console.log(user);
                done();
                //user.res.send(result);
            });
    });


    it('07-Docusign-getSignURL', function (done) {
        var JWT = jwtDocusign;
        user.reqUrl = 'https://bec.ltd';
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
        // console.log(options);
        rp(options)
            .then((result) => {
                console.log("getSignURL result = " + JSON.stringify(result));
                done();
                // user.res.send(result);
            })
            .catch((err) => {
                console.log('Error! ' + JSON.stringify(err));
                // user.res.send("ERROR in getSignURL - " + JSON.stringify(err));
            });
    });
});


