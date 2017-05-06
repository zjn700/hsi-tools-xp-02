var express = require('express');
var router = express.Router();
var path = require("path");


// create and loaad the project db
var Datastore = require('nedb'),
    dbNotLoaded = false,
    dbErr = null,
    dbn = new Datastore({ filename: path.join(__dirname, '..', '/data/hsi-projects'), autoload: true, onload : function(err) {
            if (err) {
                console.log(err);
                dbNotLoaded = true;
                dbErr = err;
            }
        } 
    });

///////// REST ///////////////////

router.get('/', function (req, res, next) {
    console.log(dbNotLoaded)
    if (dbNotLoaded) {
        console.log('DB Error')
        return res.status(500).json({
            title: "A database error occured",
            error: dbErr
        }); 
    }
    dbn.find({}).sort({ title: -1 }).exec(function (err, projects) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured",
                error: err
            });                
        }
        if (projects.length==0) {
            return res.status(500).json({
                title: "No projects found",
                obj: projects
            });           
        }
        res.status(201).json({
            message: "Success",
            obj: projects
        });
    });        
    
})

router.post('/', function (req, res, next) {
    if (dbNotLoaded) {
        console.log('DB Error -- cannot post')
        return res.status(500).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }

    var project = {
        title: req.body.title,
        abbreviation: req.body.abbreviation,
        description: req.body.description        
    }
    dbn.insert(project, function (err, project) {  
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured and the project was not created",
                error: err
            });                
        }
        res.status(201).json({
            message: "Project was created",
            obj: project
        });                

    });  
});

router.patch('/:id', function (req, res, next) {
  if (dbNotLoaded) {
      console.log('DB Error -- cannot patch')
      return res.status(500).json({
          title: "A database error occured -- your post was not made",
          error: dbErr
      }); 
  }
     
  var project = {
      title: req.body.title,
      abbreviation: req.body.abbreviation,
      description: req.body.description
  }
  console.log('project ' + project)
  dbn.update({ _id: req.body.id }, project, {}, function (err, numReplaced) {
      console.log('numReplaced')
      console.log(numReplaced)
      if (err) {
          console.log(err)
          return res.status(500).json({
              title: "An error occured while updating",
              error: err
          });    
      }    
      res.status(201).json({
          message: "Project was updated",
          obj: numReplaced
      });              
  });
  
});
    
router.delete('/:id', function (req, res, next) {
    // //// disable deleted
    // return res.status(200).json({
    //     title: "nope, no deletes"
    // });               
    
    if (dbNotLoaded) {
        console.log('DB Error -- cannot patch')
        return res.status(500).json({
            title: "A database error occured -- your post was not made",
            error: dbErr
        }); 
    }
        
    dbn.remove({ _id: req.params.id}, {}, function (err, numRemoved) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                title: "An error occured while deleting",
                error: err
            });    
        }    
        res.status(201).json({
            message: "Project was deleted",
            obj: numRemoved
        });
    });        
        
});

module.exports = router;
