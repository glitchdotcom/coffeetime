const coffee = require('../../util/coffee');
const user = require('../../util/user');
const storage = require('../../util/storage');

module.exports = function(controller) {
  
  // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    console.log('block actions');
  });

    // receive an interactive message, and reply with a message that will replace the original
  controller.on('block_actions', function(bot, message) {
    console.log('block actions2');
  });

};
