const debug = require('debug')('botkit:onboarding');

const sharedConvo = require('./../skills/block_actions/shared/convo');

module.exports = function(controller) {
  controller.on('onboard', function(bot) {
    console.log('Starting an onboarding experience!');
    sharedConvo.startAdminSetupConversation(bot, bot.config.createdBy);
  });
}
