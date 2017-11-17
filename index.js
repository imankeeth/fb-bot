import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.set('port', (process.env.PORT || 3000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Process application/json
app.use(bodyParser.json());
// adding logger
app.use(morgan("dev"));


//create endpoint for webhook
app.post('/webhook', (req, res) => {  
  
  let body = req.body;
  
  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id
	    if (event.message && event.message.text) {
		    let text = event.message.text
		    if (text === 'Generic') {
			    sendGenericMessage(sender)
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
app.get('/webhook', (req, res) => {
  
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "thisissecrettoken"
  
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
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
app.get('/', (req, res) => res.send('Hello world, I am a chat bot'));

function sendTextMessage(sender, text) {
  let messageData = { text };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
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
  let messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "First card",
            subtitle: "Element #1 of an hscroll",
            image_url: "https://openclipart.org/image/800px/svg_to_png/246322/Badeendje.png",
            buttons: [
              {
                type: "web_url",
                url: "https://www.messenger.com",
                title: "web url"
              },
              {
                type: "postback",
                title: "Postback",
                payload: "Payload for first element in a generic bubble"
              }
            ]
          },
          {
            title: "Second card",
            subtitle: "Element #2 of an hscroll",
            image_url: "https://openclipart.org/image/800px/svg_to_png/246322/Badeendje.png",
            buttons: [
              {
                type: "postback",
                title: "Postback",
                payload: "Payload for second element in a generic bubble"
              }
            ]
          }
        ]
      }
    }
  };
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: {
        recipient: { id: sender },
        message: messageData
      }
    },
    function(error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
    }
  );
}

// Listen to the server
app.listen(app.get('port'), () => console.log('running on port', app.get('port')));