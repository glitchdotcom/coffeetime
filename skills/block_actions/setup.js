const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const { setup, subscribe, blocksBuilder } = require('./util');


// This is a weird in-memory cache of users ....
// Cached bc async calls don't seem to work in the middle of an interactive interaction.
const userListShenanigans = {};

module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {     
      switch(action.value) {
        case setup.YES_INSTALL_VALUE:
          onYesInstallFlow(bot, message);
          break;
        case setup.NO_INSTALL_VALUE:
        case subscribe.CANCEL_VALUE:
          onCancelSetup(bot, message);
          break;
          
        // Subscribing
        case subscribe.HELP_VALUE:
          onSubscribeHelp(bot, message);
          break;
        
        case subscribe.ALL_VALUE:
          onSubscribeAll(bot, message);
          break;
          
      }
    }
  });
  
  controller.hears('interactive', 'direct_message', function(bot, message) {
     const blocks = [
      blocksBuilder.section('Welcome to CoffeeTime!'),
      blocksBuilder.section(...defineCoffeeTimeDialogue()),
      blocksBuilder.section(
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
        blocksBuilder.button('Just me', subscribe.ME_VALUE),
        blocksBuilder.button('No one for now', subscribe.NOBODY),
        blocksBuilder.button('Can you tell me more?', subscribe.HELP_VALUE),
        blocksBuilder.button('Exit', subscribe.CANCEL_VALUE),
      );
}

function onYesInstallFlow(bot, message) {
  const blocks = [
    blocksBuilder.section("*Fantastic!*"), 
    blocksBuilder.section("I'll now ask you a series of questions to get your team set up."),
    blocksBuilder.section(
      'First, who should I enroll in CoffeeTime?'),
    subscribeActions()
  ];
  bot.replyInteractive(message, { blocks });
}

function onCancelSetup(bot, message) {
  bot.replyInteractive(message, {
    text: 'OK, no problem! Summon me anytime with `/coffeetime`, or reply with `help` to learn more.'
  });
}

function defineCoffeeTimeDialogue() {
  return [
    '> *CoffeeTime* is an app that lets you schedule coffee other people in your Slack.',
    "> • Every week, I'll choose a coffee partner for you from the pool of CoffeeTime subscribers in your office.",
    "> • I'll send you and your partner a message, telling you to find time to get coffee together.",
    "> • You can change your participation in CoffeeTime with `/coffeetime subscribe` or `/coffeetime unsubscribe`."
  ];
}

function onSubscribeHelp(bot, message) {
  const blocks = [
    blocksBuilder.section(
      '*Sure!*',
      ...defineCoffeeTimeDialogue()
    ),
    blocksBuilder.section(
      'So if you click...',
      "- *Everyone*: I'll add all full users in the Slack to CoffeeTime. That means I won't add guests or bots.",
      "- *Just me*: I'll add you to CoffeeTime",
      "- *No one for now*: I won't add anyone to CoffeeTime yet."
    ),
    blocksBuilder.section(
      "Who should I enroll in CoffeeTime?"
    ),
    subscribeActions()
  ];
  bot.replyInteractive(message, { blocks });
}

async function onSubscribeAll(bot, message) {
  /*
  console.log(userListShenanigans, message);
  const allSlackIdsFormatted = 
        userListShenanigans[message.team.id].allMembers
            .map(m => m.id)
            .map(m => `<@${m}>`);
  console.log(allSlackIdsFormatted);
  */
  
   const firstPageOfUsers = await getAllUsersInSlack(bot);
  const allSlackIdsFormatted = firstPageOfUsers.allMembers
            .map(m => m.id)
            .map(m => `<@${m}>`);
    
    
  const blocks = [
    blocksBuilder.section(
      "Awesome! Here's who I'm planning to add to CoffeeTime:",
    ),
    blocksBuilder.section(
      '> ' + allSlackIdsFormatted.join(', ')
    ),
    blocksBuilder.section(
      "Does that look right?"
    ),
    blocksBuilder.actions(
      blocksBuilder.button('Looks good!', subscribe.ALL_CONFIRMED_VALUE),
      blocksBuilder.button('Oh hmm, not quite', subscribe.ME_VALUE),
      blocksBuilder.button('Exit', subscribe.CANCEL_VALUE),
    )
  ];
  console.log('can reply?');
  
  bot.replyInteractive(message, { blocks });
}

function isFullUser(m) {
  // For some reasons, SlackBot is not considered a bot.... so hardcode its exclusion.
  if (m.id === 'USLACKBOT') {
    return false;
  }
  return !m.deleted && !m.is_restricted && !m.is_ultra_restricted && !m.is_bot && !m.is_stranger;
}

async function getAllUsersInSlack(bot, cursor) {
  const args = cursor ? {cursor} : {};
  return new Promise((resolve, reject) => {
    bot.api.users.list(args, (error, response) => {
      const allMembers = response.members.filter(isFullUser);
      resolve({
        allMembers,
        nextCursor: response.response_metadata.next_cursor
      });
    });
  });
}