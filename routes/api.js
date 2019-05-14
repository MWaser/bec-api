'use strict';
var express = require('express');
var router = express.Router();

router.use('/user', require('./api/user'));
router.use('/admin', require('./api/admin'));
router.use('/docusign', require('./api/docusign'));
router.use('/log', require('./api/log'));

router.get('/', function (req, res) {
    res.send('You need to call a specific api');
});

module.exports = router;
