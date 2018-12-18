﻿'use strict';
var express = require('express');
var router = express.Router();

router.use('/user', require('./api/user'));

router.get('/', function (req, res) {
    res.send('You need to call a specific api');
});

module.exports = router;