const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const debug = require('debug')('botkit:webserver');
const http = require('http');
const hbs = require('express-hbs');

const oath = require('./routes/oauth.js');
const webhooks = require('./routes/incoming_webhooks.js');

module.exports = function(controller) {

  const webserver = express();
  webserver.use(cookieParser());
  webserver.use(bodyParser.json());
  webserver.use(bodyParser.urlencoded({ extended: true }));

  // set up handlebars ready for tabs
  webserver.engine('hbs', hbs.express4({partialsDir: __dirname + '/../views/partials'}));
  webserver.set('view engine', 'hbs');
  webserver.set('views', __dirname + '/../views/');

  webserver.use(express.static('public'));

  // Middleware to add the "controller" to every request.
  const setController = (req, res, next) => {
    req.controller = controller;
    next();
  };
  webserver.use(setController);
  
  // Add routes.
  webserver.use(oath);
  webserver.use(webhooks);
  
  const server = http.createServer(webserver);
  server.listen(process.env.PORT || 3000, null, () => {
    console.log('Express webserver configured and listening at http://localhost:' + process.env.PORT || 3000);
  });
  
  controller.webserver = webserver;
  controller.httpserver = server;

  return webserver;
}
