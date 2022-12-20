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

// Display details for individual Game Instances
exports.gameInstance_detail = (req, res, next) => {
  GameInstance.findById(req.params.id) 
    .populate('game')
    .exec((err, gameinstance) => {
      if (err) {
        return next(err);
      }
      if (gameinstance == null) {
        // No results
        const err = new Error('Game listing not found');
        err.status = 404;
        return next
      }
      // Successful, so render
      res.render('gameInstance_detail', {
        title: gameinstance.game.name,
        gameinstance: gameinstance,
      });
    });
}