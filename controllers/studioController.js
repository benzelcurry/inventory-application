const Studio = require('../models/studio');
const Game = require('../models/game');

const async = require('async');
const studio = require('../models/studio');

// Display list of all Studios
exports.studio_list = function (req, res, next) {
  Studio.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_studios) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('studio_list', {
        title: 'Studios',
        studio_list: list_studios,
      });
    });
}

// Display detail page for a specific studio
exports.studio_detail = (req, res, next) => {
  async.parallel(
    {
      studio(callback) {
        Studio.findById(req.params.id).exec(callback);
      },
      // Might need to tweak this to work; wrote down field names by memory
      studio_games(callback) {
        Game.find({ studio: req.params.id }, "name about").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage
        return next(err);
      }
      if (results.studio == null) {
        // No results
        const err = new Error('Author not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('studio_detail', {
        studio: results.studio,
        games: results.studio_games,
      });
    }
  );
}