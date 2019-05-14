const sendgrid = require('@sendgrid/mail');
var config = require('../../library/config');

var mailer = {};

mailer.send = function (email) {
    if (email.to.startsWith('nosend')) return;
    sendgrid.setApiKey(config.sendgridApi.privateKey);
    sendgrid.send(email, function (err, json) {
        if (err) { return console.error("ERROR: " + err); }
    });
};

const BEC1Text = `Hello,

Thank you for registering for the BEC Ltd.BSD Unit Sale.If you have any questions as you move through the purchase process, please contact us directly at support@bec.ltd

    Thank you,

        The BEC Ltd.Team`;

const BEC2Text = `Hello,

Thank you for your purchase order of @units@ units for @euros@ EUR. Below you will find your payment instructions, which can also be found at https://bec.ltd/purchase.

An additional 20 EUR fee is required that will be returned to you as a means of confirming the accuracy of the banking coordinates we receive with your inbound payment.  You will always have the opportunity to update this information whenever you so choose.

BEC Ltd. recommends using Transferwise (https://transferwise.com/a/marcoa417) for quick bank transfers with minimal fees.  Funds can be sent via traditional bank wire, but may be subject to transfer fees and/or currency fluctuations or conversion fees.

----------- BANK INFORMATION -----------

Please use the following information to send a total of @total@ EUR.

Please do NOT forget to include your reference number!

Account Holder:          BEC LTD

Bank code (SWIFT/BIC):   DEKTDE7GXXX

IBAN:                    DE76 7001 1110 6054 2825 06

Email Address:           marco.aniballi@bec.ltd

Address:                 Handelsbank
.                        Elsenheimer Str. 41
.                        80687 Munchen, Germany

Reference Number         @ref_no@

Once your payment has been received, you'll receive a confirmation email and will be able to view your units in your dashboard.

    Thank you,

        The BEC Ltd. Team`;

const BEC3Text = `Hello,

Congratulations! You’re payment has been received and your units are now available in your account at https://bec.ltd/dashboard 

If you have any questions, please contact investor relations at ir@bec.ltd 

    Thank you,

        The BEC Ltd. Team`;

mailer.sendBEC1 = function (address) {
    var BEC1Html = 'Hello,<br /><br />Thank you for registering for the BEC Ltd. BSD Unit Sale. If you have any questions as you move through the purchase process, ';
    BEC1Html = BEC1Html + 'please contact us directly at <a href="email:support@bec.ltd">support@bec.ltd</a>.<br /><br /> &nbsp; &nbsp;Thank you,<br /><br /> &nbsp; &nbsp; &nbsp; &nbsp;The BEC Ltd.Team';
    var email = {
        to: address,
        from: 'support@bec.ltd',
        subject: 'Thank you for Registering for the BSD Unit Sale',
        text: BEC1Text,
        html: BEC1Html
    };
    mailer.send(email);
};

mailer.sendBEC2 = function (address, user) {
    var info = JSON.parse(user.Info);
    var BECText = BEC2Text.replace('@units@', info.unit_amount).replace('@euros@', info.euro_amount).replace('@total@', info.euro_amount + 20);
    BECText = BECText.replace('@ref_no@', user.EnvelopeId.substr(24, 12) + '-' + info.unit_amount);
    var BEC2Html = 'Hello,<br /><br />Thank you for your purchase order of ' + info.unit_amount + ' units for ' + info.euro_amount + ' EUR.&nbsp; Below you will find your payment instructions, which can also be found at ';
    BEC2Html = BEC2Html + '<a href="https://bec.ltd/purchase">https://bec.ltd/purchase</a>.<br /><br />An additional 20 EUR fee is required that will be returned to you as a means of confirming the accuracy of the banking ';
    BEC2Html = BEC2Html + 'coordinates we receive with your inbound payment.&nbsp; You will always have the opportunity to update this information whenever you so choose.<br /><br />BEC Ltd.recommends using ';
    BEC2Html = BEC2Html + '<a href="https://transferwise.com/a/marcoa417">Transferwise</a> for quick bank transfers with minimal fees.&nbsp; Funds can be sent via traditional bank wire, but may be subject to transfer fees ';
    BEC2Html = BEC2Html + 'and / or currency fluctuations or conversion fees.<br /><br /><b>----------- BANK INFORMATION -----------</b><br /><br />Please use the following information to send a total of ' + (info.euro_amount + 20);
    BEC2Html = BEC2Html + ' @EUR.<br />Please do NOT forget to include your reference number!<br /><br /><pre>' + `Account Holder:          BEC LTD
Bank code (SWIFT/BIC):   DEKTDE7GXXX
IBAN:                    DE76 7001 1110 6054 2825 06
Email Address:           marco.aniballi@bec.ltd
Address:                 Handelsbank
                         Elsenheimer Str. 41
                         80687 Munchen, Germany
Reference Number         ` + user.EnvelopeId.substr(24, 12) + '-' + info.unit_amount + '</pre><br /><br />Once your payment has been received, you will receive a confirmation email and will be able to view your units in ';
    BEC2Html = BEC2Html + 'your dashboard</a>.<br/><br /> &nbsp; &nbsp;Thank you,<br /><br /> &nbsp; &nbsp; &nbsp; &nbsp;The BEC Ltd.Team';
    var email = {
        to: address,
        from: 'support@bec.ltd',
        subject: 'Thank you for your purchase order',
        text: BECText,
        html: BEC2Html
    };
    mailer.send(email);
};

mailer.sendBEC3 = function (address) {
    var BEC3Html = 'Hello,<br /><br />Congratulations! Your payment has been received and your units are now available in your account at ';
    BEC3Html = BEC3Html + '<a href="https://bec.ltd/dashboard">https://bec.ltd/dashboard</a>.<br/><br />If you have any questions, ';
    BEC3Html = BEC3Html + 'please contact investor relations at <a href="email:ir@bec.ltd">ir@bec.ltd</a>.<br /><br /> &nbsp; &nbsp;Thank you,<br /><br /> &nbsp; &nbsp; &nbsp; &nbsp;The BEC Ltd.Team'
    var email = {
        to: address,
        from: 'support@bec.ltd',
        subject: 'Your Payment has been Received!',
        text: BEC3Text,
        html: BEC3Html
    };
    mailer.send(email);
};

module.exports = mailer;

