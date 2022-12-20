const express = require('express');
const router = express.Router();

// Require controller modules
const console_controller = require('../controllers/consoleController');

/// CONSOLE ROUTES ///

// GET catalog home page.
router.get('/', console_controller.index);

// GET request for lists of all Console items.
router.get('/consoles', console_controller.console_list);

module.exports = router;