const Console = require('../models/console');
const Studio = require('../models/studio');
const Game = require('../models/game');
const GameInstance = require('../models/gameInstance');

const async = require('async');
const { body, validationResult } = require('express-validator');

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

// Display Console creation form on GET
exports.console_create_get = function(req, res, next) {
  res.render('console_form', { title: 'Add Console' });
}

// Handle Console create on POST
exports.console_create_post = [
  // Validate and sanitize fields
  body("console_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Console name must be specified."),
  body("console_about")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Console 'about' must be specified."),
  body("console_date", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("console_form", {
        title: "Add Console",
        vgconsole: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create a Console object with escaped and trimmed data.
    const console = new Console({
      name: req.body.console_name,
      about: req.body.console_about,
      founded: req.body.console_founded,
    });
    console.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new studio record.
      res.redirect(console.url);
    });
  },
]

// Display Console delete form on GET
exports.console_delete_get = (req, res, next) => {
  async.parallel(
    {
      console(callback) {
        Console.findById(req.params.id).exec(callback);
      },
      console_games(callback) {
        Game.find({ console: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.console == null) {
        // No results
        res.redirect('/catalog/consoles');
      }
      // Successful, so render
      res.render('console_delete', {
        title: 'Delete Console',
        vgconsole: results.console,
        console_games: results.console_games,
      });
    }
  );
}

// Handle Console delete on POST
exports.console_delete_post = (req, res, next) => {
  async.parallel(
    {
      console(callback) {
        Console.findById(req.body.consoleid).exec(callback);
      },
      console_games(callback) {
        Game.find({ console: req.body.consoleid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.console_games.length > 0) {
        // Console has games. Render in same was as for GET route
        res.render('console_delete', {
          title: 'Delete Console',
          vgconsole: results.console,
          console_games: results.console_games,
        });
        return;
      }
      // Console has no games. Delete object and redirect to the list of consoles.
      Console.findByIdAndRemove(req.body.consoleid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to console list
        res.redirect('/catalog/consoles');
      });
    }
  );
}

// Handle Console update on GET
exports.console_update_get = (req, res, next) => {
  async.parallel(
    {
      console(callback) {
        Console.findById(req.params.id) 
          .populate('name')
          .populate('about')
          .populate('release')
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.console == null) {
        // No results
        const err = new Error('Console not found');
        err.status = 404;
        return next(err);
      }
      // Success
      res.render('console_form', {
        title: 'Update Console',
        vgconsole: results.console,
        console_name: results.console.name,
        console_about: results.console.about,
        console_released: results.console.release,
      });
    }
  );
}

// Handle console update on POST
exports.console_update_post = [
  // Validate and sanitize fields
  body("console_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Console name must be specified."),
  body("console_about")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Console 'about' must be specified."),
  body("console_date", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a Console object with escaped/trimmed data and old ID
    const console = new Console({
      name: req.body.console_name,
      about: req.body.console_about,
      release: req.body.console_released,
      _id: req.params.id, // This is required to prevent generating a new ID
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          console(callback) {
            Console.findById(req.params.id)
              .populate('name')
              .populate('about')
              .populate('release')
              .exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render('console_form', {
            title: 'Update Console',
            vgconsole: results.console,
            console_name: results.console.name,
            console_about: results.console.about,
            console_released: results.console.release,
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Console.findByIdAndUpdate(req.params.id, console, {}, (err, theconsole) => {
      if (err) {
        return next(err);
      }

      // Successful; redirect to console detail page
      res.redirect(theconsole.url);
    });
  },
];