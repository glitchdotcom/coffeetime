const fs = require('fs');
const coffee = require('./coffee');

function createFakeUsers() {
  const randomNumber = Math.floor(Math.random() * (54 - 4)) + 4;
  return Array.from({ length: randomNumber }, (v, i) => i + 1);
}

let fakeSlackUser = {
  id: 'UGDNVTFDW',

  team_id: 'TGEF6256E',

  name: 'potch',

  deleted: false,

  color: '3c989f',

  real_name: 'Potch',

  tz: 'America/Los_Angeles',

  tz_label: 'Pacific Daylight Time',

  tz_offset: -25200,
};

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

//this is a test function to see if the data from the stringy past pairs works the same as an array of arrays
// this turns an array of strings containing number hyphen number into an array of arrays containing the two numbers
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
//@todo
test('coffee time should remove past pair if it has run out of possible new pairs', () => {
  const users = [1,2,3,4,5,6]
  // I think this is all possibly matches???
  const past = ['1-2','1-3','1-4','1-5','1-6','2-3','2-4','2-5','2-6','3-4','3-5','3-6','4-5','4-6','5-6']
  const coffeepairs = coffee.pairUsers(users, past);
  // ok our new pairs should also be the past ones
  const convertedPast = numberArray(past);
  console.log(convertedPast);
  const pairs = coffeepairs.pairs;
  pairs.forEach(function(pair) {
    console.log(pair);
    expect(convertedPast).toEqual(pair);
  });

});

/*test('coffee time should return full data structure', () => {
});*/

/*test('subscribe should add users', () => {
});*/

/*test('subscribe should not add duplicate users', () => {
});*/

test('createUserList should make a simple array of user IDs out of the data in the JSON', () => {
  const jsonUsers = {
    userData: [
      { id: 1, name: 'Melissa', slackid: 'something' },
      { id: 2, name: 'Lyzi', slackid: 'dsafadsihew' },
      { id: 3, name: 'Sean', slackid: 'meow33' },
      { id: 4, name: 'Potch', slackid: '324234e' },
    ],
  };
  const userList = [1, 2, 3, 4];
  expect(coffee.createUserList(jsonUsers)).toEqual(userList);
});
