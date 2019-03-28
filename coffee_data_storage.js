const fs = require('fs');

const DATA_PATH = './.data/coffee.json';

const dataFormat = {
  "pairs": [],
  "userData": [],
  "pastMatches": []
}

module.exports.loadData = function() {
  if (fs.existsSync(DATA_PATH)) {
    try {
      const data = fs.readFileSync(DATA_PATH).toString('utf8');
      return { ...dataFormat, ...JSON.parse(data) };
    } catch (error) {
      console.warn("didn't load data file:");
      console.warn(error);
      return { ...dataFormat }
    }
  } else {
    return { ...dataFormat };
  }
};

module.exports.addUser = function(slackUser) {
  let data = module.exports.loadData();
  if (checkForUser(slackUser.id, data)) {
    console.warn(`not adding user ${slackUser.id} twice!`);
    return false;
  }
  console.log('adding', slackUser.id);
  data = addUserToData(slackUser, data);
  module.exports.saveData(data);
  return true;
}

module.exports.saveData = function(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), function (err) {
    if (err) {
      console.warn(err);
    }
  });
};

module.exports.deleteAllData = function() {
  module.exports.saveData(dataFormat);
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