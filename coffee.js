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
  // the full list of user ids
  users: ['id'],
  // extra data about each user
  userData: {
    id: {...baseUser},
  },
  // a list of every user pair from the previous weeks
  pastMatches: [
    // store weeks separately so we can drop the oldest week
    ['idA-idB'],
  ],
};

function userPairKey(userA, userB) {
  if (userB < userA) {
    return `${userB}-${userA}`;
  }
  return `${userA}-${userB}`;
}


function pairUsers(users, pastMatches) {
  const pastMatchesSet = new Set(pastMatches.flat());
  
  const pairs = []; // [ [id1, id2], [id3, id4] ] the actual result
  const matches = []; // this will become a new entry in pastMatches
  
  const shuffledUsers = shuffle(users); // we are biased towards early users, so keep it fair
  
  // who has been added to a group and shouldn't be considered for new groups
  const matchedUsersSet = new Set();
  
  for (const user of shuffledUsers) {
    if (matchedUsersSet.has(user)) continue;
    
    // find the first person in the list that we can match with and isn't matched with anybody else
    let match = null;
    for (const potentialUser of shuffledUsers) {
      if (potentialUser === user) continue;
      if (matchedUsersSet.has(potentialUser)) continue;
      if (pastMatchesSet.has(userPairKey(user, potentialUser))) continue;
      match = potentialUser;
      break;
    }
    
    if (match !== null) {
      // we did find a match
      matches.push(userPairKey(user, match));
      pairs.push([user, match]);
      matchedUsersSet.add(user);
      matchedUsersSet.add(match);
      
    } else if (matchedUsersSet.size === users.length - 1) {
      // we couldn't find anyone because we are the only unmatched person
      // pick a random group to stick them in
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      for (const otherUser of pair) {
        matches.push(userPairKey(user, otherUser));
      }
      pair.push(user);
      matchedUsersSet.add(user);
      
    } else {
      // we couldn't find anyone, remove the oldest history entry and try again
      return pairUsers(users, pastMatches.splice(1));
    }
  }
  
  return {pairs, pastMatches: [...pastMatches, matches]};
}

module.exports = {pairUsers};