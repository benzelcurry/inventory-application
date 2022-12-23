const Game = require('../models/game');
const Studio = require('../models/studio');
const Console = require('../models/console');
const GameInstance = require('../models/gameInstance');

const async = require('async');
const { body, validationResult } = require('express-validator');
const game = require('../models/game');

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
        GameInstance.find({ game: req.params.id }).exec(callback);
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

// Display Game creation form on GET
exports.game_create_get = (req, res, next) => {
  async.parallel(
    {
      consoles(callback) {
        Console.find(callback);
      },
      studios(callback) {
        Studio.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render('game_form', {
        title: 'Add Game',
        consoles: results.consoles,
        studios: results.studios,
      });
    }
  );
}

// Handle Game creation on POST
exports.game_create_post = [
  // Validate and sanitize fields
  body("game_name", 'Name field must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("game_about", 'About field must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('studio', 'Studio field must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('console', 'Console field must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("game_released", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped and trimmed data.
    const game = new Game({
      name: req.body.game_name,
      studio: req.body.studio,
      console: req.body.console,
      about: req.body.game_about,
      release: req.body.game_released,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          studios(callback) {
            Studio.find(callback);
          },
          consoles(callback) {
            Console.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("game_form", {
            title: "Add Game",
            studios: results.studios,
            consoles: results.consoles,
            game,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save game.
    game.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new game record.
      res.redirect(game.url);
    });
  },
]

// Display Game deletion prompt on GET
exports.game_delete_get = (req, res, next) => {
  async.parallel(
    {
      game(callback) {
        Game.findById(req.params.id).exec(callback);
      },
      game_instances(callback) {
        GameInstance.find({ game: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results
        res.redirect('/catalog/games');
      }
      // Successful, so render
      res.render('game_delete', {
        title: 'Delete Game',
        game: results.game,
        game_instances: results.game_instances,
      });
    }
  );
}

// Handle Game deletion on POST
exports.game_delete_post = (req, res, next) => {
  async.parallel(
    {
      game(callback) {
        Game.findById(req.body.id).exec(callback);
      },
      game_instances(callback) {
        GameInstance.find({ game: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.game_instances.length > 0) {
        // Game has instances. Render in same way as for GET route
        res.render('game_delete', {
          title: 'Delete Game',
          game: results.book,
          game_instances: results.game_instances,
        });
        return;
      }
      // Game has no instances. Delete object and redirect to the list
      Game.findByIdAndRemove(req.body.gameid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to game list
        res.redirect('/catalog/games');
      });
    }
  );
}