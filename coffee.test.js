const fs = require('fs');
const coffee = require('./coffee');

const jsonData = fs.readFileSync('coffee.json').toString('utf8');
const data = JSON.parse(jsonData);

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
  expect(pairs.every(x => x.length >= 2)).toBe(true);
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


test('coffee time should not pair people it has already paired unless it has to', () => {
  const users = [1, 2, 3, 4, 5];
  const past = 		[
				["3-8", "2-7", "4-11", "1-5", "0-9", "6-8", "3-6"],
				["3-5", "0-7", "6-11", "1-2", "4-8", "7-9", "0-9"],
				["3-4", "2-5", "8-11", "1-9", "0-6", "7-11", "7-8"],
				["0-4", "3-9", "2-6", "5-8", "1-11", "5-7", "7-8"],
				["1-6", "2-11", "5-9", "0-8", "3-7", "4-6", "1-4"]
			]
		
  const coffeepairsFirst = coffee.pairUsers(users, '');

  
});
