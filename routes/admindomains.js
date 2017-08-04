var express = require('express');
var router = express.Router();
var path = require('path');
var jwt = require("jsonwebtoken");

var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data-admin/hsi-domains-test'), autoload: true, onload : function(err) {
            if (err) {
                console.log(err);
                dbNotLoaded = true;
                dbErr = err;
            }
        } 
    });
    
/* GET questionnaires listing. */

router.get('/xxx', function(req, res, next) {
  res.send('here in domains get');
});

router.get('/dummy', function(req, res, next) {
    return res.status(200).json({
            title: "Use existing domains",
        }); 
});

router.get('/', function (req, res, next) {
    console.log(dbNotLoaded)
    if (dbNotLoaded) {
        console.log('DB Error')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    
    dbn.find({}).sort({ qnn: 1, sequence: 1}).exec(function (err, domains) {
    //dbn.find({} ,function (err, domains) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (domains.length==0) {
            return res.status(500).json({
                title: "No domains found",
                obj: domains
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: domains
        });
    });        
    
});

router.get('/:id', function (req, res, next) {
    console.log(dbNotLoaded)
    if (dbNotLoaded) {
        console.log('DB Error')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    console.log(req.params.id)
    dbn.find({qnn: req.params.id}).sort({ sequence: 1 }).exec(function (err, domains) {
    //dbn.find({category: req.params.id} ,function (err, domains) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err

            });                
        }
        if (domains.length==0) {
            return res.status(207).json({
                title: "No domains found",
                obj: domains
            });           
        }
        console.log(domains.length)
        res.status(201).json({
            message: "Success",
            obj: domains
        });
    });        
    
});


router.use('/', function (req, res, next) {
    jwt.verify(req.query.token, 'zz-hsi-tool', function(err, decoded){
        if (err) {
            return res.status('401').json({
                message: 'Not Authenticated',
                error: err
            })
        }
        next();
    })
    
});


router.post('/', function (req, res, next) {
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
    
    // var titleTest = req.body.title;
    // if ( (titleTest === null) || (titleTest.replace(/\s/g,'') == "")) { 
    //     return res.status(500).json({
    //             title: "You must enter a title for the project.",
    //         });   
    // }
    var decoded = jwt.decode(req.query.token)
    console.log(decoded.user._id)

    var domain = {
        qnn: req.body.qnn,
        title: req.body.title, 
        sequence: req.body.sequence
    }
    
    dbn.insert(domain, function (err, domain) {  
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured and the domain was not added",
                error: err
            });                
        }
        res.status(201).json({
            message: "Domain was added",
            obj: domain
        });                

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
    
    dbn.update({$and: [{ qnn: req.body.qnn }, {sequence: req.body.sequence}]}, { $set: { 
          title: req.body.title,
          sequence: req.body.sequence,
          questions: req.body.questions
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
