const fs = require('fs');
const coffee = require('./coffee');

const data = fs.readFileSync('coffee.json').toString('utf8')

test('coffee time should pair everyone', () => {
  expect(coffee.pairUsers(data)).toBe(3);
});
