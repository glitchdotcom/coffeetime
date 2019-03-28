// data management around coffeetime users

const shuffle = require('array-shuffle');
const storage = require('./storage');
const user = require('./user');

// This function formats the pair generated and outputs a string with the pair
function userPairKey(userA, userB) {
  if (userB < userA) {
    return `${userB}-${userA}`;
  }
  return `${userA}-${userB}`;
}

// Runs coffeetime matchmaking and returns a new list of pairs, plus updated past matches
// Does not save the pairings yet.
function runCoffeeTime() {
  const data = storage.loadData();
  const allUserSlackIds = user.getSlackIdsForAllUsers();
  const blockedMatches = createBlockedMatches(data);
  const { pastMatches } = data;
  
  return pairUsers(allUserSlackIds, pastMatches, blockedMatches);
}

// Updates the database with new pairs and matches.
function saveNewPairings(pairs, pastMatches) {
  const data = storage.loadData();
  const newData = Object.assign({}, data, { pairs, pastMatches });
  storage.saveData(newData);  
}

// Returns an object with:
// {
//   pairs: updated newest pairings,
//   pastMatches: updated past matches.
// }
function pairUsers(allUserSlackIds, pastMatches=[], blockedMatches=[]) {

  const blockedMatchesSet = new Set([].concat(blockedMatches, ...pastMatches));

  const pairs = []; // [ [id1, id2], [id3, id4] ] the actual result
  const matches = []; // this will become a new entry in pastMatches

  const shuffledUsers = shuffle(allUserSlackIds); // we are biased against the last user

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
      if (blockedMatchesSet.has(userPairKey(user, potentialUser))) continue;
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
    } else if (matchedUsersSet.size === allUserSlackIds.length - 1) {
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
      // if you already were paired with everyone in the company
      // allow you to start pairing with people you've paired with in the past
      return pairUsers(allUserSlackIds, pastMatches.splice(1), blockedMatches);
    }
  }

  return { pairs, pastMatches: [...pastMatches, matches] };
}

function sendMessageToUsers(bot, slackIds, message) {
  bot.api.conversations.open({ users: slackIds }, (error, response) => {
    
    bot.startConversation({ channel: response.channel.id, }, (err, convo) => {
      convo.say(message);
      convo.activate();
    });
  });
}

function broadcastCoffeeGroups(bot, pairs, message) {
  for (const slackIds of pairs) {
    sendMessageToUsers(bot, slackIds, message);
  }
}

function createBlockedMatches(data) {
  const blockedMatchesSet = new Set();
  data.userData.forEach(user => {
    if (user.managerSlackId) {
      blockedMatchesSet.add(userPairKey(user.slackId, user.managerSlackId));
    }
  });
  return [...blockedMatchesSet];
}

module.exports = {
  pairUsers,  // Exported for testing
  createBlockedMatches,  // Exported for testing
  runCoffeeTime,
  saveNewPairings,
  broadcastCoffeeGroups
};
