const debug = require('debug')('botkit:oauth');
const express = require('express');
const router = express.Router();

const coffeeCron = require('./../coffee_cron.js');

function onGetOath(req, res) {
  console.log('oath!');
  const code = req.query.code;
  const state = req.query.state;
  const controller = req.controller;

  // we need to use the Slack API, so spawn a generic bot with no token
  const slackapi = controller.spawn({});

  const opts = {
    client_id: controller.config.clientId,
    client_secret: controller.config.clientSecret,
    code: code
  };

  slackapi.api.oauth.access(opts, function(err, auth) {
    if (err) {
      debug('Error confirming oauth', err);
      return res.redirect('/login_error.html');
    }
    
    // use the token we got from the oauth
    // to call auth.test to make sure the token is valid
    // but also so that we reliably have the team_id field!
    slackapi.api.auth.test({token: auth.access_token}, function(err, identity) {
      if (err) {
        console.log('Error fetching user identity', err);
        return res.redirect('/login_error.html');
      }

      // Now we've got all we need to connect to this user's team
      // spin up a bot instance, and start being useful!
      // We just need to make sure this information is stored somewhere
      // and handled with care!

      // In order to do this in the most flexible way, we fire
      // a botkit event here with the payload so it can be handled
      // by the developer without meddling with the actual oauth route.

      auth.identity = identity;
      onOAuthSuccess(auth, req.controller);

      res.cookie('team_id', auth.team_id);
      res.cookie('bot_user_id', auth.bot.bot_user_id);
      res.redirect('/login_success.html');
    });
  });
}

function onOAuthSuccess(payload, controller) {
  console.log('Got a successful login!');
      
  if (!payload.identity.team_id) {
      console.log('Error: received an oauth response without a team id', payload);
  }
  controller.storage.teams.get(payload.identity.team_id, function(err, team) {

  let new_team = false;
  if (!team) {
    team = {
      id: payload.identity.team_id,
      createdBy: payload.identity.user_id,
      url: payload.identity.url,
      name: payload.identity.team
    };
    new_team = true;
  } else if (err) {
    console.log('Error: could not load team from storage system:', payload.identity.team_id, err);
  }

  team.bot = {
    token: payload.bot.bot_access_token,
    user_id: payload.bot.bot_user_id,
    createdBy: payload.identity.user_id,
    app_token: payload.access_token
  };
    
  const botkitBot = controller.spawn(team.bot);

  // Gets the identity/name of the bot.
  botkitBot.api.auth.test({}, function(err, bot_auth) {
    if (err) {
      console.log('Error: could not authenticate bot user', err);
    } else {
      team.bot.name = bot_auth.user;
      
      // add in info that is expected by Botkit
      botkitBot.identity = bot_auth;
      botkitBot.identity.id = bot_auth.user_id;
      botkitBot.identity.name = bot_auth.user;
      botkitBot.team_info = team;

      // Replace this with your own database!

      controller.storage.teams.save(team, function(err, id) {
        if (err) {
            console.log('Error: could not save team record:', err);
        } else {
          if (new_team) {
            // Schedule cron for the new team.
            coffeeCron.scheduleCoffeeCron(botkitBot);
            controller.trigger('onboard', [botkitBot, team]);
          } else {
            console.log('Team updated:', team);
          }
        }
      });
    }
  });
});
}

function onLogin(req, res) {
  console.log('loginnnnnnnnnnnnnn');
  res.redirect(req.controller.getAuthorizeURL());
};

router.get('/oauth', onGetOath);
router.get('/login', onLogin);

module.exports = router;
