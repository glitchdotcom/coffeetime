const coffee = require('./coffee');
const jsc = require('jsverify');

function createFakeUsers(countUsers) {
  return Array.from({ length: countUsers }, (v, i) => i + 1);
}

test('coffee time should pair everyone', () => {
  
  jsc.assert(jsc.forall(jsc.nat, (countUsers) => {
    countUsers += 2;

    const users = createFakeUsers(countUsers);
    const coffeepairs = coffee.pairUsers(users);
    const pairs = coffeepairs.pairs;

    let people_in_pairs = new Set();
    for (let i = 0; i < pairs.length; i += 1) {
      for (let j = 0; j < pairs[i].length; j += 1) {
        people_in_pairs.add(pairs[i][j]);
      }
    }
    for (let i = 0; i < users.length; i += 1) {
      if (!people_in_pairs.has(users[i])) {
        return false;
      }
    }
    return true;
  }));
});
