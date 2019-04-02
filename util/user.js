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
  const data = storage.loadData();
  const isSuccessful = addUserToData(slackUser, data);
  if (isSuccessful) {
    storage.saveData(data);
  }
  return isSuccessful;
}

module.exports.subscribeUsers = function(slackUsers) {
  const data = storage.loadData();
  for (const slackUser of slackUsers) {
    addUserToData(slackUser, data);
  }
  storage.saveData(data);
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
  //@TODO maybe add them to coffeetime.json as unsubscribed BACKLOG
  storage.saveData(data);
}

module.exports.getSlackIdsForAllUsers = function() {
  const data = storage.loadData();
  const { userData } = data;

  const userList = [];
  userData.forEach(function(user) {
    userList.push(user.slackId);
  });
  
  return userList;
}

module.exports.checkForUser = function(slackId, data) {
  for (let i = 0; i < data.userData.length; i++) {
    if (slackId === data.userData[i].slackId) {
      return true;
    }
  }
  return false;
}

module.exports.getUserInfo = function(slackId) {
  const data = storage.loadData();
  const userData = data.userData
  for (let i = 0; i < data.userData.length; i++) {
    if (slackId === data.userData[i].slackId) {
      return true;
    }
  }
  return false;
}

function addUserToData(slackUser, data) {
  console.log('adding', slackUser.id);
  if (module.exports.checkForUser(slackUser.id, data)) {
    console.warn(`not adding user ${slackUser.id} twice!`);
    return false;
  }
  const userRecord = {
    slackId: slackUser.id,
    name: slackUser.real_name
  };
  data.userData.push(userRecord);
  return true;
}

module.exports.setManager = function(slackId, managerSlackId) {
  const data = storage.loadData();
  const user = data.userData.find(u => u.slackId === slackId);
  user.managerSlackId = managerSlackId;
  storage.saveData(data);
}

module.exports.getManager = function(slackId) {
  return getManagerHelper(storage.loadData(), slackId);
}

function getManagerHelper(data, userSlackId) {
  return data.userData.find(u => u.slackId === userSlackId).managerSlackId;
}
