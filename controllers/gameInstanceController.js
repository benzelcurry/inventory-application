const GameInstance = require('../models/gameInstance');
const Game = require('../models/game');

const async = require('async');
const { body, validationResult } = require('express-validator');

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

// Display Game Instance listing create form on GET
exports.gameInstance_create_get = (req, res, next) => {
  Game.find({}, 'name').exec((err, games) => {
    if (err) {
      return next(err);
    }
    // Successful, so render
    res.render('gameInstance_form', {
      title: 'Create New Listing',
      game_list: games,
    });
  });
}

// Handle Game Instance listing creation on POST
exports.gameInstance_create_post = [
  // Validate and sanitize fields
  body("game", 'Game field must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price field must not be empty')
    .isFloat({ min: 0, max: 10000})
    .withMessage('Price must be between $0 and $10,000'),
  body('condition', 'You must select the condition of the game')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped and trimmed data.
    const gameinstance = new GameInstance({
      game: req.body.game,
      price: req.body.price,
      condition: req.body.condition,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          games(callback) {
            Game.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("gameInstance_form", {
            title: "Create New Listing",
            game_list: results.games,
            gameinstance,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save game.
    gameinstance.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new game record.
      res.redirect(gameinstance.url);
    });
  },
]

// Handle GET request for listing deletion form
exports.gameInstance_delete_get = (req, res, next) => {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === "admin" && password === "passw0rd")) {
    return reject();
  }
  
  async.parallel(
    {
      gameinstance(callback) {
        GameInstance.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.gameinstance == null) {
        // No results
        res.redirect('/catalog/listings');
      }
      // Successful, so render
      res.render('gameInstance_delete', {
        title: 'Delete Game Instance',
        gameinstance: results.gameinstance,
      });
    }
  );
}

// Handle POST request for listing deletion form
exports.gameInstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      gameinstance(callback) {
        GameInstance.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      GameInstance.findByIdAndRemove(req.body.gameinstanceid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to listings
        res.redirect('/catalog/listings');
      });
    }
  );
}

// Handle GET request for updating listings
exports.gameInstance_update_get = (req, res, next) => {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === "admin" && password === "passw0rd")) {
    return reject();
  }

  async.parallel(
    {
      gameinstance(callback) {
        GameInstance.findById(req.params.id).exec(callback);
      },
      game(callback) {
        Game.find(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.gameinstance == null) {
        const err = new Error('Listing not found');
        err.status = 404;
        return next(err);
      }

      res.render('gameInstance_form', {
        title: 'Update Listing',
        gameinstance: results.gameinstance,
        game_list: results.game,
        game: results.gameinstance.game,
        price: results.gameinstance.price,
        condition: results.gameinstance.condition,
      });
    }
  );
}

// Handle POST request for updating listings
exports.gameInstance_update_post = [
  body("game", 'Game field must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price field must not be empty')
    .isFloat({ min: 0, max: 10000})
    .withMessage('Price must be between $0 and $10,000'),
  body('condition', 'You must select the condition of the game')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a Game Instance object with escaped/trimmed data and old ID
    const gameinstance = new GameInstance({
      game: req.body.game,
      price: req.body.price,
      condition: req.body.condition,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          gameinstance(callback) {
            GameInstance.findById(req.params.id).exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render('gameInstance_form', {
            title: 'Update Listing',
            gameinstance: results.gameinstance,
            game_list: results.game,
            game: results.gameinstance.game,
            price: results.gameinstance.price,
            condition: results.gameinstance.condition,
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    GameInstance.findByIdAndUpdate(req.params.id, gameinstance, {}, (err, thelisting) => {
      if (err) {
        return next(err);
      }

      // Successful; redirect to the listing page
      res.redirect(thelisting.url);
    });
  }
];