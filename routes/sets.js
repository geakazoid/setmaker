var express = require('express');
var router = express.Router();

// load query module
var query = require('../models/query');

// GET sets listing
router.get('/', function(req, res) {
	res.render('index', { title: 'Sets' });
});

// GET form to create new set(s)
router.get('/new', function(req, res) {
	var question_types = [{label: "According To", type: "a", total: "216", count: "4"},
	                      {label: "General",      type: "g", total: "904", count: "11"},
	                      {label: "Situation",    type: "s", total: "129", count: "1"},
	                      {label: "Quote",        type: "q", total: "94",  count: "1"},
	                      {label: "Reference",    type: "r", total: "94",  count: "1"},
	                      {label: "Verse",        type: "v", total: "94",  count: "1"},
	                      {label: "Context",      type: "x", total: "69",  count: "1"}];
	var book = "matthew";

    query.get_max_chapter_by_table(book, function(err, books) {
		res.render('sets/new', { title: 'Create A Set',
			                        qts: question_types,
			                        bks: books });    	
    })
});

// POST form values to create new set(s)
router.post('/create', function(req, res) {
	
	// default values
	var shuffle = true;
	var chapters = [];
	var num_a = 4;
	var num_g = 11;
	var num_q = 1;
	var num_r = 1;
	var num_s = 1;
	var num_v = 1;
	var num_x = 1;
	
	// check question counts
	if (req.body.num_a != '') { num_a = req.body.num_a }
	if (req.body.num_g != '') { num_g = req.body.num_g }
	if (req.body.num_q != '') { num_q = req.body.num_q }
	if (req.body.num_r != '') { num_r = req.body.num_r }
	if (req.body.num_s != '') { num_s = req.body.num_s }
	if (req.body.num_v != '') { num_v = req.body.num_v }
	if (req.body.num_x != '') { num_x = req.body.num_x }
	
	// check question order
	if (req.body.question_order === 'Sequential') { shuffle = false }
	// check chapters
	if (typeof req.body.Matthew !== 'undefined') { chapters = req.body.Matthew }

	// set specification for standard question set
	var setspec = [
	      { type: "A", count: num_a },
	      { type: "G", count: num_g },
	      { type: "Q", count: num_q },
	      { type: "R", count: num_r },
	      { type: "S", count: num_s },
	      { type: "V", count: num_v },
	      { type: "X", count: num_x }];
	
	var constraints =
    {
        shuffle: shuffle,
        chapters: chapters
    }
	
	var questions = ''
	query.select_questions(setspec, constraints, function(err, questionlist) {
	     // render question set to the browser
	     res.render('sets/standard', { title: req.body.set_title, questions: questionlist });
	});
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
