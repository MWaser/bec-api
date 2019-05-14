'use strict';
const assert = require('assert');
// const axios = require('axios');
const config = require('../../library/config');
const tedious = require('tedious');
const twisedb = require('../../routes/api/twisedb');
const userdb = require('../../routes/api/userdb');

describe('Test Suite 1', function () {
    this.timeout(10000);

    it('00-Mocha Check', function () { assert.ok(true, "This shouldn't fail"); });

    it('01-TWise Check', function (done) {
        twisedb.createSS('usd', (obj) => { console.log(JSON.stringify(obj)); done(); });
    });

    it('11-DB Conn Check', function (done) {
        this.timeout(10000);
        var connection = new tedious.Connection(config.apiDbConn);
        connection.on('connect', function (err) {
            if (err) done(err); else done();
            connection.close();
        });
    });

    it('12-Transactions Check', function (done) {
        this.timeout(10000);
        userdb.getTxTotals((obj) => { console.log(JSON.stringify(obj)); done(); });
    });

});


