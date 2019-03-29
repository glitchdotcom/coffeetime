const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const { setup, blocksBuilder } = require('./util');


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

function onYesInstallFlow(bot, message) {
    const blocks = [
      blocksBuilder.section(
        '*Fantastic!*',
        'First question, who should I enroll in CoffeeTime?'),
      blocksBuilder.actions(
        blocksBuilder.button('Everyone!', setup.SUBSCRIBE_ALL),
        blocksBuilder.button('Not right now', setup.NO_INSTALL_VALUE)
      )
    ];
  bot.replyInteractive(message, {
    blocks
  });
}

function onNoInstallFlow(bot, message) {
  bot.replyInteractive(message, {
    text: 'OK no problem! Summon me anytime with `/coffeebot`, or reply with `help` to learn more.'
  });
}