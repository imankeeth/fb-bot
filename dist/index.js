'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

var app = (0, _express2.default)();
var PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.set('port', process.env.PORT || 3000);

// Process application/x-www-form-urlencoded
app.use(_bodyParser2.default.urlencoded({ extended: false }));
// Process application/json
app.use(_bodyParser2.default.json());
// adding logger
app.use((0, _morgan2.default)("dev"));

//create endpoint for webhook
app.post('/webhook', function (req, res) {

  var body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
      var event = req.body.entry[0].messaging[i];
      var sender = event.sender.id;
      if (event.message && event.message.text) {
        var text = event.message.text;
        if (text === 'Generic') {
          sendGenericMessage(sender);
          continue;
        }
        sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
      }
    }
    res.sendStatus(200);
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Facebook verification
app.get('/webhook', function (req, res) {

  // Your verify token. Should be a random string.
  var VERIFY_TOKEN = "thisissecrettoken";

  // Parse the query params
  var mode = req.query['hub.mode'];
  var token = req.query['hub.verify_token'];
  var challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Index route
app.get('/', function (req, res) {
  return res.send('Hello world, I am a chat bot');
});

function sendTextMessage(sender, text) {
  var messageData = { text: text };
  (0, _request2.default)({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function sendGenericMessage(sender) {
  var messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "First card",
          subtitle: "Element #1 of an hscroll",
          image_url: "https://openclipart.org/image/800px/svg_to_png/246322/Badeendje.png",
          buttons: [{
            type: "web_url",
            url: "https://www.messenger.com",
            title: "web url"
          }, {
            type: "postback",
            title: "Postback",
            payload: "Payload for first element in a generic bubble"
          }]
        }, {
          title: "Second card",
          subtitle: "Element #2 of an hscroll",
          image_url: "https://openclipart.org/image/800px/svg_to_png/246322/Badeendje.png",
          buttons: [{
            type: "postback",
            title: "Postback",
            payload: "Payload for second element in a generic bubble"
          }]
        }]
      }
    }
  };
  (0, _request2.default)({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: "POST",
    json: {
      recipient: { id: sender },
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log("Error sending messages: ", error);
    } else if (response.body.error) {
      console.log("Error: ", response.body.error);
    }
  });
}

// Listen to the server
app.listen(app.get('port'), function () {
  return console.log('running on port', app.get('port'));
});