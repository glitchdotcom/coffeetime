const fs = require('fs');
const coffee = require('./coffee');

const data = fs.readFileSync('coffee.json').toString('utf8')

test('coffee time should pair everyone', () => {
  
 var { pastMatches } = data;
  console.log(pastMatches); 
  expect(coffee.pairUsers(data.pastMatches)).toBe(3);
});
