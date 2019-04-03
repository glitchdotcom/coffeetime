const coffee = require('../util/coffee');
const user = require('../util/user');
const storage = require('../util/storage');
const sharedConvo = require('./block_actions/shared/convo');

module.exports = function(controller) {
  controller.hears(['^manager'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      const regex = /<@([^>]+)>/;
      const managerMatch = regex.exec(message.text);
      if (!user.isUserInDatabase(message.user, storage.loadData())) {
        convo.say('You are not subscribed yet. Use `subscribe` to change that.');
      } else if (managerMatch) {
        const managerId = managerMatch[1];
        user.setManager(message.user, managerId);
        convo.say(`<@${managerId}> is your manager now`);
      } else if (message.text.includes('none')) {
        const oldManagerId = user.getManager(message.user);
        user.setManager(message.user, null);
        if (oldManagerId) {
          convo.say(`<@${oldManagerId}> is not your manager any more`);
        } else {
          convo.say(`You didn't have a manager set`);
        }
      } else {
        const managerId = user.getManager(message.user);
        if (managerId) {
          convo.say(`<@${managerId}> is your manager. Say \`manager none\` to have no manager`);
        } else {
          convo.say(`You don't have a manager set.  Set your manager with 'manager @<Your_Manager>'`);
        }
      }
      convo.activate();
    });
  });
  
  
  controller.hears(['^coffeetimerun'], 'direct_message', function(bot, message) {
    console.log('hello!');
    bot.replyPrivate(message, sharedConvo.getRunCoffeetimeBlocks());
  });

  controller.hears(['^subscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, async function(err, convo) {
      const textToSay = await subscribeUser(bot, message.event.user);
      convo.say(textToSay);
      convo.activate();
    });
  });

  controller.hears(['^unsubscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message,  function(err, convo) {
      const textToSay = unsubscribeUser(bot, message.event.user);
      convo.say(textToSay);
      convo.activate();
    });
  });
  
  controller.on('slash_command', async function(bot, message) {
    const commandMessage = message.text;
    const userInfo = user.getUserInfo(message.user_id);
    switch (commandMessage) {
      case 'subscribe': {
        const textToSay = await subscribeUser(bot, message.user_id);
        break;
      } 
      case 'unsubscribe': {
        const textToSay = unsubscribeUser(bot, message.user_id);
        bot.replyPrivate(message, textToSay);
        break;
      }
      case 'admin': {
        bot.replyPrivate(message, sharedConvo.getAdminMenuBlocks());
        break;
      }
      default:
        bot.replyPrivate(message, sharedConvo.getHelpMenuBlocks(message.user_id));
        break;
    }
  });
};

// Subscribes the given user and returns the dialogue to say after doing so.
async function subscribeUser(bot, slackId) {
  const slackUser = await user.getSlackUserInfo(bot, slackId);
  const isNewlySubscribed = user.subscribeUser(slackUser);
  const userInfo = user.getUserInfo(slackId);
  return sharedConvo.userSubscribedDialogue(isNewlySubscribed, userInfo).join('\n');
}

// Unsubscribes the given user and returns the dialogue to say after doing so.
function unsubscribeUser(bot, slackId){
  const userInfo = user.getUserInfo(slackId);
  const isAlreadyUnsubscribed = !userInfo.isSubscribed;
  if (!isAlreadyUnsubscribed) {
    user.unsubscribeUser(slackId);
  }
  return sharedConvo.userUnsubscribedDialogue(isAlreadyUnsubscribed).join('\n');
}