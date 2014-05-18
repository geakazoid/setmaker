var sqlite3 = require("sqlite3");
var async = require("async");

var database_filename = "db/questions-matthew.db";


// Carefully taken from:
// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array, callback) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  callback(null, array);
}
 
function retrieve_question_info(type, constraints, callback) {
    var query_by_type = "select * from questions where type=?";
    var array_of_args = [type];
    if (constraints.chapters.length != 0)
    {
        query_by_type += "and chapter in (?"
        array_of_args.push(constraints.chapters[constraints.chapters.length -1]);
        for (var i = constraints.chapters.length - 2; i >= 0; i--) {
            array_of_args.push(constraints.chapters[i]);
            query_by_type += ",?";
        };
        query_by_type += ")";
    }
    query_by_type += ";";

    db.all(query_by_type, array_of_args, function db_callback(err, rows) {
        //Callback for db all
        var info = [];
        if (err) throw err;
        async.each(rows, function(row) {
            //Step to perform for each db result returned
            info.push(row);
        });
        callback(null, info);
    });
}

function choose_n_random_ids(list, n, constraints, callback)
{
    if (list.length < n)
        throw "Not enough questions or type for count!";
    shuffle(list, function shuffle_callback(err, shuffled_list) {
        var chosen = [];
        //Callback after shuffle
        for (var i = 0; i < n; i++) {
            chosen.push(shuffled_list[i]);
        }
        callback(null,chosen);
    }); //end shuffle
}

function select_questions (distribution, constraints, callback) {
    async.concat(distribution, function (each_type, callback) {
        if (each_type.count > 0) {
            retrieve_question_info(each_type.type, constraints, function retrieve_callback(err, list) {
                choose_n_random_ids(list, each_type.count, constraints, function choose_callback(err, chosenlist) {
                    callback(null, chosenlist);
                });
            });
        }
    }, function(err, idlist) {
        if (!constraints.shuffle)
        {
            callback(null, idlist);
        } else {
            shuffle(idlist, function(err, shuffled_list) {
                callback(null, shuffled_list);
            });
        }
    });
}

var db = new sqlite3.Database(database_filename, sqlite3.OPEN_READONLY);
//db.on('trace', function(text) {console.log(text);});
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

select_questions(setspec, constraints, function(err, questionlist) {
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

db.close();