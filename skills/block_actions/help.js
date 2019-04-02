const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const sharedConvo = require('./shared/convo');
const { help, blocksBuilder } = require('./shared/util');


module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {     
      switch(action.value) {
        case help.SHOW_HELP_MENU:
          showHelpMenu(bot, message);
          break;
        case help.WHAT_IS_THIS_VALUE:
          onWhatIsCoffeeTime(bot, message);
        break;
        case help.WHO_IS_MY_BUDDY_VALUE:
          onWhoIsMyCoffeeBuddy(bot, message);
        break;
          case help.MY_PROFILE_VALUE:
          onMyProfile(bot, message);
        break;
      }
    }
  });
  
  controller.hears(['^help'], 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, getHelpMenuBlocks());
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

function backToMenuButton() {
  return blocksBuilder.actions(
      blocksBuilder.button("Back", help.SHOW_HELP_MENU),
  );
}

function getHelpMenuBlocks() {
  return { blocks: [
    blocksBuilder.section("Hello and welcome to CoffeeTime! ✨ How can I help you?"),
    blocksBuilder.section("*Basics*"),
    blocksBuilder.actions(
      blocksBuilder.button("What's CoffeeTime?", help.WHAT_IS_THIS_VALUE),
    ),
    blocksBuilder.section("*Manage subscription*"),
    blocksBuilder.actions(
      blocksBuilder.button("My Coffee Buddy", help.WHO_IS_MY_BUDDY_VALUE),
      blocksBuilder.button('My Profile', help.MY_PROFILE_VALUE),
    ),
    blocksBuilder.divider()
  ] }
}

function showHelpMenu(bot, message) {
  bot.replyInteractive(message, getHelpMenuBlocks());
}

function onWhatIsCoffeeTime(bot, message) {
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*What is CoffeeTime*'),
    blocksBuilder.section(
      ...sharedConvo.defineCoffeeTimeDialogue()
    ),
    backToMenuButton() 
  ];
  bot.replyInteractive(message, { blocks });
}

function onWhoIsMyCoffeeBuddy(bot, message) {
  const userInfo = user.getUserInfo(message.user);
    
  const textToSay = ((userInfo) => {
    if (!userInfo.isSubscribed) {
      return 'You are not subscribed to CoffeeTime.';
    }
    if (!userInfo.coffeePartners || userInfo.coffeePartners.length === 0) {
      // TODO: Change Monday to a variable
      return "You haven't been matched with a partner yet. Check back Monday around 9am!";
    }
    // You have subscribed and you have a coffee partner
    return 'This week, you are paired with ' + coffee.slackPrintGroup(userInfo.coffeePartners) + '. ' +
        'Find time this week to get coffee together!';
  })(userInfo);
  
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Your Coffee Buddy*'),
    blocksBuilder.section(textToSay),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}

function onMyProfile(bot, message) {
  const userInfo = user.getUserInfo(message.user);
  const slackIdFormatted = coffee.idToString(message.user);
  
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Your Profile*'),
    blocksBuilder.section(`Hi ${slackIdFormatted}!`),
    blocksBuilder.section(
      '> • You are currently *' + (userInfo.isSubscribed ? '' : 'not ') + 'subscribed* to CoffeeTime. \n' + 
      '> • Your manager is set to ' +
      (userInfo.managerSlackId ? coffee.idToString(userInfo.managerSlackId) : '*none*') + '\n' + 
      '> • This week, you are paired with ' + coffee.slackPrintGroup(userInfo.coffeePartners)
    ),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}