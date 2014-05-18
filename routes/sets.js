var express = require('express');
var router = express.Router();

// GET sets listing
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

// GET standard 20 question set
router.get('/standard/:format?', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
