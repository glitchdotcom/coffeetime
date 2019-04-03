const coffee = require('../util/coffee');
const user = require('../util/user');
const storage = require('../util/storage');
const sharedConvo = require('./block_actions/shared/convo');

module.exports = function(controller) {
  controller.hears(['^manager'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      const regex = /<@([^>]+)>/;
      const managerMatch = regex.exec(message.text);
      if (!user.checkForUser(message.user, storage.loadData())) {
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
    coffee.runCoffeeTime(bot);

    bot.createConversation(message, function(err, convo) {
      //Right now let's trigger the pairing by sending the bot a message with "coffeetime"      
      convo.say('We just ran coffeetime and generated a pair of users, lets message them all!!');      
      convo.say('~Done~');
      convo.activate();
    });
  });

  controller.hears(['^subscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, async function(err, convo) {
      const slackUser = await user.getSlackUserInfo(bot, message.event.user);
      const isNewlySubscribed = user.subscribeUser(slackUser);
      const userInfo = user.getUserInfo(message.event.user);
      const dialogue = sharedConvo.userSubscribedDialogue(isNewlySubscribed, userInfo);
      dialogue.forEach(line => convo.say(line));
      convo.activate();
    });
  });

  controller.hears(['^unsubscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message,  function(err, convo) {
      user.unsubscribeUser(message.event.user);
      convo.say("Enjoy your break from CoffeeTime!");
      convo.say("You can always come back by sending a `subscribe` message.");
      convo.activate();
    });
  });
  
  controller.on('slash_command', function(bot, message){
    // TODO - add slash commands via slack admin interface
  });
};
