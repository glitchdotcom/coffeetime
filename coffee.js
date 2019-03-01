// data management around coffeetime users

const fs = require('fs');
const shuffle = require('array-shuffle');

function loadData(datastore) {
  const json = datastore.get('coffee');
  return JSON.parse(json);
}

function saveData(datastore, data) {
  const json = JSON.stringify(data);
  datastore.set('coffee', json);
}

const baseUser = {
  slackId: null,
  managerSlackId: null,
  interests: ''
};

const dataFormat = {
  users: ['slackId'],
  userData: {
    slackId: {...baseUser},
  },
  pastMatches: [{
    'slackIdA-slackIdB': false,
  }],
};

function userPairKey(userA, userB) {
  if (userB < userA) {
    return `${userB}-${userA}`;
  }
  return `${userA}-${userB}`;
}


function pairUsers(users, pastMatches) {
  const combinedMatches = Object.assign({}, ...pastMatches);
  const pairs = [];
  const matches = {};
  
  const shuffledUsers = shuffle(users);
  const matchedUsers = new Set();
  
  for (const user of shuffledUsers) {
    if (matchedUsers.has(user)) continue;
    
    // find the first person in the list that we can match with and isn't matched with anybody else
    let match = null;
    for (const potentialUser of shuffledUsers) {
      if (potentialUser === user) continue;
      if (matchedUsers.has(potentialUser)) continue;
      if (combinedMatches[userPairKey(user, potentialUser)]) continue;
      if (matches[userPairKey(user, potentialUser)]) continue;
      match = potentialUser;
      break;
    }
    
    if (match !== null) {
      // we did find a match
      matches[userPairKey(user, match)] = true;
      pairs.push([user, match]);
      matchedUsers.add(user);
      matchedUsers.add(match);
      
    } else if (matchedUsers.size === users.length - 1) {
      // we couldn't find anyone because we are the only unmatched person
      // pick a random group to stick them in
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      for (const otherUser of pair) {
        matches[userPairKey(user, otherUser)] = true;
      }
      pair.push(user);
      matchedUsers.add(user);
      
    } else {
      // we couldn't find anyone, remove the oldest history entry and try again
      return pairUsers(users, pastMatches.splice(1));
    }
  }
  
  return {pairs, pastMatches: [...pastMatches, matches]};
}

module.exports = {pairUsers};