'use strict';
var express = require('express');
var router = express.Router();
const civicSip = require('civic-sip-api');

const civicClient = civicSip.newClient({
  appId: 'ih9h18V7P',
  prvKey: 'cafdbceda5678406f5877c71d9dd1eff8f3d3ad7261f25b6801b8ca79859acdf',
  appSecret: 'e5226977ca7bd0062edb186d96a293ec'
});

router.get('/', function (req, res) {
  res.send('responding to GET request.  Please use POST to send JWT.');
});

router.post('/', function(req, res){
  var jwt = req.body.JWT;
  console.log('JWT: ' + jwt)
  civicClient.exchangeCode(jwt).then((x) => { res.send('exchanged JWT: ' +  JSON.stringify(x, null, 4)); }).catch((error) => { console.log(error); });
});

module.exports = router;
