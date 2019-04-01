const schedule = require('node-schedule');
const coffee = require('./../util/coffee.js');

module.exports.scheduleCoffeeCron = function(bot) {
  // See usage: https://github.com/node-schedule/node-schedule#usage
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = 2;  // Tuesday
  rule.hour = 9;
  rule.minute = 0;
  
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
