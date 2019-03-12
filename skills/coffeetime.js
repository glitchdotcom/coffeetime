/*

The coffeetime bot code goes here

*/

module.exports = function(controller) {
  
  controller.hears(['^userList'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //this is a temporary command to get a list of users from a slack 
      // @TODO run this and manually populate coffee.json MVP
      // @TODO remove this and automate subscribe process BACKLOG
      convo.say('We just ran coffeetime');
      convo.activate();

    });
  });
  controller.hears(['^coffeetime'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //Right now let's trigger the pairing by sending the bot a message with "coffeetime"
      // @TODO limit to certain users MVP
      // @TODO auto-schedule BACKLOG
      //@TODO add them to coffeetime.json as subscribed
      convo.say('We just ran coffeetime');
      convo.activate();

    });
  });
  
  
  controller.hears(['^subscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //ok here is how to get user info
      // we'll need this to get everyone's name and slack ID
      bot.api.users.info({ user: message.event.user }, (error, response) => {
        console.log(response.user);
      });
      //@TODO add them to coffeetime.json as subscribed BACKLOG
      convo.say('Hi welcome to coffeetime');
      convo.activate();

    });
  });
  
  controller.hears(['^unsubscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //ok here is how to get user info
      // we'll need this to get everyone's name and slack ID
      bot.api.users.info({ user: message.event.user }, (error, response) => {
        console.log(response.user);
      });
      //@TODO add them to coffeetime.json as unsubscribed BACKLOG
      convo.say('enjoy your break from coffeetime');
      convo.activate();

    });
  });
};
