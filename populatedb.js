#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
const Console = require('./models/console');
const Studio = require('./models/studio');
const Game = require('./models/game');
const GameInstance = require('./models/gameInstance');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var consoles = []
var studios = []
var games = []
var gameInstances = []

function consoleCreate(name, about, release, cb) {
  consoledetail = { name: name, about: about, release: release }

  const gameConsole = new Console(consoledetail);
       
  gameConsole.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Console: ' + gameConsole);
    consoles.push(consoles)
    cb(null, gameConsole)
  }  );
}

function studioCreate(name, location, about, founded, cb) {
  studiodetail = { name: name, location: location, about: about, founded: founded };

  const studio = new Studio(studiodetail);
       
  studio.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Studio: ' + studio);
    studios.push(studio)
    cb(null, studio);
  }   );
}

function gameCreate(name, studio, about, release, cb) {
  gamedetail = { name: name, studio: studio, about: about, release: release };

  const game = new Game(gamedetail);

  game.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Game: ' + game);
    games.push(game)
    cb(null, game)
  }  );
}


function gameInstanceCreate(game, condition, price, cb) {
  gameInstanceDetail = { game: game, condition: condition, price: price };
    
  const gameInstance = new GameInstance(gameInstanceDetail);    
  gameInstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING GameInstance: ' + gameInstance);
      cb(err, null)
      return
    }
    console.log('New GameInstance: ' + gameInstance);
    gameInstances.push(gameInstance);
    cb(null, gameInstance);
  }  );
}


function createConsoles(cb) {
    async.series([
        function(callback) {
          consoleCreate('NES', `Nintendo's first home console`, '1986-09-27', callback);
        },
        function(callback) {
          consoleCreate('SNES', `Nintendo's second home console`, '1990-11-21', callback);
        },
        ],
        // optional callback
        cb);
}


function createStudios(cb) {
    async.parallel([
        function(callback) {
          studioCreate('Nintendo', 'Kyoto, Japan', 'Japanese multinational video game company', '1889-09-23', callback);
        },
        ],
        // optional callback
        cb);
}


function createGames(cb) {
    async.parallel([
        function(callback) {
          gameCreate('Super Mario Bros.', studios[0], 'First entry in Super Mario Bros. series', '1985-09-13', callback);
        },
        function(callback) {
          gameCreate('The Legend of Zelda: A Link to the Past', studios[0], 'Third entry in The Legend of Zelda series', '1991-11-21', callback);
        },
    ],
    cb);
}


function createGameInstances(cb) {
    async.parallel([
        function(callback) {
          gameInstanceCreate(games[0], 'Mint', 250.99, callback);
        },
        function(callback) {
          gameInstanceCreate(games[0], 'NM (Near Mint)', 189.99, callback);
        },
        function(callback) {
          gameInstanceCreate(games[1], 'Mint', 301.99, callback);
        },
        function(callback) {
          gameInstanceCreate(games[1], 'GD (Good)', 50.49, callback);
        },
        ],
        // Optional callback
        cb);
}



async.series([
    createConsoles,
    createStudios,
    createGames,
    createGameInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Game Instances: ' + gameInstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});