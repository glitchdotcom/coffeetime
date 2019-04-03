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
        case help.SUBSCRIBE_ME_VALUE:
          onSubscribeMe(bot, message);
          break;
        case help.UNSUBSCRIBE_ME_VALUE:
          onUnsubscribeMe(bot, message);
          break;
        case help.EXIT_MENU_VALUE:
          onExitHelp(bot, message);
          break;
        case help.WHAT_ARE_COMMANDS_VALUE:
          onWhatAreCommands(bot, message);
          break;
        case help.SET_MANAGER_MENU_VALUE:
          onSetManagerMenuValue(bot, message);
          break;
        case help.UNSELECT_MANAGER_VALUE:
          onUnselectManager(bot, message);
          break;
      }
      
      switch(action.action_id) {
        case help.SELECT_MANAGER_ACTION_ID:
          onSetManagerSelected(bot, message, action.selected_user);
          break;
      }
    }
  });
  
  controller.hears(['^help'], 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, sharedConvo.getHelpMenuBlocks(message.event.user));
  });
  
  controller.hears(['^oldhelp'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      const data = storage.loadData();

      if (user.isUserInDatabase(message.user, data)) {
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
    blocksBuilder.button("Exit", help.EXIT_MENU_VALUE),
  );
}

function onUnsubscribeMe(bot, message) {
  const userInfo = user.getUserInfo(message.user);
  const isAlreadyUnsubscribed = !userInfo.isSubscribed;
  if (!isAlreadyUnsubscribed) {
    user.unsubscribeUser(message.user);
  }
  const dialogue = sharedConvo.userUnsubscribedDialogue(isAlreadyUnsubscribed);
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Unsubscribe*'),
    blocksBuilder.section(...dialogue),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}

async function onSubscribeMe(bot, message) {
  const slackUser = await user.getSlackUserInfo(bot, message.user);
  const isNewlySubscribed = user.subscribeUser(slackUser);
  const userInfo = user.getUserInfo(message.user);
  const dialogue = sharedConvo.userSubscribedDialogue(isNewlySubscribed, userInfo);
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Subscribe*'),
    blocksBuilder.section(...dialogue),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}

function getManagerErrorMessage(userSlackId, managerSlackId, managerSlackInfo) {
  const startMessage = user.idToString(managerSlackId) + 'is not a valid manager';
  if (userSlackId === managerSlackId) {
    return startMessage + " because you can't be your own manager.";
  }
  const userType = user.getSlackUserType(managerSlackInfo);
  switch(userType) {
    case user.TYPE.IS_SLACKBOT: 
      return startMessage + ' because they are Slackbot.';
    case user.TYPE.IS_DELETED: 
      return startMessage + ' because they are deleted.';
    case user.TYPE.IS_A_BOT: 
      return startMessage + ' because they are a bot.';
    case user.TYPE.NOT_FULL_MEMBER: 
      return startMessage + ' because they are not a full member.';
  }
  return startMessage + '.'; 
}

async function onSetManagerSelected(bot, message, managerSlackId) {
  const userSlackId = message.user;
  const managerSlackInfo = await user.getSlackUserInfo(bot, managerSlackId);
  const isValidManager = user.isFullSlackUser(managerSlackInfo) && managerSlackId != userSlackId;
  
  let managerErrorMsg;
  if (isValidManager) {
    user.setManager(userSlackId, managerSlackId);
  } else {
    managerErrorMsg = getManagerErrorMessage(userSlackId, managerSlackId, managerSlackInfo);
  }
  
  replyInteractiveWithManagerMenu(bot, message, managerErrorMsg);
}

function onUnselectManager(bot, message) {
  user.setManager(message.user, null);
  replyInteractiveWithManagerMenu(bot, message);
}

function onSetManagerMenuValue(bot, message) {
  replyInteractiveWithManagerMenu(bot, message);
}

function replyInteractiveWithManagerMenu(bot, message, setManagerErrorMsg) {
  const userInfo = user.getUserInfo(message.user);
  
  const managerMessage = userInfo.managerSlackId ?
        'Your manager is currently set to ' + user.idToString(userInfo.managerSlackId) :
        "You don't currently have a manager set. Set one now:"
  
  const setManagerBlocks = [
    blocksBuilder.section('*Set Manager*'),
    blocksBuilder.section(managerMessage),
    blocksBuilder.actions(
      blocksBuilder.userSelect(
        'Select your manager',
        help.SELECT_MANAGER_ACTION_ID,
        userInfo.managerSlackId || undefined)
    )
  ];
  if (setManagerErrorMsg) {
    setManagerBlocks.push(blocksBuilder.context(setManagerErrorMsg));
  }
  
  const removeManagerBlocks = userInfo.managerSlackId ? [
    blocksBuilder.section('*Remove Manager*'),
    blocksBuilder.actions(
      blocksBuilder.button('Unset manager', help.UNSELECT_MANAGER_VALUE)
    ),
  ] : [];
  
  const blocks = [
    blocksBuilder.divider(),
    ...setManagerBlocks,
    ...removeManagerBlocks,
    blocksBuilder.divider(),
    backToMenuButton()
  ];

  bot.replyInteractive(message, { blocks });
}


function showHelpMenu(bot, message) {
  bot.replyInteractive(message, sharedConvo.getHelpMenuBlocks(message.user));
}

function onWhatIsCoffeeTime(bot, message) {
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*What is CoffeeTime?*'),
    blocksBuilder.section(
      ...sharedConvo.defineCoffeeTimeDialogue()
    ),
    backToMenuButton() 
  ];
  bot.replyInteractive(message, { blocks });
}

function onWhatAreCommands(bot, message) {
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*CoffeeTime Commands*'),
    blocksBuilder.section(
      ' • `/coffeetime subscribe` adds you to CoffeeTime',
      ' • `/coffeetime unsubscribe` removes you from CoffeeTime',
      ' • `/coffeetime` brings up this help menu',
    ),
    blocksBuilder.divider(),
    blocksBuilder.section(
      ' • `/coffeetime admin` brings up the admin menu',
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
    return 'This week, you are paired with ' + user.slackPrintGroup(userInfo.coffeePartners) + '. ' +
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
  const slackIdFormatted = user.idToString(message.user);
  
  const pairingMessage = (userInfo.isSubscribed && userInfo.coffeePartners) ?
    ('> • This week, you are paired with ' + user.slackPrintGroup(userInfo.coffeePartners)) : '';
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Your Profile*'),
    blocksBuilder.section(`Hi ${slackIdFormatted}!`),
    blocksBuilder.section(
      '> • You are currently *' + (userInfo.isSubscribed ? '' : 'not ') + 'subscribed* to CoffeeTime. \n' + 
      '> • Your manager is set to ' +
      (userInfo.managerSlackId ? user.idToString(userInfo.managerSlackId) : '*none*') + '\n' + 
      pairingMessage
    ),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}

async function onExitHelp(bot, message) {
  const blocks = [
    blocksBuilder.section('See you later! Summon me anytime with `/coffeetime`.'),
  ];
  bot.replyInteractive(message, { blocks });
}