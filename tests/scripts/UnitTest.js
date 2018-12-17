var assert = require('assert');

describe('Test Suite 1', function () {
    this.timeout(5000);
    it('Mocha Check', function () {
        assert.ok(true, "This shouldn't fail");
    });

    it('DB Conn Check', function (done) {
        this.timeout(5000);
        var Connection = require('tedious').Connection;
        var config = {
            userName: 'bbuser',
            password: 'mayur4all!',
            server: 'blockblox.database.windows.net',
            options: { encrypt: true, database: 'BECLtdDB-Dev' }
        };
        var connection = new Connection(config);
        connection.on('connect', function (err) {
            if (err) done(err); else done();
        });
    });
});
