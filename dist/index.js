'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.set('port', process.env.PORT || 3000);

// Process application/x-www-form-urlencoded
app.use(_bodyParser2.default.urlencoded({ extended: false }));
// Process application/json
app.use(_bodyParser2.default.json());
// adding logger
app.use((0, _morgan2.default)("dev"));

// Index route
app.get('/', function (req, res) {
  return res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

// Listen to the server
app.listen(app.get('port'), function () {
  return console.log('running on port', app.get('port'));
});