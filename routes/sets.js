var express = require('express');
var router = express.Router();

//load query module
var query = require('../models/query');

// GET sets listing
router.get('/', function(req, res) {
	res.render('index', { title: 'Sets' });
});

// GET standard 20 question set
router.get('/standard/:format?', function(req, res) {
	// set specification for standard question set
	var setspec = [
	      { type: "A", count: 4 },
	      { type: "G", count: 11 },
	      { type: "Q", count: 1 },
	      { type: "R", count: 1 },
	      { type: "S", count: 1 },
	      { type: "V", count: 1 },
	      { type: "X", count: 1 }];
	
	var constraints =
    {
        shuffle: true,
        chapters: []
    }
	
	var questions = ''
	query.select_questions(setspec, constraints, function(err, questionlist) {
	     // render question set to the browser
	     res.render('sets/standard', { title: 'Standard 20 Question Set', questions: questionlist });
	});
});

module.exports = router;
