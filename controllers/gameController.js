const Game = require('../models/game');

const async = require('async');

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