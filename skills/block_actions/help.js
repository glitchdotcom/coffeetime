const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const sharedConvo = require('./shared/convo');
const { help, blocksBuilder } = require('./shared/util');

// This is a weird in-memory cache of users ....
// Cached bc async calls don't seem to work in the middle of an interactive interaction.
const userListShenanigans = {};

module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {     
      switch(action.value) {
        case help.YES_INSTALL_VALUE:
        break;
      }
    }
  });
  controller.hears(['^help'], 'direct_message,direct_mention', function(bot, message) {
    const blocks = [
      blocksBuilder.section("Hello and welcome to CoffeeTime! ✨ How can I help you?"),
      blocksBuilder.divider(),
      blocksBuilder.section("*Basics*"),
      blocksBuilder.actions(
        blocksBuilder.button("What's CoffeeTime?", help.WHAT_IS_THIS_VALUE),
        blocksBuilder.button("My Coffee Buddy", help.WHO_IS_MY_BUDDY_VALUE),
        blocksBuilder.button('My CoffeeTime status', help.AM_I_SIGNED_UP_VALUE),
      )
    ];
    bot.reply(message, { blocks });
  });
  
  controller.hears(['^oldhelp'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      const data = storage.loadData();

      if (user.checkForUser(message.user, data)) {
        convo.say('You are all set! Use `unsubscribe` to stop pairing.');
        const managerId = user.getManager(message.user);
        if (managerId) {
          convo.say(`<@${managerId}> is your manager, you won't pair with them`);
        } else {
          convo.say(`You don't have a manager set.  Set your manager with 'manager @<Your_Manager>'`);
        }
      } else {
        convo.say('You are not subscribed yet. Use `subscribe` to change that.');
      }
      convo.activate();
    });
  });
};
