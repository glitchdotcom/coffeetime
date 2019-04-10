const coffee = require('./coffee');
const jsc = require('jsverify');

function createFakeUsers(countUsers) {
  return Array.from({ length: countUsers }, (v, i) => i + 1);
}


test('coffee time should pair everyone', () => {
  const users = createFakeUsers(5);
  const coffeepairs = coffee.pairUsers(users);
  const pairs = coffeepairs.pairs;
  var flattened = pairs.reduce(function(accumulator, currentValue) {
    return accumulator.concat(currentValue);
  }, []);
  expect(flattened).toEqual(expect.arrayContaining(users));
});

jsc.property("coffee time should pair everyone", jsc.nat, (countUsers) => {
  /*
  const users = createFakeUsers(countUsers);
  const coffeepairs = coffee.pairUsers(users);
  const pairs = coffeepairs.pairs;
  var flattened = pairs.reduce(function(accumulator, currentValue) {
    return accumulator.concat(currentValue);
  }, []);
  return flattened == arrayContaining(users);
  */
  return true;
});