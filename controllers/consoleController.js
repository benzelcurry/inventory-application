const Console = require('../models/console');
const async = require('async');

// Display list of all Consoles
exports.console_list = function (req, res, next) => {
  Console.find()
    .sort(['release', 'ascending'])
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
      res.render('author_detail', {
        title: 'Console Info',
        console: results.console
      });
    }
  );
}