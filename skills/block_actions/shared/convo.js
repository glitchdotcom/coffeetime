const coffee = require('./../../../util/coffee');
const user = require('./../../../util/user');

const { admin, setup, help, blocksBuilder } = require('./util');

module.exports.startAdminSetupConversation = function(bot, user) {
  const blocks = [
      blocksBuilder.section('Welcome to CoffeeTime!'),
      blocksBuilder.section(...module.exports.defineCoffeeTimeDialogue()),
      blocksBuilder.section(
        'Would you like to set up CoffeeTime for your team?'),
      blocksBuilder.actions(
        blocksBuilder.button('Yes! 💫', setup.YES_INSTALL_VALUE),
        blocksBuilder.button('Not right now', setup.NO_INSTALL_VALUE)
      )
    ];
    bot.api.im.open({ user }, (error, response) => {
      bot.api.chat.postMessage({
        channel: response.channel.id,
        blocks
      });
    }); 
};

module.exports.defineCoffeeTimeDialogue = function() {
  return [
    '> *CoffeeTime* is an app that lets you schedule coffee other people in your Slack.',
    "> • Every week, I'll choose a coffee partner for you from the pool of CoffeeTime subscribers in your office.",
    "> • I'll send you and your partner a message, telling you to find time to get coffee together.",
    "> • You can change your participation in CoffeeTime with `/coffeetime subscribe` or `/coffeetime unsubscribe`."
  ];
};

module.exports.userSubscribedDialogue = function(isNewlySubscribed, userInfo) {
  if (!userInfo.isSubscribed) {
    return ["Darn, something weird happened and you aren't subscribed.",
            "Contact the CoffeeTime team? Sorry!!"];
  }
  if (isNewlySubscribed) {
    // TODO: Update to be possibly not Monday. 
    return ["Yay!! You've subscribed to CoffeeTime! ✨ ",
            "I'll message you with you coffee buddy on *Monday*."];
  }
  
  const dialogue = [
    "You're already subscribed to CoffeeTime!"
  ];
  if (!userInfo.coffeePartners || userInfo.coffeePartners.length === 0) {
    // TODO: Change Monday to a variable
    dialogue.push("You haven't been matched with a partner yet. Check back Monday around 9am!");
  } else {
    dialogue.push('This week you are getting coffee with ' + user.slackPrintGroup(userInfo.coffeePartners) + '.');
    dialogue.push("Reach out to them if you haven't already!");
  }
  return dialogue;
};

module.exports.userUnsubscribedDialogue = function(isAlreadyUnsubscribed) {
  if (isAlreadyUnsubscribed) {
    return ["You are already unsubscribed from CoffeeTime."];
  }
  return ["Enjoy your break from CoffeeTime!",
      "You can always come back via `/coffeetime subscribe`."];
};


module.exports.getHelpMenuBlocks = function(slackId) {
  return { blocks: [
    blocksBuilder.section('Hello and welcome to the CoffeeTime help menu! ✨How may I help you?'),
    blocksBuilder.section("*Basics*"),
    blocksBuilder.actions(
      blocksBuilder.button("What's CoffeeTime?", help.WHAT_IS_THIS_VALUE),
      blocksBuilder.button("Commands", help.WHAT_ARE_COMMANDS_VALUE),
    ),
    blocksBuilder.section("*Manage subscription*"),
    blocksBuilder.actions(
      getSubscribeToggleButton(slackId),
      blocksBuilder.button("Set Manager", help.SET_MANAGER_MENU_VALUE),
    ),
    blocksBuilder.section("*Your info*"),
    blocksBuilder.actions(
      blocksBuilder.button("Your Coffee Buddy", help.WHO_IS_MY_BUDDY_VALUE),
      blocksBuilder.button('Your Profile', help.MY_PROFILE_VALUE),
    ),
    blocksBuilder.divider(),
    blocksBuilder.actions(
      blocksBuilder.button("Exit", help.EXIT_MENU_VALUE),
    )
  ] };
}

function getSubscribeToggleButton(slackId) {
  const userInfo = user.getUserInfo(slackId);
  const buttonText = userInfo.isSubscribed ? 'Unsubscribe' : 'Subscribe';
  const buttonValue = userInfo.isSubscribed ? help.UNSUBSCRIBE_ME_VALUE : help.SUBSCRIBE_ME_VALUE;
  return blocksBuilder.button(buttonText, buttonValue);
}

module.exports.getAdminMenuBlocks = function() {
  return { blocks: [
    blocksBuilder.section(
      'This is the *admin* console for CoffeeTime. ⌨️',
      'Here you can modify CoffeeTime settings for everyone.'),
    blocksBuilder.section("*Subscriber info*"),
    blocksBuilder.actions(
      blocksBuilder.button("View all subscribed", admin.SHOW_ALL_SUBSCRIBED),
      blocksBuilder.button('View all unsubscribed', admin.SHOW_ALL_UNSUBSCRIBED),
    ),
    blocksBuilder.section("*Add/remove users*"),
    blocksBuilder.actions(
      blocksBuilder.button("Subscribe a person", admin.SUBSCRIBE_USER),
      blocksBuilder.button('Unsubscribe a person', admin.UNSUBSCRIBE_USER),
      blocksBuilder.button("Subscribe everyone", admin.SUBSCRIBE_EVERYONE),
    ),
    blocksBuilder.section("*Scheduling CoffeeTime*"),
    blocksBuilder.actions(
      blocksBuilder.button("View CoffeeTime schedule", admin.SEE_SCHEDULE_VALUE),
      blocksBuilder.button("Set schedule", admin.SET_SCHEDULE_VALUE),
      blocksBuilder.button('Run CoffeeTime now', admin.RUN_COFFFEETIME_NOW),
    ),
    blocksBuilder.divider(),
    blocksBuilder.actions(
      blocksBuilder.button("Exit", admin.EXIT_MENU_VALUE),
    )
  ] };
}

module.exports.getRunCoffeetimeBlocks = function() {
  return { blocks: [
    blocksBuilder.divider(),
     blocksBuilder.section('*Run CoffeeTime*'),
    blocksBuilder.section(
      "CoffeeTime is currently set to run again next *Monday*, at *10am ET*."
    ),
    blocksBuilder.section(
      "Are you sure you want to force it to run now? This will create and message all new pairings!"
    ),
    blocksBuilder.actions(
      blocksBuilder.button('Yes!', admin.RUN_COFFFEETIME_NOW_CONFIRM),
      blocksBuilder.button('Cancel', admin.SHOW_MENU_VALUE),
      blocksBuilder.button('Exit', admin.EXIT_MENU_VALUE),
    )
  ] };
}
