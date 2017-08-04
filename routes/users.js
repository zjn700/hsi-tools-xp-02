var express = require('express');
var router = express.Router();
var path = require("path");
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");

// create and loaad the user db
var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data/hsi-users'), autoload: true, onload : function(err) {
            if (err) {
                console.log(err);
                dbNotLoaded = true;
                dbErr = err;
            }
        } 
    });

router.get('/:id', function(req, res, next) {
    if (dbNotLoaded) {
        console.log('Database error -- cannot post')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    dbn.findOne({ _id: req.params.id }, function (err, user) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (user.length==0) {
            return res.status(500).json({
                title: "No user found",
                obj: user
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: user
        });
    });
});


router.post('/', function (req, res, next) {
    if (dbNotLoaded) {
        console.log('Database error -- cannot post')
        return res.status(500).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }
    dbn.findOne({ email: req.body.email }, function (err, doc) {
      if (doc) {                    // If no document is found, doc is null
        return res.status(203).json({
                title: "Email already exists",
                error: true,
                obj: req.body.email
            });
        } else {
            var user = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: bcrypt.hashSync(req.body.password, 10),
                email: req.body.email, 
            }
            dbn.insert(user, function (err, user) {  
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        title: "An error occured and the user was not added",
                        error: err
                    });                
                }
                res.status(201).json({
                    message: "New user was added",
                    obj: user
                });                
            });
        }
    });
});

router.post('/signin', function (req, res, next) {
    dbn.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured and the user could not be signed in",
                error: err
            });                
        }
        if (!user){
            return res.status(401).json({
                title: "Login failed",
                email: req.body.email,
                error: {message: "Invalid login credentials"}
            });                
            
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            console.log('pwd');
            return res.status(401).json({
                title: "Login failed",
                error: {message: "Invalid login credentials"}
            });    
        }
        var token = jwt.sign({user: user}, 'zz-hsi-tool', {expiresIn: 36000});  // 36000 = 10 hrs, 43200 = 12 hrs;7200 = 2 hrs
        res.status(200).json({
            message: 'Successful log in',
            token: token,
            userId: user._id
        })
    });


});

router.patch('/', function (req, res, next) {
    console.log('req.body')
    console.log(req)
    console.log(req.body)
    if (dbNotLoaded) {
        console.log('DB Error -- cannot post')
        return res.status(500).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }
    
    var decoded = jwt.decode(req.query.token)
    console.log(decoded.user._id)
    
    console.log('req.body.questions')
    console.log(req.body.questions)
    
    dbn.update({ _id: req.body.id }, { $set: { 
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          office: req.body.office,
          phone: req.body.phone
        }}, {}, function (err, numReplaced) {
    
            //dbn.update({ _id: req.body.id }, project, {}, function (err, numReplaced) {
            console.log('numReplaced')
            console.log(numReplaced)
            if (err) {
              console.log(err)
              return res.status(400).json({
                  title: "An error occured while updating",
                  error: err
              });    
            }    
            res.status(201).json({
              message: "Domain was updated",
              numReplaced: numReplaced
            });              
        });  
});

module.exports = router;

