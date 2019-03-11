const fs = require('fs');
const coffee = require('./coffee');

const jsonData = fs.readFileSync('coffee.json').toString('utf8')
const data = JSON.parse(jsonData);



test('coffee time should pair everyone', () => {
   var { userData } = data;

 var { pastMatches } = data;
  expect(coffee.pairUsers(userData, pastMatches)).toEqual(3);
});
