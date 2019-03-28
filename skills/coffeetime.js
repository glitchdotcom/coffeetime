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
        coffee.setManager(message.user, managerId);
        convo.say(`<@${managerId}> is your manager now`);
      } else if (message.text.includes('none')) {
        const oldManagerId = coffee.getManager(message.user);
        coffee.setManager(message.user, null);
        if (oldManagerId) {
          convo.say(`<@${oldManagerId}> is not your manager any more`);
        } else {
          convo.say(`You didn't have a manager set`);
        }
      } else {
        const managerId = coffee.getManager(message.user);
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
    bot.createConversation(message, function(err, convo) {
      const data = storage.loadData();

      if (user.checkForUser(message.user, data)) {
        convo.say('You are all set! Use `unsubscribe` to stop pairing.');
        const managerId = coffee.getManager(message.user);
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
    bot.createConversation(message, function(err, convo) {
      //Right now let's trigger the pairing by sending the bot a message with "coffeetime"
      // @TODO limit to certain users MVP
      // @TODO auto-schedule BACKLOG
      const { userData, pairs } = coffee.runCoffeeTime();
      convo.say('We just ran coffeetime and generated a pair of users, lets message them all');
      //OK now we need to message all the users
      
      const userById = id => userData.filter(user => user.slackId === id)[0];
      
      let messages = [];
      pairs.forEach(pair => {
        let users = pair.map(userById);
        console.log(users);
        users.forEach(user => {
          let others = users.filter(u => u.slackId !== user.slackId);
          console.log('others', others);
          let message;
          if (others.length === 1) {
            message = `Hey <@${user.slackId}>, this week your coffee time is with <@${others[0].slackId}>.`;
          } else if (others.length === 2) {
            message = `Hey <@${user.slackId}>, this week your coffee time is with <@${others[0].slackId}> *and* <@${others[1].slackId}>! Fancy.`;            
          } else {
            console.warn("oh no, this probably shouldn't have happened");
          }
          if (message) {
            messages.push({ user: user.slackId, text: message });
          }
        })
      });
      
      console.log('messages', message);

      // @TODO you'll need to go through the pairs and message each of the people with their pairing
      // the message should tell them name of the person they are paired with
      // I think bot.api.im.open will work
      // https://github.com/howdyai/botkit/issues/89
      // https://api.slack.com/methods/im.open
      messages.forEach(message => {
        bot.api.im.open(
          {
            user: message.user,
          },
          (error, response) => {
            console.log(response);
            bot.startConversation(
              {
                user: message.user,
                channel: response.channel.id,
              },
              (err, convo) => {
                convo.say(message.text);
              },
            );
          },
        );
      });
      // @TODO generate and send the messages! Write copy (include triplets!), and iterate
      // through people and send them messages.
      // sendAssignments(bot, pairs).catch(...)
    });
  });

  controller.hears(['^subscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //ok here is how to get user info
      // we'll need this to get everyone's name and slack ID
      bot.api.users.info({ user: message.event.user }, (error, response) => {
        // console.log(response.user);
        let status = user.subscribeUser(response.user);
        if (status === true) {
          //@TODO add them to coffeetime.json as subscribed BACKLOG
          convo.say('Hi! Welcome to coffeetime.');
          convo.activate();
        } else {
          convo.say('Hi! We tried to add you but looks like you were already subscribed. Contact the Coffeetime team if you are not getting paired.');
          convo.activate();
        }
      });
    });
  });

  controller.hears(['^unsubscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      bot.api.users.info({ user: message.event.user }, (error, response) => {
        // console.log(response.user);
        user.unsubscribeUser(response.user.id);
      });

      //@TODO add them to coffeetime.json as unsubscribed BACKLOG
      convo.say('enjoy your break from coffeetime');
      convo.activate();
    });
  });
  
  controller.on('slash_command', function(bot, message){
    // TODO - add slash commands via slack admin interface
  });
};


