const storage = require('./../util/coffee.js');

module.exports.scheduleCoffeeCron = function(bot) {
  console.log('scheduling for', bot);
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
