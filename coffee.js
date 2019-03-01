// data management around coffeetime users

const fs = require('fs');
const shuffle = require('array-shuffle');

const baseUser = {
  slackId: null,
  managerSlackId: null,
  interests: ''
};

const dataFormat = {
  // the full list of user ids
  users: [],
  // extra data about each user
  userData: {},
  // tracks past matches by week
  pastMatches: [],
};

function userPairKey(userA, userB) {
  if (userB < userA) {
    return `${userB}-${userA}`;
  }
  return `${userA}-${userB}`;
}

function pairUsers(users, pastMatches) {
  const pastMatchesSet = new Set([].concat(...pastMatches));
  
  const pairs = []; // [ [id1, id2], [id3, id4] ] the actual result
  const matches = []; // this will become a new entry in pastMatches
  
  const shuffledUsers = shuffle(users); // we are biased against the last user
  
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

function loadData() {
  try {
    const data = fs.readFileSync('coffee.json').toString('utf8');
    return { ...dataFormat, ...JSON.parse(data) };
  } catch (error) {
    console.warn(error);
    return dataFormat;
  }
}

function saveData(data) {
  fs.writeFileSync('coffee.json', JSON.stringify(data, null, 2));
}

let testUsers = [0,1,2,3,4,5,6,7,8,9];
let testPastMatches = [];
for (let i = 0; i < 10; ++i) {
  const { pairs, pastMatches } = pairUsers(testUsers, testPastMatches);
  console.log(JSON.stringify(pairs), pastMatches.length);
  testPastMatches = pastMatches;
}