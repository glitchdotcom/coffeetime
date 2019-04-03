const schedule = require('node-schedule');
const coffee = require('./../util/coffee.js');

// TODO: save jobs by team id
module.exports.scheduleCoffeeCron = function(bot) {
  // See usage: https://github.com/node-schedule/node-schedule#usage
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = 3;  // Wednesday
  rule.hour = 14;
  rule.minute = 42;
  console.log('hello!');
  
  schedule.scheduleJob(rule, () => {
    console.log('Running coffee time~~~');
    coffee.runCoffeeTime(bot);
  });
}

module.exports.scheduleAllCoffeeCrons = function(controller) {
  const teams = controller.storage.teams;
  teams.all((error, allTeamData) => {
    for (const team of allTeamData) {
      // Get the bot for the team.
      const bot = controller.spawn({
        token: team.bot.token
      });
      module.exports.scheduleCoffeeCron(bot);
    }
  });
}
