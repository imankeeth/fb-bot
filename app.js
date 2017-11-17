import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import morgan from 'morgan';

const app = express();

app.set('port', (process.env.PORT || 3000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Process application/json
app.use(bodyParser.json());
// adding logger
app.use(morgan("dev"));

// Index route
app.get('/', (req, res) => res.send('Hello world, I am a chat bot'));

// for Facebook verification
app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

// Listen to the server
app.listen(app.get('port'), () => console.log('running on port', app.get('port')));