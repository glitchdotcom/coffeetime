const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const sharedConvo = require('./shared/convo');
const { setup, blocksBuilder } = require('./shared/util');

module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {     
      switch(action.value) {
        case setup.YES_INSTALL_VALUE:
          onYesInstallFlow(bot, message);
          break;
        case setup.YES_INSTALL_MENU_VALUE:
          onYesInstallMenuShortened(bot, message);
          break;
        case setup.NO_INSTALL_VALUE:
        case setup.CANCEL_VALUE:
          onCancelSetup(bot, message);
          break;
          
        // Subscribing
        case setup.HELP_VALUE:
          onSubscribeHelp(bot, message);
          break;
        case setup.ALL_CONFIRMED_VALUE:          
          onSubscribeAllConfirmed(bot, message);
          break;
        case setup.ALL_VALUE:
          onSubscribeAll(bot, message);
          break;
        case setup.ME_VALUE:
          onSubscribeJustMe(bot, message);
          break;
        case setup.NOBODY_VALUE:
          onSubscribeNobodyForNow(bot, message);
          break;
      }
    }
  });
  
  controller.hears('adminsetup', 'direct_message', function(bot, message) {
     sharedConvo.startAdminSetupConversation(bot, message.user);
  });
};

function subscribeActions() {
  return blocksBuilder.actions(
    blocksBuilder.button('Everyone!', setup.ALL_VALUE),
    blocksBuilder.button('Just me', setup.ME_VALUE),
    blocksBuilder.button('No one for now', setup.NOBODY_VALUE),
    blocksBuilder.button('Can you tell me more?', setup.HELP_VALUE),
    blocksBuilder.button('Exit', setup.CANCEL_VALUE),
  );
}

function onYesInstallFlow(bot, message) {
  const blocks = [
    blocksBuilder.section("*Fantastic!*"), 
    // TODO: Uncomment when we have more than one question.
    // blocksBuilder.section("I'll now ask you a series of questions to get your team set up."),
    blocksBuilder.section('Who should I enroll in CoffeeTime?'),
    subscribeActions()
  ];
  bot.replyInteractive(message, { blocks });
}

function onYesInstallMenuShortened(bot, message) {
  const blocks = [
    blocksBuilder.section('Who should I enroll in CoffeeTime?'),
    subscribeActions()
  ];
  bot.replyInteractive(message, { blocks });
}

function onCancelSetup(bot, message) {
  bot.replyInteractive(message, {
    text: 'OK, no problem! ' + getEndOfSetupDialogue()
  });
}

function getEndOfSetupDialogue() {
  return 'Summon me anytime with `/coffeetime`.'
}

function onSubscribeHelp(bot, message) {
  const blocks = [
    blocksBuilder.section(
      '*Sure!*',
      ...sharedConvo.defineCoffeeTimeDialogue()
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
  const allMembers = await user.getAllUsersInSlack(bot);
  const allSlackIdsFormatted = allMembers
            .map(m => m.id)
            .map(user.idToString);
    
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
      blocksBuilder.button('Looks good!', setup.ALL_CONFIRMED_VALUE),
      blocksBuilder.button('Oh hmm, not quite', setup.YES_INSTALL_MENU_VALUE),
      blocksBuilder.button('Exit', setup.CANCEL_VALUE),
    )
  ];
  bot.replyInteractive(message, { blocks });
}

function onSubscribeNobodyForNow(bot, message) {
  const blocks = [
    blocksBuilder.section(
      "OK, you can sign up at any time via `/coffeetime subscribe`."),
    blocksBuilder.section(
      "Tell your teammates to sign up for CoffeeTime as well!",
    ),
    blocksBuilder.section('Thanks for setting up CoffeeTime. ' + getEndOfSetupDialogue())
  ];
  bot.replyInteractive(message, { blocks });

}

async function onSubscribeJustMe(bot, message) {
  console.log(message);
  const slackUser = await user.getSlackUserInfo(bot, message.user);
  const status = user.subscribeUser(slackUser);
  const blocks = [
    blocksBuilder.section(
      "*Great!* I've signed you up for CoffeeTime.",
      "Tell your teammates to sign up for CoffeeTime as well via `/coffeetime subscribe`!",
    ),
    blocksBuilder.section('Thanks for setting up CoffeeTime. ' + getEndOfSetupDialogue())
  ];
  bot.replyInteractive(message, { blocks });
}

async function onSubscribeAllConfirmed(bot, message) {
  // Add all users to CoffeeTime.
  const allMembers = await user.getAllUsersInSlack(bot);
  console.log(allMembers);
  user.subscribeUsers(allMembers);
  finishInstallSuccess(bot, message);
}

function finishInstallSuccess(bot, message) {
  const blocks = [
    blocksBuilder.section(
      "*You're all set!* Thanks for setting up CoffeeTime.", 
    ),
    blocksBuilder.section(getEndOfSetupDialogue())
  ];
  bot.replyInteractive(message, { blocks });
}
