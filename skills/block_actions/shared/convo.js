const { setup, blocksBuilder } = require('./util');

module.exports.startAdminSetupConversation = function(bot, user) {
  const blocks = [
      blocksBuilder.section('Welcome to CoffeeTime!'),
      blocksBuilder.section(...module.exports.defineCoffeeTimeDialogue()),
      blocksBuilder.section(
        'Would you like to set up CoffeeTime for your team?'),
      blocksBuilder.actions(
        blocksBuilder.button('Yes! 💫', setup.YES_INSTALL_VALUE),
        blocksBuilder.button('Not right now', setup.NO_INSTALL_VALUE)
      )
    ];
    bot.api.im.open({ user }, (error, response) => {
      bot.api.chat.postMessage({
        channel: response.channel.id,
        blocks
      });
    }); 
};

module.exports.defineCoffeeTimeDialogue = function() {
  return [
    '> *CoffeeTime* is an app that lets you schedule coffee other people in your Slack.',
    "> • Every week, I'll choose a coffee partner for you from the pool of CoffeeTime subscribers in your office.",
    "> • I'll send you and your partner a message, telling you to find time to get coffee together.",
    "> • You can change your participation in CoffeeTime with `/coffeetime subscribe` or `/coffeetime unsubscribe`."
  ];
};

module.exports.userSubscribedDialogue = function(isSubscribed) {
  if (isSubscribed) {
    return ["Yay!! You've subscribed to CoffeeTime! ✨ ",
        
        convo.say("I'll message you with you coffee buddy on *Monday*.");
      } else {
        // TODO: finish this
        convo.say("You're already subscribed to CoffeeTime!");
        convo.say("Your buddy this week is");
      }
};

