const schedule = require('node-schedule');
const coffee = require('./../util/coffee.js');


// System time is ahead of NYC time by +4 hours
const ET_TIMEZONE_OFFSET = 4;

// TODO: save jobs by team id
module.exports.scheduleCoffeeCron = function(bot) {
  // See usage: https://github.com/node-schedule/node-schedule#usage
  const rule = new schedule.RecurrenceRule();
  // TODO: Move this back to Monday.
  rule.dayOfWeek = 2;  // Tuesday
  rule.hour = 10 + ET_TIMEZONE_OFFSET; // 10am NYC time
  rule.minute = 16;
  
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
