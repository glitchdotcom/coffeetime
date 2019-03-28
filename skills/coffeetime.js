/*

The coffeetime bot code goes here

*/
const coffee = require('../util/coffee');
const user = require('../util/user');
const storage = require('../util/storage');

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
  
  controller.hears(['^help'], 'direct_message,direct_mention', function(bot, message) {
    console.log(bot.bot_access_token);
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
  
  controller.hears(['^coffeetimerun'], 'direct_message,direct_mention', function(bot, message) {
    const { pairs, pastMatches } = coffee.runCoffeeTime();
    coffee.saveNewPairings(pairs, pastMatches);
    coffee.broadcastCoffeeGroups(bot, pairs, 'hello! this is your coffeepair this week!');

    bot.createConversation(message, function(err, convo) {
      //Right now let's trigger the pairing by sending the bot a message with "coffeetime"
      // @TODO limit to certain users MVP
      // @TODO auto-schedule BACKLOG
      
      convo.say('We just ran coffeetime and generated a pair of users, lets message them all!!');      
      convo.say('~Done~');
      convo.activate();
    });
  });

  controller.hears(['^subscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, async function(err, convo) {
      const slackUser = await user.getSlackUserInfo(bot, message.event.user);
      const status = user.subscribeUser(slackUser);
      if (status === true) {
        convo.say('Hi! Welcome to coffeetime.');
        convo.activate();
      } else {
        convo.say('Hi! We tried to add you but looks like you were already subscribed. Contact the Coffeetime team if you are not getting paired.');
        convo.activate();
      }
    });
  });

  controller.hears(['^unsubscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, async function(err, convo) {
      const slackUser = await user.getSlackUserInfo(bot, message.event.user);
      user.unsubscribeUser(slackUser);
      convo.say('enjoy your break from coffeetime');
      convo.activate();
    });
  });
  
  controller.on('slash_command', function(bot, message){
    // TODO - add slash commands via slack admin interface
  });
};


