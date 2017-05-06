var express = require('express');
var router = express.Router();
var path = require('path');

var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data/hsi-qnn'), autoload: true, onload : function(err) {
            if (err) {
                console.log(err);
                dbNotLoaded = true;
                dbErr = err;
            }
        } 
    });
    
/* GET questionnaires listing. */
router.get('/', function (req, res, next) {
    console.log(dbNotLoaded)
    if (dbNotLoaded) {
        console.log('DB Error')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    //dbn.find({}).sort({ title: -1 }).exec(function (err, qnns) {
    dbn.find({} ,function (err, qnns) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (qnns.length==0) {
            return res.status(500).json({
                title: "No questionnaires found",
                obj: qnns
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: qnns
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
    dbn.find({category: req.params.id}).sort({ sequence: 1 }).exec(function (err, qnns) {
    //dbn.find({category: req.params.id} ,function (err, qnns) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (qnns.length==0) {
            return res.status(500).json({
                title: "No questionnaires found",
                obj: qnns
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: qnns
        });
    });        
    
});
module.exports = router;
