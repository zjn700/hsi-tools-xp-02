var express = require('express');
var router = express.Router();
var path = require('path');

var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data/hsi-domains'), autoload: true, onload : function(err) {
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
            return res.status(500).json({
                title: "No questionnaires found",
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
module.exports = router;
