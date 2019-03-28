const storage = require('./storage');

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

module.exports.unsubscribeUser = function(slackId) {
  const data = storage.loadData();
  for (let i = 0; i < data.userData.length; i++) {
    let user = data.userData[i];
    if (user.slackId === slackId) {
      data.userData.splice(i, 1);
      break;
    }
  }
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