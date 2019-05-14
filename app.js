'use strict';
var debug = require('debug');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const config = require('./library/config.js');

var app = express();
app.options('*', cors());
app.use(function(req, res, next) { res.header('Access-Control-Allow-Origin', '*'); next(); });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build'), { setHeaders: function (res, path, stat) { res.set('Set-Cookie', "env=" + config.reactEnv + ";Path=/"); } }));

var api = require('./routes/api');
app.use('/api/', api);
app.get('/', function (req, res) { res.sendFile('index.html', { root: './build' }); });
app.get('/us', function (req, res) { res.sendFile('index.html', { root: './build' }); });
app.get('/us/*', function (req, res) { res.sendFile('index.html', { root: './build' }); });
app.get('/nonus', function (req, res) { res.sendFile('index.html', { root: './build' }); });
app.get('/nonus/*', function (req, res) { res.sendFile('index.html', { root: './build' }); });
app.get('/admin', function (req, res) { res.sendFile('index.html', { root: './build' }); });
app.get('/admin/*', function (req, res) { res.sendFile('index.html', { root: './build' }); });

app.use(function (req, res, next) { res.status(404); res.send('ERROR: Not Found'); next(err); });
app.use(function (err, req, res, next) { console.log('non-dev Error: ' + JSON.stringify(err)); });

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function () { debug('Express server listening on port ' + server.address().port); });
