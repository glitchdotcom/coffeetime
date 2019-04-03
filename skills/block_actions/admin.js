const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const sharedConvo = require('./shared/convo');
const { admin, blocksBuilder } = require('./shared/util');


module.exports = function(controller) {
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    for (const action of message.actions) {     
      switch(action.value) {
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
          onSubscribeUserConfirmed(bot, message);
          break;
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

function getSubscribeUserErrorMessage(userSlackId, userSlackInfo) {
  const startMessage = 'You cannot subscribe ' + user.idToString(userSlackId);
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
    errorMessage = getSubscribeUserErrorMessage(selectedUserId, selectedUserSlackInfo);
  } else {
    validUserId = selectedUserId;
  }

  replyInteractiveSubscribeUser(bot, message, selectedUserId, errorMessage);
}

function onSubscribeUserConfirmed(bot, message) {
  console.log(message);
}


function replyInteractiveSubscribeUser(bot, message, selectedUserId, selectUserErrorMsg) {
  const userInfo = user.getUserInfo(message.user);
  
  console.log('here!');
  const subscribeUserActions = [
      blocksBuilder.userSelect(
        'Choose user to add',
        admin.SELECT_SUBSCRIBER_ACTION_ID, 
        undefined,
        blocksBuilder.userSelectConfirm('Confirm add user', 'Are you sure you want to subscribe this user?')
    )
  ];
  
  const errorMessageBlocks = [];
  
  if (selectUserErrorMsg) {
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