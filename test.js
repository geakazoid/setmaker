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

query.select_questions(setspec, constraints, function(err, questionlist) {
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
});