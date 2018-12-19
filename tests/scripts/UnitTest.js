var assert = require('assert');
var debug = require('debug');
var tedious = require('tedious');
var tediousExpress = require('../../library/express4tediousX');

var config = {
    server: 'blockblox.database.windows.net',
    userName: 'apiuser',
    password: 'mayur4all!',
    options: { encrypt: true, database: 'bec-db-dev' }
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
        zap("select * from Users FOR JSON PATH").toStr(function (str) {
            console.log(str);
            done();
        });
    });
});
