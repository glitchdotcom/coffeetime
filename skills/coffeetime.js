/*

The coffeetime bot code goes here

*/
const coffee = require('../coffee');

module.exports = function(controller) {
  controller.hears(['^coffeetimerun'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //Right now let's trigger the pairing by sending the bot a message with "coffeetime"
      // @TODO limit to certain users MVP
      // @TODO auto-schedule BACKLOG
      const { userData, pairs } = coffee.runCoffeeTime();
      convo.say('We just ran coffeetime and generated a pair of users, lets message them all');
      //OK now we need to message all the users
      //const coffeeTimeData = coffee.loadData();
      //const { userData } = coffeeTimeData;
      // const { pairs } = coffeeTimeData;
      
      

      // @TODO you'll need to go through the pairs and message each of the people with their pairing
      // the message should tell them name of the person they are paired with
      // I think bot.api.im.open will work
      // https://github.com/howdyai/botkit/issues/89
      // https://api.slack.com/methods/im.open
      convo.activate();
      bot.api.im.open(
        {
          user: 'UGSMK7XCZ',
        },
        (error, response) => {
          console.log(response);
          bot.startConversation(
            {
              user: 'UGSMK7XCZ',
              channel: response.channel.id,
            },
            (err, convo) => {
              convo.say('This is the coffetime');
            },
          );
        },
      );
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
        coffee.addUser(response.user);
      });
      //@TODO add them to coffeetime.json as subscribed BACKLOG
      convo.say('Hi! Welcome to coffeetime.');
      convo.activate();
    });
  });

  controller.hears(['^unsubscribe'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //ok here is how to get user info
      // we'll need this to get everyone's name and slack ID
      bot.api.users.info({ user: message.event.user }, (error, response) => {
        // console.log(response.user);
        coffee.removeUser(response.user.id);
      });
      //@TODO add them to coffeetime.json as unsubscribed BACKLOG
      convo.say('enjoy your break from coffeetime');
      convo.activate();
    });
  });
};
