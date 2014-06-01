// load query module
var query = require('./models/query');

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
        chapters: [12, 13, 14]
    }

/* query.select_questions(setspec, constraints, function(err, questionlist) {
    for (var i = 0; i < questionlist.length; i++) {
        var q = questionlist[i];
        console.log(q.type + " " + (i+1) + ": " + q.question);
        if (q.startverse == q.endverse) {
            console.log("  A: " + q.answer + " (" + q.book + " " 
                + q.chapter + ":" + q.startverse + ")\n");            
        } else {
            console.log("  A: " + q.answer + " (" + q.book + " " 
                + q.chapter + ":" + q.startverse + "-" 
                + q.endverse + ")\n");            
        }
     }; 
}); */

var idnum = 123;

var idlist = [12, 13, 14];

/*
query.get_question_uses(idnum, function(err, uses) {
  console.log("Question " + idnum + " has been used " + uses + " times.");
  query.increment_single_question_uses(idnum, function(err) {
    console.log("Incrementing usage...");
    query.get_question_uses(idnum, function(err, uses) {
      console.log("Question " + idnum + " now has been used " + uses + " times.");
    })
  });
}); */

query.increment_list_question_uses(idlist, function(err) {
  async.forEach(idlist, function (item, callback) { 
    query.get_question_uses(idnum, function(err, uses) {
      console.log("Question " + idnum + " now has been used " + uses + " times.");
      callback(); // tell async that the iterator has completed
    }, function(err) {});
  });  
});
