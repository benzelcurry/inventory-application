const express = require('express');
const router = express.Router();

// Require controller modules
const console_controller = require('../controllers/consoleController');
const game_controller = require('../controllers/gameController');
const gameInstance_controller = require('../controllers/gameInstanceController');

/// CONSOLE ROUTES ///

// GET catalog home page.
router.get('/', console_controller.index);

// GET request for list of all Console items.
router.get('/consoles', console_controller.console_list);

// GET request for Console details.
router.get('/consoles/:id', console_controller.console_detail);


/// GAME ROUTES ///

// GET request for list of all Game items
router.get('/games', game_controller.game_list);

// GET request for Game details
router.get('/games/:id', game_controller.game_detail);


/// GAME INSTANCE ROUTES ///

// GET request for list of all Game Instance items
router.get('/listings', gameInstance_controller.gameInstance_list);

module.exports = router;