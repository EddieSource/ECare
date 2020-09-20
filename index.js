var express = require('express');
var app = express();
var path = require('path')
var mongodb = require('mongodb');
var uname = 'abc';
var cookie = require('cookie-parser');
app.use(cookie());
// Block the header from containing information about the server
app.disable('x-powered-by');
// Set up Handlebars
var handlebars = require('express-handlebars').create({
    defaultLayout: ''
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// Create a directory called public and then a directory named img inside of it app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    // Point at the home.handlebars view
    res.render('Welcome');
});

app.get('/login', function(req, res) {
    if (req.cookies['username'] && req.cookies['password']) {

        res.redirect('loginsuccess');
    } else {
        res.render('login');
    }
});

app.get('/loginsuccess', function(req, res){
    if(!req.cookies.username && !req.cookies.password){
        res.redirect('login');
    }
    else{
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/ECare';
  var a = req.body.username;
  MongoClient.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('items');
      var a = req.cookies.username;
      collection.find({username: a}).toArray(function (err, result) {
        if(result.length){
          res.render('loginsuccess', {"products" : result, "user": result[0]});
        } else {
          res.render('loginsuccess', {"user": result[0]});
        }

      });
    }
});
}



//
// console.log(req.params);
// var MongoClient = mongodb.MongoClient;
// var url = 'mongodb://localhost:27017/ECare';
// MongoClient.connect(url, function(err, db) {
//     if (err) {
//         console.log('Unable to connect to the Server:', err);
//     } else {
//         console.log("Connected to Server");
//         var collection = db.collection('items');
//         var o_id = new mongodb.ObjectId(req.params.productId);
//         collection.find({
//             _id: o_id
//         }).toArray(function(err, result) {
//             if (err) {
//                 res.send(err);
//             } else {
//                 var context = {'product' : result[0] };
//                 console.log(context);
//                 res.render('product-details', {
//                     // Pass the returned database documents to HBS
//                     "product": result[0]
//                 });
//             }
//         });
//     }
// });






});


app.get('/home', function(req, res) {
    res.render('Welcome');
});

app.get('/cart', function(req, res) {
    res.render('cart');
});

app.get('/checkout', function(req, res) {
    res.render('checkout');
});

// app.get('/product-details', function(req, res) {
//
//     res.render('product-details');
// });

app.get('/shop', function(req, res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log('Connected to Server');
            var collection = db.collection('items');
            collection.find().toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.render('shop', {
                        // Pass the returned database documents to HBS
                        "products": result,
                    });
                }
            });
        }
    });
});












app.use(express.static(path.join(__dirname, '/public')));

app.get('/validate', function(req, res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    console.log(req.body);
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log('Connected to Server');
            var collection = db.collection('users');
            collection.find({
                username: req.query.uname,
                password: req.query.psw
            }).toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else if (result.length == 1) {
                    res.cookie('username', req.query.uname);
                    res.cookie('password', req.query.psw);
                    res.redirect('loginsuccess');
                } else {
                    res.redirect('login');
                }
            });
        }
    });
});


app.get('/delcookie', function(req, res) {
    res.clearCookie('username');
    res.redirect('login');
});

app.get('/signup', function(req, res) {
    res.clearCookie('username');
    res.render('signup');

});

app.post('/signout', function(req, res) {
    res.clearCookie('username');
    res.clearCookie('password');
    res.redirect('shop');

});

app.post('/adduser', function(req, res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) { // Connect to the server
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log('Connected to Server');
            var collection = db.collection('users');
            collection.find({
                username: req.body.uname
            }).toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else if (result.length) {
                    res.redirect('signup');
                } else if (!result.length) {
                    var collection = db.collection('users');
                    var user = {
                        username: req.body.uname,
                        password: req.body.psw,
                        email: req.body.email,
                    };
                    collection.insert([user], function(err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("login")
                        }
                        db.close();
                    });
                }
            });
        }
    });
});

app.get('/additem', function(req, res) {
    // if(!req.cookie){
    //     res.redirect('login');
    // }
    res.render('additem');
});


app.get('/listcookies', function(req, res) {
    console.log(req.cookies.username);
    res.send('Look in console');
});

app.post('/add', function(req, res) {
    console.log("HERE")
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) { // Connect to the server
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log('Connected to Server');
            if (err) {
                res.send(err);
            } else {
                var collection = db.collection('items');
                var item = {
                    username: req.cookies.username,
                    name: req.body.item,
                    price: req.body.price,
                    FirstPic: req.body.firstpic,
                    SecondPic: req.body.secondpic,
                    ThirdPic: req.body.thirdpic,
                    FourthPic: req.body.fourthpic,
                    Link: req.body.link,
                    Description: req.body.desc
                };

                collection.insert([item], function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("loginsuccess");
                    }
                    db.close();
                });
            }
        }
    });
});

app.post('/edit/:productId', function(req, res) {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) { // Connect to the server
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log('Connected to Server');
            if (err) {
                res.send(err);
            } else {
                var collection = db.collection('items');
                var o_id = new mongodb.ObjectId(req.params.productId);
                var item = {
                    username: req.cookies.username,
                    name: req.body.item,
                    price: req.body.price,
                    FirstPic: req.body.firstpic,
                    SecondPic: req.body.secondpic,
                    ThirdPic: req.body.thirdpic,
                    FourthPic: req.body.fourthpic,
                    Link: req.body.link,
                    Description: req.body.desc
                };

                collection.updateOne({_id: o_id}, item, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Document Updated!");
                        res.redirect("../loginsuccess");
                    }
                    db.close();
                });
            }
        }
    });
});

app.get('/edititem/:productId', function(req, res) {
    console.log(req.params);
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log("Connected to Server");
            var collection = db.collection('items');
            var o_id = new mongodb.ObjectId(req.params.productId);
            collection.find({
                _id: o_id
            }).toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    var context = {'product' : result[0] };
                    console.log(context);
                    res.render('edititem', {
                        // Pass the returned database documents to HBS
                        "product": result[0]
                    });
                }
            });
        }
    });
});

app.post('/remove/:productId', function(req, res) {
    console.log("HELLO");
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) { // Connect to the server
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log('Connected to Server');
            if (err) {
                res.send(err);
            } else {
                var collection = db.collection('items');
                var o_id = new mongodb.ObjectId(req.params.productId);

                collection.deleteOne({_id: o_id}, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Document Removed!");
                        res.redirect("../loginsuccess");
                    }
                    db.close();
                });
            }
        }
    });
});


app.get('/product-details', function(req, res) {
    console.log(req.params);
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log("Connected to Server");
            var collection = db.collection('items');

            collection.find().toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    var i = Math.floor(Math.random()*(result.length));
                    console.log(i);
                    var context = {'product' : result[i] };
                    console.log(context);
                    res.render('product-details', {
                        // Pass the returned database documents to HBS
                        "product": result[i]
                    });
                }
            });
        }
    });
});




app.get('/product-details/:productId', function(req, res) {
    console.log(req.params);
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/ECare';
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Unable to connect to the Server:', err);
        } else {
            console.log("Connected to Server");
            var collection = db.collection('items');
            var o_id = new mongodb.ObjectId(req.params.productId);
            collection.find({
                _id: o_id
            }).toArray(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    var context = {'product' : result[0] };
                    console.log(context);
                    res.render('product-details', {
                        // Pass the returned database documents to HBS
                        "product": result[0]
                    });
                }
            });
        }
    });
});

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate');
});
