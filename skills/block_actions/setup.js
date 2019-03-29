const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const { setup, subscribe, blocksBuilder } = require('./util');


module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {     
      switch(action.value) {
        case setup.YES_INSTALL_VALUE:
          onYesInstallFlow(bot, message);
          break;
        case setup.NO_INSTALL_VALUE:
          onNoInstallFlow(bot, message);
          break;
          
        // Subscribing
        case subscribe.HELP_VALUE:
          onSubscribeHelp(bot, message);
      }
    }
  });
  
  controller.hears('interactive', 'direct_message', function(bot, message) {
    const blocks = [
      blocksBuilder.section(
        'Welcome to CoffeeTime!',
        'Would you like to set up CoffeeTime for your team?'),
      blocksBuilder.actions(
        blocksBuilder.button('Yes! 💫', setup.YES_INSTALL_VALUE),
        blocksBuilder.button('Not right now', setup.NO_INSTALL_VALUE)
      )
    ];
    bot.api.im.open({ user: message.user }, (error, response) => {
      bot.api.chat.postMessage({
        channel: response.channel.id,
        blocks
      });
    });     
  });
};

function subscribeActions() {
  return blocksBuilder.actions(
        blocksBuilder.button('Everyone!', subscribe.ALL_VALUE),
        blocksBuilder.button('Just me!', subscribe.ME_VALUE),
        blocksBuilder.button('No one for now', subscribe.NOBODY),
        blocksBuilder.button('Can you tell me more?', subscribe.HELP_VALUE)
      );
}

function onYesInstallFlow(bot, message) {
  const blocks = [
    blocksBuilder.section(
      '*Fantastic!*',
      'First question, who should I enroll in CoffeeTime?'),
    subscribeActions()
  ];
  bot.replyInteractive(message, { blocks });
}

function onNoInstallFlow(bot, message) {
  bot.replyInteractive(message, {
    text: 'OK no problem! Summon me anytime with `/coffeebot`, or reply with `help` to learn more.'
  });
}

function defineCoffeeTimeDialogue() {
  return [
    '*CoffeeTime* is an app that lets you schedule coffee other people in your Slack.',
    "Every week, I'll make pairs of CoffeeTimers",
  ];
}

function onSubscribeHelp(bot, message) {
  const blocks = [
    blocksBuilder.section(
      '*Sure!*'
      ,),
    subscribeActions()
  ];
  bot.replyInteractive(message, { blocks });
}