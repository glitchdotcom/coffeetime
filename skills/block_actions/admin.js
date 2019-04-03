const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const sharedConvo = require('./shared/convo');
const { admin, blocksBuilder, DELIMITER } = require('./shared/util');


module.exports = function(controller) {
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {   
      
      if (action.value) {
        const [actionName, actionValue] = action.value.split(DELIMITER);
      
        switch(actionName) {
          case admin.SHOW_MENU_VALUE:
            showAdminMenu(bot, message);
            break;
          case admin.EXIT_MENU_VALUE:
            onExitHelp(bot, message);
            break;
          case admin.SHOW_ALL_SUBSCRIBED:
            onViewAllSubscribed(bot, message);
            break;
          case admin.SHOW_ALL_UNSUBSCRIBED:
            onViewAllUnsubscribed(bot, message);
            break;
          case admin.SUBSCRIBE_USER:
            onSubscribeUser(bot, message);
            break;
          case admin.ADD_USER_CONFIRM_VALUE:
            onSubscribeUserConfirmed(bot, message, actionValue);
            break;
        }
      }
      
      switch(action.action_id) {
        case admin.SELECT_SUBSCRIBER_ACTION_ID:
          onSubscribeUserSelected(bot, message, action.selected_user);
          break;
      }
    }
  });
};

function backToMenuButton() {
  return blocksBuilder.actions(
    blocksBuilder.button("Back", admin.SHOW_MENU_VALUE),
    blocksBuilder.button("Exit", admin.EXIT_MENU_VALUE),
  );
}

function showAdminMenu(bot, message) {
  bot.replyInteractive(message, sharedConvo.getAdminMenuBlocks());
}

function onExitHelp(bot, message) {
  const blocks = [
    blocksBuilder.section('Bye! Open the admin console again via `/coffeetime admin`.'),
  ];
  bot.replyInteractive(message, { blocks });
}

async function onViewAllSubscribed(bot, message) {
  const allMembers = await user.getAllUsersInSlack(bot);
  const data = storage.loadData();
  const allSlackIdsInWorkspace = allMembers.map(m => m.id);
  const allSubscriberIdsFormatted = allSlackIdsInWorkspace
      .filter(m => user.isUserInDatabase(m, data))
      .map(user.idToString);
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*View Subscribers*'),
    blocksBuilder.section('Here are all the users registered to CoffeeTime:'),
    blocksBuilder.section(
      '> ' + allSubscriberIdsFormatted .join(', ')
    ),
    backToMenuButton()
  ];
  
  bot.replyInteractive(message, { blocks });
}

async function onViewAllUnsubscribed(bot, message) {
  const allMembers = await user.getAllUsersInSlack(bot);
  const data = storage.loadData();
  const allSlackIdsInWorkspace = allMembers.map(m => m.id);
  const allNonSubscriberIdsFormatted = allSlackIdsInWorkspace
      .filter(m => !user.isUserInDatabase(m, data))
      .map(user.idToString);
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*View Unsubscribed*'),
    blocksBuilder.section('Here are all the users *not* registered to CoffeeTime:'),
    blocksBuilder.section(
      '> ' + allNonSubscriberIdsFormatted .join(', ')
    ),
    backToMenuButton()
  ];
  
  bot.replyInteractive(message, { blocks });
}

function onSubscribeUser(bot, message) {
  replyInteractiveSubscribeUser(bot, message);
}

