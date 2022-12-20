const Game = require('../models/game');

const async = require('async');
const gameInstance = require('../models/gameInstance');

// Display lists of all Games
exports.game_list = function (req, res, next) {
  Game.find({}, 'name release')
    .sort({ release: 1 })
    .exec(function (err, list_games) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('game_list', { title: 'Game List', game_list: list_games })
    });
}

// Display detail page for a specific game
exports.game_detail = (req, res, next) => {
  async.parallel(
    {
      game(callback) {
        Game.findById(req.params.id) 
          .populate('studio')
          .populate('release')
          .populate('console')
          .exec(callback);
      },
      game_instance(callback) {
        gameInstance.find({ game: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results
        const err = new Error('Game not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('game_detail', {
        title: results.game.name,
        game: results.game,
        game_instances: results.game_instance,
      });
    }
  );
}