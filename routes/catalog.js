const express = require('express');
const router = express.Router();

// Require controller modules
const console_controller = require('../controllers/consoleController');
const studio_controller = require('../controllers/studioController');
const game_controller = require('../controllers/gameController');
const gameInstance_controller = require('../controllers/gameInstanceController');

/// CONSOLE ROUTES ///

// GET catalog home page.
router.get('/', console_controller.index);

// GET request for list of all Console items.
router.get('/consoles', console_controller.console_list);

// GET request for Console details.
router.get('/consoles/:id', console_controller.console_detail);


/// STUDIO ROUTES /// 

// GET request for list of all Studio items
router.get('/studios', studio_controller.studio_list);

// GET request for creating Studio
router.get('/studios/create', studio_controller.studio_create_get);

// POST request for creating Studio
router.post('/studios/create', studio_controller.studio_create_post);

// GET request to delete Studio
router.get('/studios/:id/delete', studio_controller.studio_delete_get);

// GET request for Studio details
router.get('/studios/:id', studio_controller.studio_detail);


/// GAME ROUTES ///

// GET request for list of all Game items
router.get('/games', game_controller.game_list);

// GET request for Game details
router.get('/games/:id', game_controller.game_detail);


/// GAME INSTANCE ROUTES ///

// GET request for list of all Game Instance items
router.get('/listings', gameInstance_controller.gameInstance_list);

// GET request for Game Instance details
router.get('/listings/:id', gameInstance_controller.gameInstance_detail);

module.exports = router;