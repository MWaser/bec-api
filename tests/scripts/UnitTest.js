var assert = require('assert');
var debug = require('debug');
var tedious = require('tedious');
var tediousExpress = require('../../library/express4tediousX');

var config = {
    userName: 'apiuser',
    password: 'mayur4all!',
    server: 'blockblox.database.windows.net',
    options: { encrypt: true, database: 'bec-db-dev', rowCollectionOnDone: true, rowCollectionOnRequestCompletion: true }
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
        console.log("TE!");
        var Stream = require('stream');
        var ws = new Stream;
        ws.writable = true;
        ws.bytes = 0;
        ws.write = function (buf) {
            console.log("*");
            ws.bytes += buf.length;
            console.log(buf);
        };
        ws.end = function (buf) {
            console.log("***");
            if (arguments.length) ws.write(buf);
            ws.writable = false;
            console.log('bytes length: ' + ws.bytes);
        };

        this.timeout(5000);
        console.log("TE!");
        var zap = tediousExpress(config);
        zap("select * from Users FOR JSON PATH").into(ws);
        console.log(ws);
        console.log("TE!");
        done();
    });
});
