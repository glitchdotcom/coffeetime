const coffee = require('./../../../util/coffee');
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

module.exports.userSubscribedDialogue = function(isNewlySubscribed, userInfo) {
  if (!userInfo.isSubscribed) {
    return ["Darn, something weird happened and you aren't subscribed.",
            "Contact the CoffeeTime team? Sorry!!"];
  }
  if (isNewlySubscribed) {
    // TODO: Update to be possibly not Monday. 
    return ["Yay!! You've subscribed to CoffeeTime! ✨ ",
            "I'll message you with you coffee buddy on *Monday*."];
  }
  
  const dialogue = [
    "You're already subscribed to CoffeeTime!"
  ];
  if (!userInfo.coffeePartners || userInfo.coffeePartners.length === 0) {
    // TODO: Change Monday to a variable
    dialogue.push("You haven't been matched with a partner yet. Check back Monday around 9am!");
  } else {
    dialogue.push('This week you are getting coffee with ' + coffee.slackPrintGroup(userInfo.coffeePartners) + '.');
    dialogue.push("Reach out to them if you haven't already!");
  }
  return dialogue;
};

module.exports.userUnsubscribedDialogue = function(isAlreadyUnsubscribed) {
  if (isAlreadyUnsubscribed) {
    return ["You are already unsubscribed from CoffeeTime."];
  }
  return ["Enjoy your break from CoffeeTime!",
      "You can always come back by sending a `subscribe` message."];
};
