const fs = require('fs');
const coffee = require('./coffee');

// @TODO refactor so they aren't slow, using mocking
// some mocks
function createFakeUsers() {
  const randomNumber = Math.floor(Math.random() * (54 - 4)) + 4;
  return Array.from({ length: randomNumber }, (v, i) => i + 1);
}


let mockSlackUser = {
  id: 'slackidwhatever',

  team_id: 'TGEF6256E',

  name: 'potch',

  deleted: false,

  color: '3c989f',

  real_name: 'Potch',

  tz: 'America/Los_Angeles',

  tz_label: 'Pacific Daylight Time',

  tz_offset: -25200,
};

  const mockJsonUsers = {
    userData: [
      { name: 'Melissa', slackId: 'slackid123' },
      { name: 'Lyzi', slackId: 'slackid1234' },
      {  name: 'Sean', slackId: 'slackidmeow' },
      { name: 'Potch', slackId: 'slackidwhatever' }
    ],
  };

  const mockJasonUsers2 = {
    userData: [
      { name: 'Melissa', slackId: 'slackid123' },
      { name: 'Lyzi', slackId: 'slackid1234' },
      {  name: 'Sean', slackId: 'slackidmeow' }
    ],
  };

  const mockJsonUsersWithManager = {
    userData: [
      { name: 'Melissa', slackId: 'slackid123', managerSlackId: 'slackidmeow' },
      { name: 'Lyzi', slackId: 'slackid1234' },
      { name: 'Sean', slackId: 'slackidmeow' }
    ],
  };



test('coffee time should pair everyone', () => {
  const users = createFakeUsers();
  const coffeepairs = coffee.pairUsers(users);
  const pairs = coffeepairs.pairs;
  var flattened = pairs.reduce(function(accumulator, currentValue) {
    return accumulator.concat(currentValue);
  }, []);
  expect(flattened).toEqual(expect.arrayContaining(users));
});

test('coffee time should not create a pair with only one person', () => {
  const users = createFakeUsers();
  const coffeepairs = coffee.pairUsers(users);
  const pairs = coffeepairs.pairs;
  expect(pairs.every((x) => x.length >= 2)).toBe(true);
});

test('coffee time should not pair anyone with themseleves', () => {
  const users = createFakeUsers();
  const coffeepairs = coffee.pairUsers(users);
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

test('coffee time should use past pairings if it has run through every possible pairing', () => {
  const users = [1, 2, 3, 4, 5, 6];
  // I think this is all possibly matches???
  const past = ['1-2', '1-3', '1-4', '1-5', '1-6', '2-3', '2-4', '2-5', '2-6', '3-4', '3-5', '3-6', '4-5', '4-6', '5-6'];
  // convert our past pairs into an array of numbers
  const converted = past.map((x) => {
    return x.split('-').map(Number);
  });
  // create some new pairs
  const coffeepairs = coffee.pairUsers(users, past);
  const pairs = coffeepairs.pairs;
  const pastMatchesNew = coffeepairs.pastMatches;

  pairs.forEach(function(pair) {
    let test = converted.filter((item) => {
      return item.every((e) => pair.includes(e));
    });

    expect(test.length).toBeGreaterThan(0);
  });
  //make sure past matches was also altered
  const convertPastMatchesNew = numberArray(pastMatchesNew);
  expect(convertPastMatchesNew.length).toBeLessThan(converted.length);

});

test('coffee time should not ever pair someone with their manager', () => {
  const data = mockJsonUsersWithManager;
  const users = coffee.createUserList(data);
  const blockedMatches = coffee.createBlockedMatches(data);
  let pastMatches = [];
  for (let i = 0; i < 10; ++i) {
    const result = coffee.pairUsers(users, pastMatches, blockedMatches);
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  }
});

/*test('coffee time should return full data structure', () => {
});*/

test('check for duplicates should return true if the user list already contains the user', () => {
  
    expect(coffee.checkForDuplicates(mockSlackUser, mockJsonUsers)).toBe(true);
    expect(coffee.checkForDuplicates(mockSlackUser, mockJasonUsers2)).toBe(false);


});

test('add user to data should return the data with the new user', () => {
  const newData = coffee.addUserToData(mockSlackUser, mockJasonUsers2);
  
  // now we can use check for duplicates to make sure it's in there :)
  expect(coffee.checkForDuplicates(mockSlackUser, newData)).toBe(true);

});



/*test('subscribe should not add duplicate users', () => {
});*/

test('createUserList should make a simple array of user IDs out of the data in the JSON', () => {

  const userList = ["slackid123", "slackid1234", "slackidmeow", "slackidwhatever"];
  expect(coffee.createUserList(mockJsonUsers)).toEqual(userList);
});


/*test('User list should match user ids ', () => {

 
});*/

/*test('largestId should get updated when you add new users', () => {

 
});*/

test('createBlockedMatches should make a pastMatches style array of matches to avoid', () => {
  const blockedMatches = ['slackid123-slackidmeow'];
  expect(coffee.createBlockedMatches(mockJsonUsersWithManager)).toEqual(blockedMatches);
});
