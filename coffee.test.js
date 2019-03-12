const fs = require('fs');
const coffee = require('./coffee');

function createFakeUsers() {
  const randomNumber = Math.floor(Math.random() * (54 - 4)) + 4;
  return Array.from({ length: randomNumber }, (v, i) => i + 1);
}

test('coffee time should pair everyone', () => {
  const users = createFakeUsers();
  const coffeepairs = coffee.pairUsers(users, '');
  const pairs = coffeepairs.pairs;
  var flattened = pairs.reduce(function(accumulator, currentValue) {
    return accumulator.concat(currentValue);
  }, []);
  expect(flattened).toEqual(expect.arrayContaining(users));
});

test('coffee time should not create a pair with only one person', () => {
  const users = createFakeUsers();
  const coffeepairs = coffee.pairUsers(users, '');
  const pairs = coffeepairs.pairs;
  expect(pairs.every((x) => x.length >= 2)).toBe(true);
});

test('coffee time should not pair anyone with themseleves', () => {
  const users = createFakeUsers();
  const coffeepairs = coffee.pairUsers(users, '');
  const pairs = coffeepairs.pairs;
  pairs.forEach(function(pair) {
    const uniques = pair.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    });
    expect(uniques).toEqual(pair);
  });
});

//this is a test function to see if the data from the stringy past pairs works the same
function numberArray(stringArray) {
  let flattened = stringArray.reduce(function(accumulator, currentValue) {
    return accumulator.concat(currentValue);
  }, []);

  return flattened.map((x) => {
    return x.split('-').map(Number);
  });
}

test('coffee time should not pair people it has already paired unless it has to', () => {
  const users = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const past = ['6-14', '1-12', '5-10', '2-4', '8-11', '3-13', '7-9'];


  // let's pair again
  const coffeepairs = coffee.pairUsers(users, past);
  //let's turn our original past one into an array of arrays
  const converted = numberArray(past);
  const pairs = coffeepairs.pairs;
  pairs.forEach(function(pair) {
    let test = converted.filter((item) => {
      return item.every((e) => pair.includes(e));
    });

    expect(test.length).toEqual(0);
  });
});


test('createUserList should make a simple array of user IDs out of the data in the JSON', () => {
  const jsonUsers = {"userData": [{"id": 1, "name": "Melissa", "slackid": "something"}, {"id": 2, "name": "Lyzi", "slackid": "dsafadsihew"}, {"id": 3, "name": "Sean", "slackid": "meow33"}, {"id": 4, "name": "Potch", "slackid": "324234e"}]};
  const userList = [1, 2, 3, 4];
  expect(coffee.createUserList(jsonUsers)).toEqual(userList);
});