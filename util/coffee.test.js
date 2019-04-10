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

test('pair everyone in a property-based way', () => {
  jsc.assert(jsc.forall(jsc.nat, (countUsers) => {
    const users = createFakeUsers(countUsers);
    const coffeepairs = coffee.pairUsers(users);
    const pairs = coffeepairs.pairs;
    
    var flattened = pairs.reduce(function(accumulator, currentValue) {
      return accumulator.concat(currentValue);
    }, []);
    for (let i = 0; i < flattened.length; i += 1) {
      
    }
    return deepEqual(flattened, users);
  }));
});
