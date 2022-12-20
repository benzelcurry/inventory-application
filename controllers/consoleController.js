const Console = require('../models/console');
const Studio = require('../models/studio');
const Game = require('../models/game');
const GameInstance = require('../models/gameInstance');

const async = require('async');

exports.index = (req, res) => {
  async.parallel(
    {
      console_count(callback) {
        Console.countDocuments({}, callback); // Passes an empty object as match condition to find all documents within collection
      },
      studio_count(callback) {
        Studio.countDocuments({}, callback);
      },
      game_count(callback) {
        Game.countDocuments({}, callback);
      },
      gameInstance_count(callback) {
        GameInstance.countDocuments({}, callback);
      }
    },
    (err, results) => {
      res.render('index', {
        title: 'Retro Game eStore',
        error: err,
        data: results,
      });
    }
  );
}

// Display list of all Consoles
exports.console_list = function (req, res, next) {
  Console.find()
    .sort([['release', 'ascending']])
    .exec(function (err, list_consoles) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('console_list', {
        title: 'Console List',
        console_list: list_consoles,
      });
    });
}

// Display detail paige for a specific Console
// Will need to update if I link games to Console
exports.console_detail = (req, res, next) => {
  async.parallel(
    {
      console(callback) {
        Console.findById(req.params.id).exec(callback);
      },
      console_games(callback) {
        Game.find({ console: req.params.id }, "name about release").exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        // Error in API usage
        return next(err);
      }
      if (results.console == null) {
        // No results
        const err = new Error('Console not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('console_detail', {
        title: 'Console Info',
        // Using 'vgconsole' because 'console' is a reserved word in Pug
        vgconsole: results.console,
        console_games: results.console_games,
      });
    }
  );
}