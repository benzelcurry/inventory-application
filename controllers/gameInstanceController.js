const GameInstance = require('../models/gameInstance');
const Game = require('../models/game');

const async = require('async');

// Display list of all Game Instances
exports.gameInstance_list = function (req, res, next) {
  GameInstance.find()
    .populate('game')
    .exec(function (err, list_gameInstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('gameInstance_list', {
        title: 'Game Instance List',
        gameInstance_list: list_gameInstances,
      });
    });
}