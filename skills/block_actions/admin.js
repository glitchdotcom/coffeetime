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