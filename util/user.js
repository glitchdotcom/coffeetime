const storage = require('./storage');

module.exports.getSlackUserInfo = async function(bot, slackId) {
  return new Promise((resolve, reject) => {
    bot.api.users.info({ user: slackId }, (error, response) => {
      if (!response || !response.user) {
        reject(error);
      } else {
        resolve(response.user);
      }
    });
  });
}

module.exports.isFullSlackUser = function(slackUser) {
  // For some reasons, SlackBot is not considered a bot.... so hardcode its exclusion.
  if (slackUser.id === 'USLACKBOT') {
    return false;
  }
  return !slackUser.deleted && !slackUser.is_restricted && !slackUser.is_ultra_restricted && !slackUser.is_bot && !slackUser.is_stranger;
}

module.exports.TYPE = Object.freeze({
    // Someone who is a full member.
  IS_FULL_MEMBER: Symbol('is full member'),

  // The one and only Slackbot.
  IS_SLACKBOT: Symbol('is slackbot'),
  
  // Is a bot (app), but not Slackbot.
  IS_A_BOT: Symbol('is a bot'),
  
  // A non-full member who is not you.
  NOT_FULL_MEMBER: Symbol('not full member'),
  
  // A deleted Slack user.
  IS_DELETED: Symbol('is deleted')
});


module.exports.getSlackUserType = function(slackUser) {
  if (slackUser.id === 'USLACKBOT') {
    return module.exports.TYPE.IS_SLACKBOT;
  }
  if (slackUser.deleted) {
    return module.exports.TYPE.IS_DELETED;
  }
  if (slackUser.is_bot) {
    return module.exports.TYPE.IS_A_BOT;
  }
  if (slackUser.is_restricted || slackUser.is_ultra_restricted || slackUser.is_stranger) {
    return module.exports.TYPE.NOT_FULL_MEMBER;
  }
    return module.exports.TYPE.IS_FULL_MEMBER;
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

module.exports.unsubscribeUser = function(slackId) {
  const data = storage.loadData();
  for (let i = 0; i < data.userData.length; i++) {
    let user = data.userData[i];
    if (user.slackId === slackId) {
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

const userInfoDataTemplate = {
  isSubscribed: false,
  coffeePartners: [],
  managerSlackId: null
};

// Returns information about the given `slackId` user.
module.exports.getUserInfo = function(slackId) {
  const data = storage.loadData();
  
  const userInfo = { ...userInfoDataTemplate };  
  const [ coffeeUserData ] = data.userData.filter(u => slackId === u.slackId);
  if (!coffeeUserData) {
    userInfo.isSubscribed = false;
    return userInfo;
  }
  userInfo.isSubscribed = true;
  userInfo.managerSlackId = coffeeUserData.managerSlackId || null;
  userInfo.coffeePartners = getCoffeePartners(slackId, data.pairs);
  return userInfo;
}

function getCoffeePartners(slackId, allPairs) {
  for (const pair of allPairs) {
    if (pair.includes(slackId)) {
      return pair.filter(u => slackId !== u);
    }
  }
  return [];
}

function addUserToData(slackUser, data) {
  console.log('adding', slackUser.id);
  if (module.exports.checkForUser(slackUser.id, data)) {
    console.warn(`not adding user ${slackUser.id} twice!`);
    return false;
  }
  
  // TODO(vrk): I think we don't want to save the real name of the user,
  // since that can change and we don't want to keep the stale value or have
  // to worry about updating it. We can just use Slack as the source of truth
  // when that's necessary.
  const userRecord = {
    slackId: slackUser.id,
    name: slackUser.real_name
    // managerSlackId
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
