const fs = require('fs');
const coffee = require('./coffee');

const jsonData = fs.readFileSync('coffee.json').toString('utf8')
const data = JSON.parse(jsonData);



test('coffee time should pair everyone', () => {
  const users = [1, 2, 3, 4]
  const coffeepairs = coffee.pairUsers(users, '');
  console.log(coffeepairs);
    console.log(coffeepairs.pairs);

const pairs = coffeepairs.pairs;
var flattened = pairs.reduce(
  function(accumulator, currentValue) {
    return accumulator.concat(currentValue);
  },
  []
);
  expect(flattened).toEqual(expect.arrayContaining(users))

});
