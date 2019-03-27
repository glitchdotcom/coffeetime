const debug = require('debug')('botkit:oauth');
const express = require('express');
const router = express.Router();

function getSlackApi() {
}

function onGetOath(req, res) {
  console.log('oathhhhhhhhhhhhhh');
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

    // what scopes did we get approved for?
    const scopes = auth.scope.split(/\,/);

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
    
  const testbot = controller.spawn(team.bot);

  // Gets the identity/name of the bot.
  testbot.api.auth.test({}, function(err, bot_auth) {
    if (err) {
      console.log('Error: could not authenticate bot user', err);
    } else {
      team.bot.name = bot_auth.user;
      
      // add in info that is expected by Botkit
      testbot.identity = bot_auth;
      testbot.identity.id = bot_auth.user_id;
      testbot.identity.name = bot_auth.user;
      testbot.team_info = team;

      // Replace this with your own database!

      controller.storage.teams.save(team, function(err, id) {
        if (err) {
            console.log('Error: could not save team record:', err);
        } else {
          if (new_team) {
            console.log('Team created:', team);
            // Trigger an event that will cause this team to receive onboarding messages
            controller.trigger('onboard', [testbot, team]);
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

function help(req, res) {
  console.log('help has been called');
  
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const authedBot = req.controller.spawn({
    token: slackBotToken
  });

  authedBot.startPrivateConversation({user: 'UH1HHBF41'},function(err,convo) {
    if (err) {
      console.log(err);
    } else {
      convo.say('Send a message on cue');
    }
  });
  //console.log(req.controller);
  res.json('hello');
}


router.get('/oauth', onGetOath);
router.get('/login', onLogin);
router.get('/help', help);


module.exports = router;
