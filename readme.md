# CoffeeTime 2 

@TODOs
 marked with MVP if critical for release
 Backlog if not
 
 For MVP (the first most basic release), we're going to 
 - populate the userlist by calling the API and adding it to coffee.json manually
 - run coffeetime manually using a command
 
 
# Code Backlog
- add a help command
- document how to take ownership/administer
- create homepage
- use slash commands
- remove unused id field
- confirm unsubscribe works



# Dev details
 - bot is running for dev purposes on https://glitchcoffeetime.slack.com as `melissa_coffetime_bot`
 - server doesn't auto restart because it caused issues when we worked together, edit .trigger-rebuild to make it restart, rename watch.json to watch-disabled to disabled this "feature"
 - it has a lot of files from botkit we don't need and should clean up but right now all the actual code for the coffeetime bot conversations is in `skills/coffeetime.js`
 - the pairing code is in `coffee.js` (creates pairs)
 - there are some tests (needs improvement) you can run on the command line with `npm run test`
 - when you save coffee `coffee.json` via the function in `coffee.js`  you need to run `refresh` to see the data