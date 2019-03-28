
module.exports.scheduleAllCoffeeCrons = function(controller) {
  const teams = controller.storage.teams;
  teams.all((error, all_team_data) => {
    console.log(all_team_data);
  });
}
