/*

The coffeetime bot code goes here

*/
const coffee = require('../coffee');

module.exports = function(controller) {
  
  controller.hears(['^userList'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //this is a temporary command to get a list of users from a slack 
      // @TODO run this and manually populate coffee.json MVP
      // we'll test this on the coffeetime slack from this step to the coffeetime command before installing on the fogcreek one
      // @TODO remove this and automate subscribe process BACKLOG
      
      // @TODO return list of users via https://api.slack.com/methods/users.list bot.api.users.list
      convo.say('Here is a user list');
      convo.activate();

    });
  });
  controller.hears(['^coffeetimerun'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      //Right now let's trigger the pairing by sending the bot a message with "coffeetime"
      // @TODO limit to certain users MVP
      // @TODO auto-schedule BACKLOG
      coffee.runCoffeeTime();
      convo.say('We just ran coffeetime and generated a pair of users, lets message them all');
      //OK now we need to message all the users
      const coffeeTimeData = coffee.loadData();
      const { userData } = coffeeTimeData;
      const { pairs } = coffeeTimeData;

      // @TODO you'll need to go through the pairs and message each of the people with their pairing
      // the message should tell them name of the person they are paired with
      // I think bot.api.im.open will work
      // https://github.com/howdyai/botkit/issues/89
      // https://api.slack.com/methods/im.open
      convo.activate();

      // sendAssignments(pairs)
      
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


// let's throttle some requests
//https://gist.github.com/daliborgogic/7ee40bcff586ae08b33bf929172d61e8
const timeout = ms => new Promise(res => setTimeout(res, ms));
const timeoutValue = 1000;
function convinceMe(convince) {
  let unixTime = Math.round(+new Date() / 1000);
  console.log(`Delay ${convince} at ${unixTime}`);
}

//    await timeout(timeoutValue);
