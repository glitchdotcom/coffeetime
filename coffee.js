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
  // extra data about each user like who their managers are and interests
  userData: {},
  // tracks past matches by week
  pastMatches: [],
};

// This function formats the pair generated and outputs a string with the pair
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
      // don't match people with themselves
      if (potentialUser === user) continue;
      // if the matched users set already has this user, don't match
      if (matchedUsersSet.has(potentialUser)) continue;
      // if they were paired in the recorded past, don't match
      if (pastMatchesSet.has(userPairKey(user, potentialUser))) continue;
      // ok looks like we can make a match since we checked those things
      match = potentialUser;
      break;
    }
    
    if (match !== null) {
      // we did find a match
      // put the match we just made in matches
      matches.push(userPairKey(user, match));
      // we put the pair we just made in pairs
      pairs.push([user, match]);
      // we record that we matched the user and their match already so we don't match them again this cycle
      matchedUsersSet.add(user);
      matchedUsersSet.add(match);
      
    } else if (matchedUsersSet.size === users.length - 1) {
      // we couldn't find anyone because we are the only unmatched person
      // pick a random group to stick them in
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      // so match each one of the randomly selected pair with this sad solo user
      for (const otherUser of pair) {
        matches.push(userPairKey(user, otherUser));
      }
      // put the sad solo user in the pair
      pair.push(user);
      // record that the sad solo user is now paired and not sad
      matchedUsersSet.add(user);
      
    } else {
      // we couldn't find anyone, remove the oldest history entry and try again
      // if you already was paired with everyone in the company
      // allow you to start pairing with people you've paired with in the past
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

let testUsers = [0,1,2,3,4,5,6,7,8,9, 11];
let testPastMatches = [];



for (let i = 0; i < 10; ++i) {
 
  const { pairs, pastMatches } = pairUsers(testUsers, testPastMatches);
 // console.log(JSON.stringify(pairs), pastMatches.length);
 // console.log(typeof pastMatches);
//  console.log(typeof pairs);
  //pairs is an array
  
  //console.log(pairs);


  testPastMatches = pastMatches;

}
  const pastMatchesSettest = new Set([].concat(...testPastMatches));

console.log(testPastMatches);
  console.log(pastMatchesSettest);


