/*

The coffeetime bot code goes here

*/

module.exports = function(controller) {
  controller.hears(['^subscribe', '^debug'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //ok here is how to get user info
      bot.api.users.info({ user: message.event.user }, (error, response) => {
        console.log(response.user);
      });

      convo.say('Hi welcome to coffeetime');
    });
  });
};
