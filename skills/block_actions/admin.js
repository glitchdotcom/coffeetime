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

async function onExitHelp(bot, message) {
  const blocks = [
    blocksBuilder.section('Bye! Open the admin console again via `/coffeetime admin`.'),
  ];
  bot.replyInteractive(message, { blocks });
}