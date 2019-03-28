const storage = require('./storage');

module.exports.getSlackUserInfo = async function(bot, messageSender) {
  return new Promise((resolve, reject) => {
    bot.api.users.info({ user: messageSender }, (error, response) => {
      if (!response || !response.user) {
        reject(error);
      } else {
        resolve(response.user);
      }
    });
  });
}

module.exports.subscribeUser = function(slackUser) {
  let data = storage.loadData();
  if (checkForUser(slackUser.id, data)) {
    console.warn(`not adding user ${slackUser.id} twice!`);
    return false;
  }
  console.log('adding', slackUser.id);
  data = addUserToData(slackUser, data);
  storage.saveData(data);
  return true;
}

module.exports.unsubscribeUser = function(slackUser) {
  const data = storage.loadData();
  for (let i = 0; i < data.userData.length; i++) {
    let user = data.userData[i];
    if (user.slackId === slackUser.id) {
      data.userData.splice(i, 1);
      break;
    }
  }
  //@TODO add them to coffeetime.json as unsubscribed BACKLOG
  storage.saveData(data);
}

function checkForUser(slackId, data) {
  for (let i = 0; i < data.userData.length; i++) {
    if (slackId === data.userData[i].slackId) {
      return true;
    }
  }
  
  return false;
}

function addUserToData(slackUser, data) {
  const userRecord = {
    slackId: slackUser.id,
    name: slackUser.real_name
  };
  data.userData.push(userRecord);
  return data;
}