function getUserErrorMessage(startMessage, userSlackId, userSlackInfo) {
  const userType = user.getSlackUserType(userSlackInfo);
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

async function onSubscribeUserSelected(bot, message, selectedUserId) {
  const selectedUserSlackInfo = await user.getSlackUserInfo(bot, selectedUserId);
  const isValidUser = user.isFullSlackUser(selectedUserSlackInfo);

  let errorMessage;
  let validUserId;
  if (!isValidUser) {
    const startMessage = 'You cannot subscribe ' + user.idToString(selectedUserId);
    errorMessage = getUserErrorMessage(startMessage, selectedUserId, selectedUserSlackInfo);
  } else {
    validUserId = selectedUserId;
  }

  replyInteractiveSubscribeUser(bot, message, selectedUserId, errorMessage);
}

async function onSubscribeUserConfirmed(bot, message, selectedUserId) {
  console.log(selectedUserId);
  const selectedSlackUser = await user.getSlackUserInfo(bot, selectedUserId);
  const status = user.subscribeUser(selectedSlackUser);
  console.log(status);
  
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section(
      "*Great!* I've added " + user.idToString(selectedUserId) + ' to CoffeeTime.'
    ),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}

function replyInteractiveSubscribeUser(bot, message, selectedUserId, selectUserErrorMsg) {
  const userInfo = user.getUserInfo(message.user);
  
  const subscribeUserActions = [
      blocksBuilder.userSelect(
        'Choose user to add',
        admin.SELECT_SUBSCRIBER_ACTION_ID, 
        selectedUserId || undefined
    )
  ];
  
  const errorMessageBlocks = [];
  
  if (!selectUserErrorMsg) {
    subscribeUserActions.push(
      blocksBuilder.button(
        'Add',
        // Pack selected user id into the confirmation value....
        admin.ADD_USER_CONFIRM_VALUE + DELIMITER + selectedUserId)
    );
  } else {
    errorMessageBlocks.push(blocksBuilder.context(selectUserErrorMsg));
  } 
  
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Subscribe User*'),
    blocksBuilder.section('Choose a user to add to CoffeeTime'),
    blocksBuilder.actions(...subscribeUserActions),
    ...errorMessageBlocks,
    blocksBuilder.divider(),
    backToMenuButton()
  ];

  bot.replyInteractive(message, { blocks });
}

async function onUnsubscribeUserSelected(bot, message, selectedUserId) {
  const selectedUserSlackInfo = await user.getSlackUserInfo(bot, selectedUserId);
  const isValidUser = user.isFullSlackUser(selectedUserSlackInfo);

  let errorMessage;
  let validUserId;
  if (!isValidUser) {
    const startMessage = 'You cannot unsubscribe ' + user.idToString(selectedUserId);
    errorMessage = getUserErrorMessage(startMessage, selectedUserId, selectedUserSlackInfo);
  } else {
    validUserId = selectedUserId;
  }

  replyInteractiveUnsubscribeUser(bot, message, selectedUserId, errorMessage);
}

async function onUnsubscribeUserConfirmed(bot, message, selectedUserId) {
  console.log(selectedUserId);
  const selectedSlackUser = await user.getSlackUserInfo(bot, selectedUserId);
  const status = user.subscribeUser(selectedSlackUser);
  console.log(status);
  
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section(
      "I've unsubscribed " + user.idToString(selectedUserId) + ' from CoffeeTime.'
    ),
    backToMenuButton()
  ];
  bot.replyInteractive(message, { blocks });
}

function replyInteractiveSubscribeUser(bot, message, selectedUserId, selectUserErrorMsg) {
  const userInfo = user.getUserInfo(message.user);
  
  const subscribeUserActions = [
      blocksBuilder.userSelect(
        'Choose user to add',
        admin.SELECT_SUBSCRIBER_ACTION_ID, 
        selectedUserId || undefined
    )
  ];
  
  const errorMessageBlocks = [];
  
  if (!selectUserErrorMsg) {
    subscribeUserActions.push(
      blocksBuilder.button(
        'Add',
        // Pack selected user id into the confirmation value....
        admin.ADD_USER_CONFIRM_VALUE + DELIMITER + selectedUserId)
    );
  } else {
    errorMessageBlocks.push(blocksBuilder.context(selectUserErrorMsg));
  } 
  
  const blocks = [
    blocksBuilder.divider(),
    blocksBuilder.section('*Subscribe User*'),
    blocksBuilder.section('Choose a user to add to CoffeeTime'),
    blocksBuilder.actions(...subscribeUserActions),
    ...errorMessageBlocks,
    blocksBuilder.divider(),
    backToMenuButton()
  ];

  bot.replyInteractive(message, { blocks });
}