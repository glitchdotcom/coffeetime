const debug = require('debug')('botkit:onboarding');

module.exports = function(controller) {
  controller.on('onboard', function(bot) {
    debug('Starting an onboarding experience!');
    bot.startPrivateConversation({user: bot.config.createdBy},function(err,convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say('Thanks for installing CoffeeTime! ☕️');
        convo.say('There are a few things I need to know so that I can perform at my best ✨');
      }
    });
  });
}
