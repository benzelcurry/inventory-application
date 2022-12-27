const Studio = require('../models/studio');
const Game = require('../models/game');

const async = require('async');
const { body, validationResult } = require('express-validator');
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
        const err = new Error('Studio not found');
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

// Display Studio create form on GET
exports.studio_create_get = (req, res, next) => {
  res.render('studio_form', { title: 'Add Studio' });
}

// Handle Studio create on POST
exports.studio_create_post = [
  // Validate and sanitize fields
  body("studio_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Studio name must be specified."),
  body("studio_about")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Studio 'about' must be specified."),
  body("studio_location")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Studio location name must be specified."),
  body("studio_date", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("studio_form", {
        title: "Add Studio",
        studio: true,
        studio_name: req.body.studio_name,
        studio_location: req.body.studio_location,
        studio_about: req.body.studio_about,
        studio_founded: req.body.studio_founded,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create a Studio object with escaped and trimmed data.
    const studio = new Studio({
      name: req.body.studio_name,
      about: req.body.studio_about,
      location: req.body.studio_location,
      founded: req.body.studio_founded,
    });
    studio.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new studio record.
      res.redirect(studio.url);
    });
  },
]

// Display Studio delete form on GET
exports.studio_delete_get = (req, res, next) => {
  async.parallel(
    {
      studio(callback) {
        Studio.findById(req.params.id).exec(callback);
      },
      studio_games(callback) {
        Game.find({ studio: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.studio == null) {
        // No results
        res.redirect('/catalog/studios');
      }
      // Successful, so render
      res.render('studio_delete', {
        title: 'Delete Studio',
        studio: results.studio,
        studio_games: results.studio_games,
      });
    }
  );
}

// Handle Studio delete on POST
exports.studio_delete_post = (req, res, next) => {
  async.parallel(
    {
      studio(callback) {
        Studio.findById(req.body.studioid).exec(callback);
      },
      studio_games(callback) {
        Game.find({ studio: req.body.studioid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.studio_games.length > 0) {
        // Studio has games. Render in same was as for GET route
        res.render('studio_delete', {
          title: 'Delete Studio',
          studio: results.studio,
          studio_games: results.studio_games,
        });
        return;
      }
      // Studio has no games. Delete object and redirect to the list of studios.
      Studio.findByIdAndRemove(req.body.studioid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to studio list
        res.redirect('/catalog/studios');
      });
    }
  );
}

// Handle studio update on GET
exports.studio_update_get = (req, res, next) => {
  async.parallel(
    {
      studio(callback) {
        Studio.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.studio == null) {
        const err = new Error('Studio not found');
        err.status = 404;
        return next(err);
      }
      // Success
      res.render('studio_form', {
        title: 'Update Studio',
        studio: results.studio,
        studio_name: results.studio.name,
        studio_location: results.studio.location,
        studio_about: results.studio.about,
        studio_founded: results.studio.founded,
      });
    }
  );
}

// Handle studio update on POST
exports.studio_update_post = [
  // Validate and sanitize fields
  body('studio_name', 'Studio name must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('studio_location', 'Studio location must be specified')
    .trim()
    .isLength({ min: 1 }),
  body('studio_about', 'Studio description must be specified')
    .trim()
    .isLength({ min: 1 }),
  body('studio_founded', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a Studio object with escaped/trimmed data and old ID
    const studio = new Studio({
      name: req.body.studio_name,
      location: req.body.studio_location,
      about: req.body.studio_about,
      founded: req.body.studio_founded,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          studio(callback) {
            Studio.findById(req.params.id).exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render('studio_form', {
            title: 'Update Studio',
            studio: results.studio,
            studio_name: results.studio.name,
            studio_location: results.studio.location,
            studio_about: results.studio.about,
            studio_founded: results.studio.founded,
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Studio.findByIdAndUpdate(req.params.id, studio, {}, (err, thestudio) => {
      if (err) {
        return next(err);
      }

      // Successful; redirect to the studio detail page
      res.redirect(thestudio.url);
    });
  },
];