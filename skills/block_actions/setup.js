const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');
const { setup } = require('./util');


module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    console.log('block actions');
  });

    // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    console.log('block actions2');
  });

  
  
  controller.hears('interactive', 'direct_message', function(bot, message) {
    console.log(message.user);
    const content = {
        blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Would you like to set up CoffeeTime for your team?"
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Yes! 💫",
                "emoji": true
              },
              "value": setup.YES_INSTALL_VALUE
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Not right now",
                "emoji": true
              },
              "value": setup.NO_INSTALL_VALUE
            }
          ]
        }
      ]
    };
    bot.api.im.open({ user: message.user }, (error, response) => {
      bot.api.chat.postMessage({
        channel: response.channel.id,
        text: 'hiiiii',
        ...content
      });
    });
  //  bot.reply(message, content);
     
  });
};
