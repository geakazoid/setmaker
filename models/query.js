var sqlite3 = require("sqlite3");
var async = require("async");

var database_filename = "db/questions-matthew.db";
var db = new sqlite3.Database(database_filename, sqlite3);
//db.on('trace', function(text) {console.log(text);});

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
 
function database_query_to_array(query, column, callback) {
    db.all(query, function (err, result) {
        if (err) throw err;
        async.concat(result, function (each_entry, callback) {
            callback(null, each_entry[column]);
        }, function(err, list) {
            callback(null, list);
        });
    });
}

function get_question_by_id(id, callback) {
    var query_by_id = "select * from matthew where id=?";
    db.get(query_by_id, id, function db_id_callback(err, row) {
        if (err) throw err;
        callback(null, row);
    });
}

function retrieve_question_info(type, constraints, callback) {
    var query_by_type = "select * from matthew where type=?";
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

exports.select_questions = function select_questions (distribution, constraints, callback) {
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

exports.get_question_counts_by_type = function get_question_counts_by_type (typelist, constraints, callback) {
    async.concat(typelist, function (each_type, callback) {
        retrieve_question_info(each_type, constraints, function retrieve_callback(err, list) {
            callback(null, {type: each_type, count: list.length});
        });
    }, function(err, counts) {
        callback(null, counts);
    });
}

exports.get_question_uses = function get_question_uses(id, callback) {
    get_question_by_id(id, function(err, qinfo) {
        callback(null, qinfo.uses);
    })
}

exports.increment_single_question_uses = function increment_single_question_uses(id, callback) {
    var inc_uses = "update matthew set uses = uses + 1 where id=?";
    db.run(inc_uses, id, function db_uses_inc_callback(err, row) {
        if (err) throw err;
        callback(null);
    });
}

exports.increment_list_question_uses = function increment_list_question_uses(idlist, callback) {
    async.forEach(idlist, function(item, callback) {
        exports.increment_single_question_uses(item, function(err) {
            callback();
        });
    });
}

exports.get_books_in_table = function get_books_in_table(tableid, callback) {
    var query_books = "select book from " + tableid + " group by book";
    database_query_to_array(query_books, "book", function(err, list) {
        if (err) throw err;
        callback(null, list);
    });
}

exports.get_max_chapter_for_book = function get_max_chapter_for_book(tableid, book, callback) {
    var query_max = "select max(chapter) as maxchap from " + tableid + " where book = '" + book + "'";
    db.get(query_max, function (err, result) {
        if (err) throw err;
        callback(null, result.maxchap);
    });
}

exports.get_max_chapter_by_table = function get_max_chapter_by_table(tableid, callback) {
    exports.get_books_in_table(tableid, function (err, booklist) {
        async.concat(booklist, function (item, callback) {
            exports.get_max_chapter_for_book(tableid, item, function (err, maxchap) {
                if (err) throw err;
                callback(null, {book:item, count:maxchap});
            });
        }, function(err, maxchapters) {
            callback(null, maxchapters);
        }); 
    });
}

exports.get_active_books = function get_active_books(callback) {
    var query_books = "select name from books where active='true'";
    database_query_to_array(query_books, "name", function(err, list) {
        if (err) throw err;
        callback(null, list);
    });
}
