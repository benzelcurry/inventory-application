const Studio = require('../models/studio');
const Game = require('../models/game');

const async = require('async');

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