var assert = require('assert');
var debug = require('debug');
var tedious = require('tedious');
var tediousExpress = require('express4-tedious');

var config = {
    userName: 'apiuser',
    password: 'mayur4all!',
    server: 'blockblox.database.windows.net',
    options: { encrypt: true, database: 'bec-db-dev', rowCollectionOnDone: true, rowCollectionOnRequestCompletion: true  }
};

describe('Test Suite 1', function () {
    this.timeout(5000);
    it('Mocha Check', function () {
        assert.ok(true, "This shouldn't fail");
    });

    it('DB Conn Check', function (done) {
        this.timeout(5000);
        var connection = new tedious.Connection(config);
        connection.on('connect', function (err) {
            if (err) done(err); else done();
            connection.close();
        });
    });

    it('Tedious-Express Check', function (done) {
        this.timeout(5000);
        var zap = tediousExpress(config);
        var result;
        zap("SELECT * FROM Users WHERE EMail LIKE mark.waser@gmail.com")
            .param('pEmail', 'London', tedious.TYPES.VarChar)
            .into(result);
        console.log("TE!");
        console.log(result);
        console.log("TE!");
        done();
    });
});
